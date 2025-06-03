
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

const createSaleFromOrder = async (order) => {
  if (!order || !order.id || !order.order_items) {
    console.error('ordersSlice: Invalid order data for sale creation:', order);
    return { error: 'Invalid order data for sale creation.', success: false };
  }

  const saleData = {
    order_id: order.id,
    branch_id: order.branch_id,
    user_id: order.user_id,
    customer_name: order.customer_name || order.users?.name,
    total_amount: order.total_amount,
    sale_date: new Date().toISOString(),
  };

  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert(saleData)
    .select()
    .single();

  if (saleError) {
    if (saleError.code === '23505') { 
      console.warn(`ordersSlice: Sale already exists for order_id: ${order.id}. Skipping.`);
      return { success: true, message: 'Sale already exists.', data: null };
    }
    console.error('ordersSlice: Error creating sale:', saleError);
    return { error: saleError.message, success: false };
  }

  if (sale && order.order_items.length > 0) {
    const saleItemsToInsert = order.order_items.map(item => ({
      sale_id: sale.id,
      product_id: item.product_id || item.products?.id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
    }));

    const { error: saleItemsError } = await supabase
      .from('sale_items')
      .insert(saleItemsToInsert);

    if (saleItemsError) {
      console.error('ordersSlice: Error creating sale items:', saleItemsError);
      await supabase.from('sales').delete().eq('id', sale.id);
      return { error: `Error creating sale items: ${saleItemsError.message}. Sale creation rolled back.`, success: false };
    }
  }
  return { success: true, data: sale };
};


export const ordersSlice = (set, get) => ({
  orders: [],
  isLoadingOrders: false, 
  ordersError: null,
  orderSubscription: null,

  subscribeToOrderChanges: (branchId = null) => {
    if (get().orderSubscription) {
      console.log('ordersSlice: Existing subscription found. May need to handle branch changes or resubscribe.');
      // For now, we don't automatically unsubscribe/resubscribe if branchId changes.
      // This could be a point of enhancement if needed.
      // return;
    }

    const channel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'orders',
          filter: branchId ? `branch_id=eq.${branchId}` : undefined
        },
        async (payload) => {
          console.log('ordersSlice: Real-time change received!', payload);
          const currentOrders = get().orders;

          const fetchFullOrderDetails = async (orderId) => {
            const { data: fullOrder, error } = await supabase
              .from('orders')
              .select(`
                *,
                customer_name,
                users ( id, name, email ),
                branches ( id, name ),
                order_items (
                  *,
                  add_ons,
                  products ( id, name, image_url, stock_control_type )
                )
              `)
              .eq('id', orderId)
              .single();
            if (error) {
              console.error('ordersSlice: Error fetching full order details for real-time update:', error);
              toast({ variant: "destructive", title: "Error de Datos", description: "No se pudieron cargar detalles completos del pedido en tiempo real."});
              return null;
            }
            return fullOrder;
          };

          if (payload.eventType === 'INSERT') {
            const newOrderBasic = payload.new;
            const newOrderDetails = await fetchFullOrderDetails(newOrderBasic.id);
            if (newOrderDetails && !currentOrders.find(o => o.id === newOrderDetails.id)) {
              set({ orders: [newOrderDetails, ...currentOrders] });
              toast({
                title: "Nuevo Pedido Recibido!",
                description: `Pedido #${newOrderDetails.id.substring(0,5)} para ${newOrderDetails.customer_name || newOrderDetails.users?.name || 'Cliente'}.`,
                className: "bg-blue-500 text-white"
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrderBasic = payload.new;
            const updatedOrderDetails = await fetchFullOrderDetails(updatedOrderBasic.id);
            if (updatedOrderDetails) {
              const existingOrder = currentOrders.find(o => o.id === updatedOrderDetails.id);
              set({
                orders: currentOrders.map(o =>
                  o.id === updatedOrderDetails.id ? { ...o, ...updatedOrderDetails } : o
                ),
              });
              if (existingOrder && existingOrder.status !== updatedOrderDetails.status) {
                toast({
                  title: "Pedido Actualizado",
                  description: `El estado del pedido #${updatedOrderDetails.id.substring(0,5)} ha cambiado a ${updatedOrderDetails.status}.`
                });
              } else if (existingOrder) { // It's an update, but maybe not status
                 toast({
                  title: "Pedido Modificado",
                  description: `El pedido #${updatedOrderDetails.id.substring(0,5)} ha sido modificado.`
                });
              }
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedOrder = payload.old;
            if (deletedOrder && deletedOrder.id) {
                 set({ orders: currentOrders.filter(o => o.id !== deletedOrder.id) });
                 toast({
                    title: "Pedido Eliminado",
                    description: `El pedido #${deletedOrder.id.substring(0,5)} ha sido eliminado.`
                });
            }
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('ordersSlice: Successfully subscribed to order changes!');
        }
        if (status === 'SUBSCRIPTION_ERROR') {
          console.error('ordersSlice: Supabase subscription error:', err);
          set({ ordersError: 'Error en la suscripción en tiempo real.' });
          toast({ variant: "destructive", title: "Error de Conexión", description: "No se pudo conectar para actualizaciones en tiempo real." });
        }
      });

    set({ orderSubscription: channel });
  },

  unsubscribeFromOrderChanges: async () => {
    const sub = get().orderSubscription;
    if (sub) {
      try {
        await supabase.removeChannel(sub);
        console.log('ordersSlice: Unsubscribed from order changes.');
        set({ orderSubscription: null });
      } catch (error) {
        console.error('ordersSlice: Error unsubscribing', error);
        // Optionally, inform the user or set an error state
        toast({ variant: "destructive", title: "Error de Desuscripción", description: "No se pudo detener las actualizaciones en tiempo real." });
      }
    } else {
      console.log('ordersSlice: No active subscription to unsubscribe from.');
    }
  },

  fetchOrders: async (branchId = null) => {
    set({ isLoadingOrders: true, ordersError: null });
    if (!supabase) {
      set({ ordersError: "Supabase client not initialized", isLoadingOrders: false });
      toast({ variant: "destructive", title: "Error", description: "Error de conexión con el servidor (Supabase no inicializado)." });
      return { success: false, error: "Supabase client not initialized" };
    }
    
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          customer_name, 
          users ( id, name, email ),
          branches ( id, name ),
          order_items (
            *,
            add_ons,
            products ( id, name, image_url, stock_control_type )
          )
        `)
        .order('created_at', { ascending: false });

      if (branchId) {
        query = query.eq('branch_id', branchId);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error('ordersSlice: Error fetching orders:', error);
        set({ ordersError: error.message, isLoadingOrders: false });
        toast({ variant: "destructive", title: "Error al Cargar Pedidos", description: error.message });
        return { success: false, error: error.message };
      }
      set({ orders: data || [], isLoadingOrders: false });
      return { success: true, data };
    } catch (e) {
      console.error('ordersSlice: Exception during fetchOrders:', e);
      set({ ordersError: "Error de red o inesperado al cargar pedidos.", isLoadingOrders: false });
      toast({ variant: "destructive", title: "Error de Red", description: "No se pudieron cargar los pedidos. Verifica tu conexión." });
      return { success: false, error: e.message };
    }
  },

  createOrder: async (orderData) => {
    set({ isLoadingOrders: true, ordersError: null });
    if (!supabase) {
      set({ ordersError: "Supabase client not initialized", isLoadingOrders: false });
      toast({ variant: "destructive", title: "Error", description: "Error de conexión con el servidor (Supabase no inicializado)." });
      return { success: false, error: "Supabase client not initialized" };
    }
    const { orderItems, ...mainOrderData } = orderData;

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(mainOrderData)
        .select()
        .single();

      if (orderError) {
        console.error('ordersSlice: Error creating order:', orderError);
        set({ ordersError: orderError.message, isLoadingOrders: false });
        toast({ variant: "destructive", title: "Error al Crear Pedido", description: orderError.message });
        return { success: false, error: orderError.message };
      }

      if (order && orderItems && orderItems.length > 0) {
        const itemsToInsert = orderItems.map(item => ({
          order_id: order.id,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.price, 
          notes: item.notes,
          add_ons: item.add_ons,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(itemsToInsert);

        if (itemsError) {
          console.error('ordersSlice: Error creating order items:', itemsError);
          await supabase.from('orders').delete().eq('id', order.id);
          set({ ordersError: `Error creating order items: ${itemsError.message}. Order creation rolled back.`, isLoadingOrders: false });
          toast({ variant: "destructive", title: "Error en Items del Pedido", description: `No se pudieron guardar los items: ${itemsError.message}. Pedido revertido.` });
          return { success: false, error: `Error creating order items: ${itemsError.message}. Order creation rolled back.` };
        }
      }
      await get().fetchOrders(mainOrderData.branch_id); 
      set({ isLoadingOrders: false });
      toast({ title: "Pedido Creado", description: "El pedido se ha registrado exitosamente." });
      return { success: true, data: order };
    } catch (e) {
      console.error("ordersSlice: Exception during order creation:", e);
      set({ ordersError: "Error de red o inesperado al crear el pedido.", isLoadingOrders: false });
      toast({ variant: "destructive", title: "Error de Red", description: "No se pudo crear el pedido. Verifica tu conexión." });
      return { success: false, error: e.message };
    }
  },

  updateOrderStatus: async (orderId, newStatus) => {
    if (!supabase) {
      set({ ordersError: "Supabase client not initialized" });
      toast({ variant: "destructive", title: "Error", description: "Error de conexión con el servidor (Supabase no inicializado)." });
      return { success: false, error: "Supabase client not initialized" };
    }
    
    const orders = get().orders;
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      set({ ordersError: "Order not found locally." });
      toast({ variant: "destructive", title: "Error", description: "Pedido no encontrado para actualizar." });
      return { success: false, error: "Order not found locally." };
    }
    const originalOrder = { ...orders[orderIndex] };
    const originalStatus = originalOrder.status;

    set(state => ({
      orders: state.orders.map(o => 
        o.id === orderId ? { ...o, status: newStatus, _isUpdating: true } : o
      ),
      isLoadingOrders: true, 
      ordersError: null
    }));
    
    try {    
      const { data: updatedOrderData, error: updateError } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
        .select(`
          *,
          customer_name,
          users ( id, name, email ),
          branches ( id, name ),
          order_items (
            *,
            add_ons,
            product_id,
            quantity,
            unit_price,
            products ( id, name, image_url, stock_control_type )
          )
        `)
        .single();
      
      if (updateError) {
        console.error('ordersSlice: Error updating order status:', updateError);
        set(state => ({
          orders: state.orders.map(o => 
            o.id === orderId ? { ...o, status: originalStatus, _isUpdating: false } : o
          ),
          isLoadingOrders: false,
          ordersError: updateError.message
        }));
        toast({ variant: "destructive", title: "Error al Actualizar Estado", description: `No se pudo actualizar el pedido: ${updateError.message}. Intenta de nuevo.` });
        return { success: false, error: updateError.message, isOptimisticRevert: true };
      }

      let stockDecreaseResult = { success: true, errors: [] };
      if (updatedOrderData && newStatus === 'En preparación' && get().decreaseStockForOrder) {
        stockDecreaseResult = await get().decreaseStockForOrder(updatedOrderData);
        if (!stockDecreaseResult.success) {
          console.warn('ordersSlice: Stock decrease failed or had issues:', stockDecreaseResult.errors);
        }
      }

      let saleCreationResult = { success: true, message: null, error: null };
      if (updatedOrderData && newStatus === 'Entregado') {
        saleCreationResult = await createSaleFromOrder(updatedOrderData);
        if (!saleCreationResult.success && saleCreationResult.message !== 'Sale already exists.') { 
          console.error('ordersSlice: Failed to create sale from order:', saleCreationResult.error);
        }
      }
      
      set(state => ({
        orders: state.orders.map(o => 
          o.id === orderId ? { ...updatedOrderData, ...o, status: newStatus, _isUpdating: false } : o 
        ),
        isLoadingOrders: false
      }));
      
      const finalResult = { success: true, data: updatedOrderData };
      let toastDescription = `Pedido #${orderId.substring(0,5)} actualizado a "${newStatus}".`;

      if (!stockDecreaseResult.success && stockDecreaseResult.errors.length > 0) {
        finalResult.warning_stock = `Problemas al descontar stock: ${stockDecreaseResult.errors.join('; ')}`;
        toastDescription += ` ${finalResult.warning_stock}`;
      } else if (newStatus === 'En preparación' && stockDecreaseResult.success && stockDecreaseResult.errors.length === 0) {
        finalResult.info_stock = `Stock descontado.`;
      }
      
      if (saleCreationResult.message?.includes('Sale already exists')) {
        finalResult.info_sale = `Venta ya registrada.`;
      } else if (saleCreationResult.error) {
        finalResult.error_sale = `Falló creación de venta: ${saleCreationResult.error}`;
        toastDescription += ` ${finalResult.error_sale}`;
      } else if (newStatus === 'Entregado' && saleCreationResult.success && saleCreationResult.data) {
        finalResult.info_sale = `Venta registrada.`;
      }
      
      toast({ title: "Estado Actualizado", description: toastDescription });
      return finalResult;

    } catch (e) {
      console.error('ordersSlice: Exception during updateOrderStatus:', e);
      set(state => ({
        orders: state.orders.map(o => 
          o.id === orderId ? { ...o, status: originalStatus, _isUpdating: false } : o
        ),
        isLoadingOrders: false,
        ordersError: "Error de red o inesperado al actualizar el pedido."
      }));
      toast({ variant: "destructive", title: "Error de Red", description: "No se pudo actualizar el pedido. Verifica tu conexión e intenta de nuevo." });
      return { success: false, error: e.message, isOptimisticRevert: true };
    }
  },

  deleteOrder: async (orderId) => {
    set({ isLoadingOrders: true, ordersError: null });
    if (!supabase) {
      set({ ordersError: "Supabase client not initialized", isLoadingOrders: false });
      toast({ variant: "destructive", title: "Error", description: "Error de conexión con el servidor (Supabase no inicializado)." });
      return { success: false, error: "Supabase client not initialized" };
    }
    
    try {
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      if (itemsError) {
        console.error('ordersSlice: Error deleting order items:', itemsError);
        set({ ordersError: itemsError.message, isLoadingOrders: false });
        toast({ variant: "destructive", title: "Error al Eliminar Items", description: itemsError.message });
        return { success: false, error: itemsError.message };
      }

      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (orderError) {
        console.error('ordersSlice: Error deleting order:', orderError);
        set({ ordersError: orderError.message, isLoadingOrders: false });
        toast({ variant: "destructive", title: "Error al Eliminar Pedido", description: orderError.message });
        return { success: false, error: orderError.message };
      }
      
      set(state => ({
        orders: state.orders.filter(o => o.id !== orderId),
        isLoadingOrders: false
      }));
      toast({ title: "Pedido Eliminado", description: `El pedido #${orderId.substring(0,5)} ha sido eliminado.` });
      return { success: true };
    } catch (e) {
      console.error('ordersSlice: Exception during deleteOrder:', e);
      set({ ordersError: "Error de red o inesperado al eliminar el pedido.", isLoadingOrders: false });
      toast({ variant: "destructive", title: "Error de Red", description: "No se pudo eliminar el pedido. Verifica tu conexión." });
      return { success: false, error: e.message };
    }
  },
  // createOrder, updateOrderStatus, deleteOrder remain here
});

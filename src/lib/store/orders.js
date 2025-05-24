
import { supabase } from '../supabase';

export const createOrdersSlice = (set, get) => ({
  addOrder: async (orderData) => {
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: get().user.id,
          branch_id: orderData.branchId,
          status: 'Pendiente',
          total_amount: orderData.total
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        notes: item.notes
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      await get().loadOrders();

      return order.id;
    } catch (error) {
      console.error('Error al crear pedido:', error);
      throw error;
    }
  },

  updateOrderStatus: async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      await get().loadOrders();

      return { success: true };
    } catch (error) {
      console.error('Error al actualizar estado del pedido:', error);
      return { error: error.message };
    }
  },
});

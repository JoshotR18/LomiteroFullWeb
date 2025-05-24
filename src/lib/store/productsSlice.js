
import { supabase } from '@/lib/supabase';

export const productsSlice = (set, get) => ({
  products: [],
  isLoadingProducts: false,
  productsError: null,

  fetchProducts: async () => {
    set({ isLoadingProducts: true, productsError: null });
    if (!supabase) {
      set({ productsError: "Supabase client not initialized", isLoadingProducts: false });
      return { success: false, error: "Supabase client not initialized" };
    }
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (id, name),
          product_ingredients (
            ingredient_id,
            quantity,
            ingredients (id, name, unit)
          ),
          product_add_ons (
            id, 
            name, 
            add_on_price, 
            add_on_quantity, 
            ingredient_id,
            ingredients (id, name, unit)
          )
        `)
        .order('name', { ascending: true });
      if (error) throw error;
      
      const productsWithProcessedData = data.map(p => ({
        ...p,
        ingredients: p.product_ingredients ? p.product_ingredients.map(pi => ({
          id: pi.ingredients?.id,
          ingredient_id: pi.ingredient_id,
          name: pi.ingredients?.name,
          quantity: pi.quantity,
          unit: pi.ingredients?.unit,
        })) : [],
        add_ons: p.product_add_ons ? p.product_add_ons.map(addon => ({
          ...addon,
          id: addon.id,
          name: addon.name,
          add_on_price: addon.add_on_price,
          add_on_quantity: addon.add_on_quantity,
          ingredient_id: addon.ingredient_id,
          ingredient_name: addon.ingredients?.name,
          ingredient_unit: addon.ingredients?.unit,
        })) : []
      }));

      set({ products: productsWithProcessedData || [], isLoadingProducts: false });
      return { success: true, data: productsWithProcessedData };
    } catch (error) {
      console.error('productsSlice: Error fetching products:', error);
      set({ productsError: error.message, isLoadingProducts: false });
      return { success: false, error: error.message };
    }
  },

  addProduct: async (productData) => {
    set({ isLoadingProducts: true, productsError: null });
    if (!supabase) {
      set({ productsError: "Supabase client not initialized", isLoadingProducts: false });
      return { success: false, error: "Supabase client not initialized" };
    }
    const { ingredients: productIngredientsData, add_ons: productAddOnsData, ...mainProductDataOnly } = productData;
    
    try {
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert(mainProductDataOnly)
        .select()
        .single();

      if (productError) {
        console.error('productsSlice addProduct: Error inserting product:', productError);
        throw productError;
      }

      if (mainProductDataOnly.stock_control_type === 'ingredients' && productIngredientsData && productIngredientsData.length > 0) {
        const finalProductIngredientsToInsert = productIngredientsData.map(ing => ({
          product_id: newProduct.id,
          ingredient_id: ing.id,
          quantity: ing.quantity,
        }));
        const { error: ingredientsError } = await supabase.from('product_ingredients').insert(finalProductIngredientsToInsert);
        if (ingredientsError) {
          console.error('productsSlice addProduct: Error inserting product_ingredients:', ingredientsError);
          await supabase.from('products').delete().eq('id', newProduct.id); 
          throw ingredientsError;
        }
      }
      
      if (productAddOnsData && productAddOnsData.length > 0) {
        const finalProductAddOnsToInsert = productAddOnsData.map(addon => ({
            product_id: newProduct.id,
            ingredient_id: addon.ingredient_id,
            name: addon.name,
            add_on_price: addon.add_on_price,
            add_on_quantity: addon.add_on_quantity,
        }));
        const { error: addOnsError } = await supabase.from('product_add_ons').insert(finalProductAddOnsToInsert).select();
        if (addOnsError) {
            console.error('productsSlice addProduct: Error inserting product_add_ons:', addOnsError);
            await supabase.from('products').delete().eq('id', newProduct.id);
            throw addOnsError;
        }
      }

      if (mainProductDataOnly.stock_control_type === 'direct') {
        const branches = get().branches;
        if (branches && branches.length > 0) {
          const productStockEntries = branches.map(branch => ({
            product_id: newProduct.id,
            branch_id: branch.id,
            current_stock: 0,
            min_stock: 0,
          }));
          const { error: stockError } = await supabase.from('product_stock_by_branch').insert(productStockEntries).select();
          if (stockError) {
            console.error('productsSlice addProduct: Error inserting product_stock_by_branch entries:', stockError);
          }
        } else {
          console.warn('productsSlice addProduct: stock_control_type is direct, but no branches found to create stock entries.');
        }
      }

      await get().fetchProducts();
      if (mainProductDataOnly.stock_control_type === 'direct') {
         await get().fetchAllStockData?.(); 
      }
      set({ isLoadingProducts: false });
      return { success: true, data: newProduct };
    } catch (error) {
      console.error('productsSlice addProduct: Overall error:', error);
      set({ productsError: error.message, isLoadingProducts: false });
      return { success: false, error: error.message };
    }
  },

  updateProduct: async (productId, productData) => {
    set({ isLoadingProducts: true, productsError: null });
    if (!supabase) {
      set({ productsError: "Supabase client not initialized", isLoadingProducts: false });
      return { success: false, error: "Supabase client not initialized" };
    }
    const { ingredients: productIngredientsData, add_ons: productAddOnsData, ...mainProductDataOnly } = productData;
    
    try {
      const { data: originalProduct, error: fetchError } = await supabase
        .from('products')
        .select('stock_control_type')
        .eq('id', productId)
        .single();

      if (fetchError) {
        console.error('productsSlice updateProduct: Error fetching original product stock_control_type:', fetchError);
        throw fetchError;
      }
      const originalStockControlType = originalProduct.stock_control_type;

      const { data: updatedProduct, error: productError } = await supabase
        .from('products')
        .update(mainProductDataOnly)
        .eq('id', productId)
        .select()
        .single();
      
      if (productError) {
        console.error('productsSlice updateProduct: Error updating product:', productError);
        throw productError;
      }

      await supabase.from('product_ingredients').delete().eq('product_id', productId);
      if (mainProductDataOnly.stock_control_type === 'ingredients' && productIngredientsData && productIngredientsData.length > 0) {
        const finalProductIngredientsToInsert = productIngredientsData.map(ing => ({
          product_id: productId,
          ingredient_id: ing.id,
          quantity: ing.quantity,
        }));
        const { error: ingredientsError } = await supabase.from('product_ingredients').insert(finalProductIngredientsToInsert);
        if (ingredientsError) {
          console.error('productsSlice updateProduct: Error inserting product_ingredients:', ingredientsError);
          throw ingredientsError;
        }
      }
      
      await supabase.from('product_add_ons').delete().eq('product_id', productId);
      if (productAddOnsData && productAddOnsData.length > 0) {
        const finalProductAddOnsToInsert = productAddOnsData.map(addon => ({
            product_id: productId,
            ingredient_id: addon.ingredient_id,
            name: addon.name,
            add_on_price: addon.add_on_price,
            add_on_quantity: addon.add_on_quantity,
        }));
        const { error: addOnsError } = await supabase.from('product_add_ons').insert(finalProductAddOnsToInsert).select();
        if (addOnsError) {
            console.error('productsSlice updateProduct: Error inserting product_add_ons:', addOnsError);
            throw addOnsError;
        }
      }

      if (mainProductDataOnly.stock_control_type === 'direct' && originalStockControlType !== 'direct') {
        const branches = get().branches;
        if (branches && branches.length > 0) {
          const productStockEntries = branches.map(branch => ({
            product_id: productId,
            branch_id: branch.id,
            current_stock: 0, 
            min_stock: 0,
          }));
          const { error: stockError } = await supabase.from('product_stock_by_branch').upsert(productStockEntries, { onConflict: 'product_id, branch_id' }).select();
          if (stockError) {
            console.error('productsSlice updateProduct: Error inserting/upserting product_stock_by_branch entries:', stockError);
          }
        } else {
          console.warn('productsSlice updateProduct: stock_control_type is direct, but no branches found to create stock entries.');
        }
      } else if (mainProductDataOnly.stock_control_type !== 'direct' && originalStockControlType === 'direct') {
        const { error: deleteStockError } = await supabase.from('product_stock_by_branch').delete().eq('product_id', productId);
        if (deleteStockError) {
          console.error('productsSlice updateProduct: Error deleting product_stock_by_branch entries:', deleteStockError);
        }
      }


      await get().fetchProducts();
      if (mainProductDataOnly.stock_control_type === 'direct' || originalStockControlType === 'direct') {
         await get().fetchAllStockData?.();
      }
      set({ isLoadingProducts: false });
      return { success: true, data: updatedProduct };
    } catch (error) {
      console.error('productsSlice updateProduct: Overall error:', error);
      set({ productsError: error.message, isLoadingProducts: false });
      return { success: false, error: error.message };
    }
  },

  deleteProduct: async (productId) => {
    set({ isLoadingProducts: true, productsError: null });
    if (!supabase) {
      set({ productsError: "Supabase client not initialized", isLoadingProducts: false });
      return { success: false, error: "Supabase client not initialized" };
    }
    console.log(`productsSlice deleteProduct: Attempting to delete product ID: ${productId}`);

    try {
      console.log(`productsSlice deleteProduct: Deleting order_items for product ID: ${productId}`);
      const { error: orderItemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('product_id', productId);

      if (orderItemsError) {
        console.error(`productsSlice deleteProduct: Critical error deleting order_items for product ID ${productId}:`, orderItemsError);
        throw new Error(`Error al eliminar ítems de pedidos asociados (order_items): ${orderItemsError.message}. Código: ${orderItemsError.code}. Detalles: ${orderItemsError.details}`);
      }
      console.log(`productsSlice deleteProduct: Successfully deleted order_items for product ${productId}`);

      console.log(`productsSlice deleteProduct: Deleting product_ingredients for product ID: ${productId}`);
      const { error: ingredientsError } = await supabase
        .from('product_ingredients')
        .delete()
        .eq('product_id', productId);
      if (ingredientsError) {
        console.warn(`productsSlice deleteProduct: Error deleting product_ingredients for product ID ${productId} (non-critical):`, ingredientsError);
      } else {
        console.log(`productsSlice deleteProduct: Successfully deleted product_ingredients for product ${productId}`);
      }

      console.log(`productsSlice deleteProduct: Deleting product_add_ons for product ID: ${productId}`);
      const { error: addOnsError } = await supabase
        .from('product_add_ons')
        .delete()
        .eq('product_id', productId);
      if (addOnsError) {
        console.warn(`productsSlice deleteProduct: Error deleting product_add_ons for product ID ${productId} (non-critical):`, addOnsError);
      } else {
        console.log(`productsSlice deleteProduct: Successfully deleted product_add_ons for product ${productId}`);
      }

      console.log(`productsSlice deleteProduct: Deleting product_stock_by_branch for product ID: ${productId}`);
      const { error: stockError } = await supabase
        .from('product_stock_by_branch')
        .delete()
        .eq('product_id', productId);
      if (stockError) {
        console.warn(`productsSlice deleteProduct: Error deleting product_stock_by_branch for product ID ${productId} (non-critical):`, stockError);
      } else {
        console.log(`productsSlice deleteProduct: Successfully deleted product_stock_by_branch for product ${productId}`);
      }
      
      console.log(`productsSlice deleteProduct: Deleting product from products table, ID: ${productId}`);
      const { error: productError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (productError) {
        console.error(`productsSlice deleteProduct: Critical error deleting product ID ${productId} from products table:`, productError);
        throw productError; 
      }
      console.log(`productsSlice deleteProduct: Successfully deleted product ${productId} from products table.`);
      
      set(state => ({
        products: state.products.filter(p => p.id !== productId),
        isLoadingProducts: false,
      }));
      
      return { success: true };
    } catch (error) {
      console.error(`productsSlice deleteProduct: Overall error during deletion of product ID ${productId}:`, error);
      set({ productsError: error.message, isLoadingProducts: false });
      return { success: false, error: error.message };
    }
  },
});

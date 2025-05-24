
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
    console.log("productsSlice addProduct received productData:", JSON.stringify(productData, null, 2));
    console.log("productsSlice addProduct extracted mainProductDataOnly:", JSON.stringify(mainProductDataOnly, null, 2));
    console.log("productsSlice addProduct extracted productIngredientsData:", JSON.stringify(productIngredientsData, null, 2));
    console.log("productsSlice addProduct extracted productAddOnsData:", JSON.stringify(productAddOnsData, null, 2));
    
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
      console.log('productsSlice addProduct: Product inserted:', newProduct);

      if (mainProductDataOnly.stock_control_type === 'ingredients' && productIngredientsData && productIngredientsData.length > 0) {
        const finalProductIngredientsToInsert = productIngredientsData.map(ing => ({
          product_id: newProduct.id,
          ingredient_id: ing.id,
          quantity: ing.quantity,
        }));
        console.log('productsSlice addProduct: Attempting to insert product_ingredients:', JSON.stringify(finalProductIngredientsToInsert, null, 2));
        const { error: ingredientsError } = await supabase.from('product_ingredients').insert(finalProductIngredientsToInsert);
        if (ingredientsError) {
          console.error('productsSlice addProduct: Error inserting product_ingredients:', ingredientsError);
          await supabase.from('products').delete().eq('id', newProduct.id); 
          throw ingredientsError;
        }
        console.log('productsSlice addProduct: product_ingredients inserted successfully.');
      }
      
      if (productAddOnsData && productAddOnsData.length > 0) {
        const finalProductAddOnsToInsert = productAddOnsData.map(addon => ({
            product_id: newProduct.id,
            ingredient_id: addon.ingredient_id,
            name: addon.name,
            add_on_price: addon.add_on_price,
            add_on_quantity: addon.add_on_quantity,
        }));
        console.log('productsSlice addProduct: Attempting to insert product_add_ons:', JSON.stringify(finalProductAddOnsToInsert, null, 2));
        const { error: addOnsError, data: insertedAddOns } = await supabase.from('product_add_ons').insert(finalProductAddOnsToInsert).select();
        if (addOnsError) {
            console.error('productsSlice addProduct: Error inserting product_add_ons:', addOnsError);
            await supabase.from('products').delete().eq('id', newProduct.id);
            throw addOnsError;
        }
        console.log('productsSlice addProduct: product_add_ons inserted successfully:', insertedAddOns);
      }

      if (mainProductDataOnly.stock_control_type === 'direct') {
        const branches = get().branches;
        console.log('productsSlice addProduct: stock_control_type is direct. Branches found:', branches);
        if (branches && branches.length > 0) {
          const productStockEntries = branches.map(branch => ({
            product_id: newProduct.id,
            branch_id: branch.id,
            current_stock: 0,
            min_stock: 0,
          }));
          console.log('productsSlice addProduct: Attempting to insert product_stock_by_branch entries:', JSON.stringify(productStockEntries, null, 2));
          const { error: stockError, data: stockData } = await supabase.from('product_stock_by_branch').insert(productStockEntries).select();
          if (stockError) {
            console.error('productsSlice addProduct: Error inserting product_stock_by_branch entries:', stockError);
          } else {
            console.log('productsSlice addProduct: product_stock_by_branch entries inserted successfully:', stockData);
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
    console.log("productsSlice updateProduct received productData:", JSON.stringify(productData, null, 2));
    console.log("productsSlice updateProduct extracted mainProductDataOnly:", JSON.stringify(mainProductDataOnly, null, 2));
    console.log("productsSlice updateProduct extracted productIngredientsData:", JSON.stringify(productIngredientsData, null, 2));
    console.log("productsSlice updateProduct extracted productAddOnsData:", JSON.stringify(productAddOnsData, null, 2));
    
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
      console.log('productsSlice updateProduct: Product updated:', updatedProduct);

      await supabase.from('product_ingredients').delete().eq('product_id', productId);
      if (mainProductDataOnly.stock_control_type === 'ingredients' && productIngredientsData && productIngredientsData.length > 0) {
        const finalProductIngredientsToInsert = productIngredientsData.map(ing => ({
          product_id: productId,
          ingredient_id: ing.id,
          quantity: ing.quantity,
        }));
        console.log('productsSlice updateProduct: Attempting to insert product_ingredients:', JSON.stringify(finalProductIngredientsToInsert, null, 2));
        const { error: ingredientsError } = await supabase.from('product_ingredients').insert(finalProductIngredientsToInsert);
        if (ingredientsError) {
          console.error('productsSlice updateProduct: Error inserting product_ingredients:', ingredientsError);
          throw ingredientsError;
        }
        console.log('productsSlice updateProduct: product_ingredients updated successfully.');
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
        console.log('productsSlice updateProduct: Attempting to insert product_add_ons:', JSON.stringify(finalProductAddOnsToInsert, null, 2));
        const { error: addOnsError, data: updatedAddOns } = await supabase.from('product_add_ons').insert(finalProductAddOnsToInsert).select();
        if (addOnsError) {
            console.error('productsSlice updateProduct: Error inserting product_add_ons:', addOnsError);
            throw addOnsError;
        }
        console.log('productsSlice updateProduct: product_add_ons updated successfully:', updatedAddOns);
      }

      if (mainProductDataOnly.stock_control_type === 'direct' && originalStockControlType !== 'direct') {
        const branches = get().branches;
        console.log('productsSlice updateProduct: stock_control_type changed to direct. Branches found:', branches);
        if (branches && branches.length > 0) {
          const productStockEntries = branches.map(branch => ({
            product_id: productId,
            branch_id: branch.id,
            current_stock: 0, 
            min_stock: 0,
          }));
          console.log('productsSlice updateProduct: Attempting to insert product_stock_by_branch entries:', JSON.stringify(productStockEntries, null, 2));
          const { error: stockError, data: stockData } = await supabase.from('product_stock_by_branch').upsert(productStockEntries, { onConflict: 'product_id, branch_id' }).select();
          if (stockError) {
            console.error('productsSlice updateProduct: Error inserting/upserting product_stock_by_branch entries:', stockError);
          } else {
             console.log('productsSlice updateProduct: product_stock_by_branch entries inserted/upserted successfully:', stockData);
          }
        } else {
          console.warn('productsSlice updateProduct: stock_control_type is direct, but no branches found to create stock entries.');
        }
      } else if (mainProductDataOnly.stock_control_type !== 'direct' && originalStockControlType === 'direct') {
        console.log('productsSlice updateProduct: stock_control_type changed from direct. Deleting product_stock_by_branch entries for product:', productId);
        const { error: deleteStockError } = await supabase.from('product_stock_by_branch').delete().eq('product_id', productId);
        if (deleteStockError) {
          console.error('productsSlice updateProduct: Error deleting product_stock_by_branch entries:', deleteStockError);
        } else {
          console.log('productsSlice updateProduct: product_stock_by_branch entries deleted successfully for product:', productId);
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
    try {
      await supabase.from('product_ingredients').delete().eq('product_id', productId);
      await supabase.from('product_stock_by_branch').delete().eq('product_id', productId);
      await supabase.from('product_add_ons').delete().eq('product_id', productId);
      
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      
      set(state => ({
        products: state.products.filter(p => p.id !== productId),
        isLoadingProducts: false,
      }));
      await get().fetchAllStockData?.();
      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      set({ productsError: error.message, isLoadingProducts: false });
      return { success: false, error: error.message };
    }
  },
});

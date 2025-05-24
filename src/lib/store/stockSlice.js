
import { supabase } from '@/lib/supabase';
import { 
  updateStockEntryUtil, 
  getProductStockEntryUtil, 
  getIngredientStockEntryUtil, 
  getProductDetailsWithIngredientsUtil,
  createNewStockEntryUtil
} from '@/lib/stockUtils';

export const stockSlice = (set, get) => ({
  ingredientStock: [],
  productDirectStock: [],
  isLoadingStock: false,
  stockError: null,

  fetchAllStockData: async () => {
    set({ isLoadingStock: true, stockError: null });
    if (!supabase) {
      set({ stockError: "Supabase client not initialized", isLoadingStock: false });
      return { success: false, error: "Supabase client not initialized" };
    }
    try {
      const [ingredientStockRes, productStockRes] = await Promise.all([
        supabase
          .from('stock_by_branch')
          .select(`
            id,
            current_stock,
            min_stock,
            ingredient_id,
            branch_id,
            ingredients (id, name, unit),
            branches (id, name)
          `)
          .order('ingredients(name)', { ascending: true }),
        supabase
          .from('product_stock_by_branch')
          .select(`
            id,
            current_stock,
            min_stock,
            product_id,
            branch_id,
            products (id, name, stock_control_type),
            branches (id, name)
          `)
          .eq('products.stock_control_type', 'direct') 
          .order('products(name)', { ascending: true })
      ]);

      if (ingredientStockRes.error) throw ingredientStockRes.error;
      if (productStockRes.error) throw productStockRes.error;
      
      set({ 
        ingredientStock: ingredientStockRes.data || [], 
        productDirectStock: productStockRes.data || [], 
        isLoadingStock: false 
      });
      return { success: true, ingredientData: ingredientStockRes.data, productData: productStockRes.data };

    } catch (error) {
      console.error('Error fetching all stock data:', error);
      set({ stockError: error.message, isLoadingStock: false });
      return { error: error.message };
    }
  },

  fetchStockByBranch: async (branchId) => {
    set({ isLoadingStock: true, stockError: null });
    if (!supabase) {
      set({ stockError: "Supabase client not initialized", isLoadingStock: false });
      return { error: "Supabase client not initialized" };
    }
    if (!branchId) {
      set({ stockError: "Branch ID is required to fetch stock.", isLoadingStock: false });
      return { error: "Branch ID is required." };
    }

    try {
      const [ingredientStockRes, productStockRes] = await Promise.all([
        supabase
          .from('stock_by_branch')
          .select(`
            id,
            current_stock,
            min_stock,
            ingredient_id,
            branch_id,
            ingredients (id, name, unit),
            branches (id, name)
          `)
          .eq('branch_id', branchId)
          .order('ingredients(name)', { ascending: true }),
        supabase
          .from('product_stock_by_branch')
          .select(`
            id,
            current_stock,
            min_stock,
            product_id,
            branch_id,
            products (id, name, stock_control_type),
            branches (id, name)
          `)
          .eq('branch_id', branchId)
          .eq('products.stock_control_type', 'direct') 
          .order('products(name)', { ascending: true })
      ]);

      if (ingredientStockRes.error) throw ingredientStockRes.error;
      if (productStockRes.error) throw productStockRes.error;
      
      const currentIngredientStock = get().ingredientStock.filter(s => s.branch_id !== branchId);
      const currentProductDirectStock = get().productDirectStock.filter(s => s.branch_id !== branchId);

      set({ 
        ingredientStock: [...currentIngredientStock, ...(ingredientStockRes.data || [])], 
        productDirectStock: [...currentProductDirectStock, ...(productStockRes.data || [])], 
        isLoadingStock: false 
      });
      return { success: true, ingredientData: ingredientStockRes.data, productData: productStockRes.data };

    } catch (error) {
      console.error('Error fetching stock by branch:', error);
      set({ stockError: error.message, isLoadingStock: false });
      return { error: error.message };
    }
  },

  updateIngredientStockEntry: async (stockEntryId, ingredientId, branchId, current_stock, min_stock) => {
    set({ isLoadingStock: true, stockError: null });
    if (!supabase) {
        set({ stockError: "Supabase client not initialized", isLoadingStock: false });
        return { error: "Supabase client not initialized" };
    }

    const payload = {
        current_stock: parseFloat(current_stock) || 0,
        min_stock: parseFloat(min_stock) || 0,
    };

    let result;
    if (stockEntryId) {
        result = await updateStockEntryUtil('stock_by_branch', stockEntryId, payload.current_stock, payload.min_stock);
    } else {
        result = await createNewStockEntryUtil('stock_by_branch', { ...payload, ingredient_id: ingredientId, branch_id: branchId });
    }
    
    if (result.error) {
        console.error('Error updating/adding ingredient stock item:', result.error);
        set({ stockError: result.error.message, isLoadingStock: false });
        return { error: result.error.message };
    }
    
    set(state => ({
        ingredientStock: state.ingredientStock.map(s => 
            s.id === result.data.id ? result.data : 
            (s.ingredient_id === ingredientId && s.branch_id === branchId ? result.data : s)
        ).concat(state.ingredientStock.find(s => s.id === result.data.id || (s.ingredient_id === ingredientId && s.branch_id === branchId)) ? [] : [result.data]),
        isLoadingStock: false
    }));
    return { success: true, data: result.data };
  },

  updateProductDirectStockEntry: async (stockEntryId, productId, branchId, current_stock, min_stock) => {
    set({ isLoadingStock: true, stockError: null });
    if (!supabase) {
        set({ stockError: "Supabase client not initialized", isLoadingStock: false });
        return { error: "Supabase client not initialized" };
    }

    const payload = {
        current_stock: parseFloat(current_stock) || 0,
        min_stock: parseFloat(min_stock) || 0,
    };
    
    let result;
    if (stockEntryId) {
        result = await updateStockEntryUtil('product_stock_by_branch', stockEntryId, payload.current_stock, payload.min_stock);
    } else {
        result = await createNewStockEntryUtil('product_stock_by_branch', { ...payload, product_id: productId, branch_id: branchId });
    }

    if (result.error) {
        console.error('Error updating/adding product direct stock item:', result.error);
        set({ stockError: result.error.message, isLoadingStock: false });
        return { error: result.error.message };
    }
    set(state => ({
        productDirectStock: state.productDirectStock.map(s => 
            s.id === result.data.id ? result.data : 
            (s.product_id === productId && s.branch_id === branchId ? result.data : s)
        ).concat(state.productDirectStock.find(s => s.id === result.data.id || (s.product_id === productId && s.branch_id === branchId)) ? [] : [result.data]),
        isLoadingStock: false
    }));
    return { success: true, data: result.data };
  },

  decreaseStockForOrder: async (order) => {
    set({ isLoadingStock: true, stockError: null });
    if (!supabase) {
      set({ stockError: "Supabase client not initialized", isLoadingStock: false });
      return { success: false, errors: ["Supabase client not initialized"] };
    }
    if (!order || !order.order_items || !order.branch_id) {
      set({ stockError: "Invalid order data for stock decrease.", isLoadingStock: false });
      return { success: false, errors: ["Invalid order data for stock decrease."] };
    }

    const { order_items, branch_id } = order;
    let overallSuccess = true;
    let errors = [];
    const updatedIngredientStockEntries = [];
    const updatedProductStockEntries = [];

    for (const item of order_items) {
      const currentProductId = item.product_id || item.products?.id;
      if (!currentProductId) {
        errors.push(`Missing product ID for order item: ${JSON.stringify(item)}`);
        overallSuccess = false;
        continue;
      }

      const { data: productDetails, error: productFetchError } = await getProductDetailsWithIngredientsUtil(currentProductId);

      if (productFetchError || !productDetails) {
        errors.push(`Error fetching product details for ${currentProductId}: ${productFetchError?.message || 'Not found'}`);
        overallSuccess = false;
        continue;
      }
      
      const itemQuantity = parseFloat(item.quantity);
      if (isNaN(itemQuantity) || itemQuantity <= 0) {
        errors.push(`Invalid quantity for product ${productDetails.name}: ${item.quantity}`);
        overallSuccess = false;
        continue;
      }

      if (productDetails.stock_control_type === 'direct') {
        const { data: stockEntry, error: stockFetchError } = await getProductStockEntryUtil(productDetails.id, branch_id);

        if (stockFetchError || !stockEntry) {
          errors.push(`Stock entry not found for product ${productDetails.name} (ID: ${productDetails.id}) in branch ${branch_id}. Error: ${stockFetchError?.message || 'Not found'}`);
          overallSuccess = false;
          continue;
        }

        const currentStock = parseFloat(stockEntry.current_stock);
        if (isNaN(currentStock)) {
            errors.push(`Invalid current stock value for product ${productDetails.name}: ${stockEntry.current_stock}`);
            overallSuccess = false;
            continue;
        }
        const newStock = currentStock - itemQuantity;
        
        const { data: updatedEntry, error: updateError } = await updateStockEntryUtil('product_stock_by_branch', stockEntry.id, Math.max(0, newStock), stockEntry.min_stock);

        if (updateError) {
          errors.push(`Error updating stock for product ${productDetails.name}: ${updateError.message}`);
          overallSuccess = false;
        } else {
            updatedProductStockEntries.push(updatedEntry);
            if (newStock < 0) {
                errors.push(`Insufficient stock for product ${productDetails.name}. Required: ${itemQuantity}, Available: ${currentStock}. Stock was set to 0.`);
            }
        }


      } else if (productDetails.stock_control_type === 'ingredients') {
        if (!productDetails.product_ingredients || productDetails.product_ingredients.length === 0) {
          errors.push(`Product ${productDetails.name} (ID: ${productDetails.id}) is 'ingredients' type but has no ingredients defined.`);
          overallSuccess = false;
        } else {
            for (const pi of productDetails.product_ingredients) {
              if (!pi.ingredient_id || !pi.ingredients) {
                errors.push(`Malformed ingredient data for product ${productDetails.name}: ${JSON.stringify(pi)}`);
                overallSuccess = false;
                continue;
              }
              const ingredientQuantityPerProduct = parseFloat(pi.quantity);
              if (isNaN(ingredientQuantityPerProduct) || ingredientQuantityPerProduct <= 0) {
                errors.push(`Invalid ingredient quantity defined for ${pi.ingredients.name} in product ${productDetails.name}`);
                overallSuccess = false;
                continue;
              }

              const quantityToDecrease = ingredientQuantityPerProduct * itemQuantity;
              const { data: ingredientStockEntry, error: ingredientStockFetchError } = await getIngredientStockEntryUtil(pi.ingredient_id, branch_id);

              if (ingredientStockFetchError || !ingredientStockEntry) {
                errors.push(`Stock entry not found for ingredient ${pi.ingredients?.name || pi.ingredient_id} in branch ${branch_id}. Error: ${ingredientStockFetchError?.message || 'Not found'}`);
                overallSuccess = false;
                continue;
              }
              
              const currentIngredientStock = parseFloat(ingredientStockEntry.current_stock);
               if (isNaN(currentIngredientStock)) {
                errors.push(`Invalid current stock value for ingredient ${pi.ingredients.name}: ${ingredientStockEntry.current_stock}`);
                overallSuccess = false;
                continue;
              }
              const newIngredientStock = currentIngredientStock - quantityToDecrease;
              
              const { data: updatedEntry, error: updateIngredientError } = await updateStockEntryUtil('stock_by_branch', ingredientStockEntry.id, Math.max(0, newIngredientStock), ingredientStockEntry.min_stock);

              if (updateIngredientError) {
                errors.push(`Error updating stock for ingredient ${ingredientStockEntry.ingredients.name}: ${updateIngredientError.message}`);
                overallSuccess = false;
              } else {
                updatedIngredientStockEntries.push(updatedEntry);
                if (newIngredientStock < 0) {
                     errors.push(`Insufficient stock for ingredient ${ingredientStockEntry.ingredients.name}. Required: ${quantityToDecrease}, Available: ${currentIngredientStock}. Stock was set to 0.`);
                }
              }
            }
        }
      }
      
      if (item.add_ons && Array.isArray(item.add_ons) && item.add_ons.length > 0) {
        for (const addon of item.add_ons) {
          const addonIngredientId = addon.ingredient_id;
          const addonQuantityPerItem = parseFloat(addon.ingredient_quantity_per_add_on); 
          const addonQuantitySelected = parseFloat(addon.quantity_selected || 1); 

          if (!addonIngredientId || isNaN(addonQuantityPerItem) || addonQuantityPerItem <= 0 || isNaN(addonQuantitySelected) || addonQuantitySelected <= 0) {
            errors.push(`Invalid add-on data for product ${productDetails.name}: ${JSON.stringify(addon)}`);
            overallSuccess = false;
            continue;
          }

          const totalAddonIngredientToDecrease = addonQuantityPerItem * addonQuantitySelected * itemQuantity;
          const { data: addonIngredientStockEntry, error: addonIngredientStockFetchError } = await getIngredientStockEntryUtil(addonIngredientId, branch_id);

          if (addonIngredientStockFetchError || !addonIngredientStockEntry) {
            errors.push(`Stock entry not found for add-on ingredient ID ${addonIngredientId} (name: ${addon.name}) in branch ${branch_id}. Error: ${addonIngredientStockFetchError?.message || 'Not found'}`);
            overallSuccess = false;
            continue;
          }

          const currentAddonIngredientStock = parseFloat(addonIngredientStockEntry.current_stock);
          if (isNaN(currentAddonIngredientStock)) {
            errors.push(`Invalid current stock value for add-on ingredient ${addon.name}: ${addonIngredientStockEntry.current_stock}`);
            overallSuccess = false;
            continue;
          }
          const newAddonIngredientStock = currentAddonIngredientStock - totalAddonIngredientToDecrease;

          const { data: updatedEntry, error: updateAddonIngredientError } = await updateStockEntryUtil('stock_by_branch', addonIngredientStockEntry.id, Math.max(0, newAddonIngredientStock), addonIngredientStockEntry.min_stock);
          if (updateAddonIngredientError) {
            errors.push(`Error updating stock for add-on ingredient ${addon.name}: ${updateAddonIngredientError.message}`);
            overallSuccess = false;
          } else {
            updatedIngredientStockEntries.push(updatedEntry);
            if (newAddonIngredientStock < 0) {
              errors.push(`Insufficient stock for add-on ingredient ${addon.name}. Required: ${totalAddonIngredientToDecrease}, Available: ${currentAddonIngredientStock}. Stock was set to 0.`);
            }
          }
        }
      }
    }

    set(state => {
        const newIngredientStockMap = new Map(state.ingredientStock.map(s => [s.id, s]));
        updatedIngredientStockEntries.forEach(entry => newIngredientStockMap.set(entry.id, entry));

        const newProductStockMap = new Map(state.productDirectStock.map(s => [s.id, s]));
        updatedProductStockEntries.forEach(entry => newProductStockMap.set(entry.id, entry));
        
        return {
            ingredientStock: Array.from(newIngredientStockMap.values()),
            productDirectStock: Array.from(newProductStockMap.values()),
            isLoadingStock: false,
            stockError: errors.length > 0 ? errors.join('; ') : null
        };
    });
    
    if (errors.length > 0) {
      console.error("Stock decrease process errors:", errors.join('; '));
    }
    
    return { success: overallSuccess, errors };
  }
});

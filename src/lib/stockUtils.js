
import { supabase } from '@/lib/supabase';

export const updateStockEntryUtil = async (tableName, entryId, newStockValue, newMinStockValue) => {
  if ((typeof newStockValue !== 'number' || isNaN(newStockValue)) && (typeof newMinStockValue !== 'number' || isNaN(newMinStockValue))) {
    console.error(`Invalid stock values for ${tableName} ID ${entryId}: current=${newStockValue}, min=${newMinStockValue}`);
    return { data: null, error: { message: `Invalid stock values provided.` } };
  }

  const payload = {};
  if (typeof newStockValue === 'number' && !isNaN(newStockValue)) {
    payload.current_stock = newStockValue;
  }
  if (typeof newMinStockValue === 'number' && !isNaN(newMinStockValue)) {
    payload.min_stock = newMinStockValue;
  }

  if (Object.keys(payload).length === 0) {
     return { data: null, error: { message: 'No valid stock values to update.' } };
  }

  const { data, error } = await supabase
    .from(tableName)
    .update(payload)
    .eq('id', entryId)
    .select()
    .single();
    
  return { data, error };
};

export const getProductStockEntryUtil = async (productId, branchId) => {
  if (!productId || !branchId) {
    console.error('Missing productId or branchId for getProductStockEntryUtil');
    return { data: null, error: { message: 'Product ID and Branch ID are required.'} };
  }
  return supabase
    .from('product_stock_by_branch')
    .select('id, current_stock, min_stock')
    .eq('product_id', productId)
    .eq('branch_id', branchId)
    .single();
};

export const getIngredientStockEntryUtil = async (ingredientId, branchId) => {
  if (!ingredientId || !branchId) {
    console.error('Missing ingredientId or branchId for getIngredientStockEntryUtil');
    return { data: null, error: { message: 'Ingredient ID and Branch ID are required.'} };
  }
  return supabase
    .from('stock_by_branch')
    .select('id, current_stock, min_stock, ingredients(id, name, unit)')
    .eq('ingredient_id', ingredientId)
    .eq('branch_id', branchId)
    .single();
};

export const getProductDetailsWithIngredientsUtil = async (productId) => {
  if (!productId) {
    console.error('Missing productId for getProductDetailsWithIngredientsUtil');
    return { data: null, error: { message: 'Product ID is required.'} };
  }
 return supabase
    .from('products')
    .select('id, name, stock_control_type, product_ingredients ( ingredient_id, quantity, ingredients(id, name, unit) )')
    .eq('id', productId)
    .single();
};

export const createNewStockEntryUtil = async (tableName, payload) => {
  const { data, error } = await supabase
    .from(tableName)
    .insert([payload])
    .select()
    .single();
  return { data, error };
};

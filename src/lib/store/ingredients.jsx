
import { supabase } from '@/lib/supabase';

export const ingredientsSlice = (set, get) => ({
  ingredients: [],
  fetchIngredients: async () => {
    if (!supabase) return { error: "Supabase client not initialized" };
    const { data, error } = await supabase
      .from('ingredients')
      .select(`
        *,
        stock_by_branch (branch_id, current_stock, min_stock)
      `)
      .order('name', { ascending: true });
    if (error) {
      console.error('Error fetching ingredients:', error);
      return { error: error.message };
    }
    set({ ingredients: data });
    return { success: true, data };
  },
  addIngredient: async (ingredientData) => {
    if (!supabase) return { error: "Supabase client not initialized" };
    const { stockByBranch, ...newIngredientData } = ingredientData; 
    
    const { data: ingredient, error: ingredientError } = await supabase
      .from('ingredients')
      .insert([newIngredientData])
      .select()
      .single();
      
    if (ingredientError) {
      console.error('Error adding ingredient:', ingredientError);
      return { error: ingredientError.message };
    }

    const branches = get().branches;
    if (branches && branches.length > 0) {
      const stockEntries = branches.map(branch => ({
        ingredient_id: ingredient.id,
        branch_id: branch.id,
        current_stock: stockByBranch?.[branch.id]?.current_stock || 0,
        min_stock: stockByBranch?.[branch.id]?.min_stock || ingredientData.min_stock || 0 
      }));

      if (stockEntries.length > 0) {
        const { error: stockError } = await supabase.from('stock_by_branch').insert(stockEntries);
        if (stockError) {
          console.error('Error initializing stock for ingredient:', stockError);
        }
      }
    }
    
    await get().fetchIngredients();
    return { success: true, data: ingredient };
  },
  updateIngredient: async (id, ingredientData) => {
    if (!supabase) return { error: "Supabase client not initialized" };
    const { stockByBranch, ...updatedIngredientData } = ingredientData;

    const { data: ingredient, error: ingredientError } = await supabase
      .from('ingredients')
      .update(updatedIngredientData)
      .eq('id', id)
      .select()
      .single();

    if (ingredientError) {
      console.error('Error updating ingredient:', ingredientError);
      return { error: ingredientError.message };
    }

    if (stockByBranch) {
      const branches = get().branches;
      for (const branch of branches) {
        const branchStockData = stockByBranch[branch.id];
        if (branchStockData) {
          const { data: existingStock, error: fetchStockError } = await supabase
            .from('stock_by_branch')
            .select('id')
            .eq('ingredient_id', id)
            .eq('branch_id', branch.id)
            .maybeSingle();

          if (fetchStockError) {
             console.error(`Error fetching stock for ingredient ${id} branch ${branch.id}:`, fetchStockError);
             continue;
          }
          
          if (existingStock) {
            const { error: updateStockError } = await supabase
              .from('stock_by_branch')
              .update({ 
                current_stock: branchStockData.current_stock, 
                min_stock: branchStockData.min_stock || updatedIngredientData.min_stock || 0
              })
              .eq('id', existingStock.id);
            if (updateStockError) {
              console.error(`Error updating stock for ingredient ${id} branch ${branch.id}:`, updateStockError);
            }
          } else {
            const { error: insertStockError } = await supabase
              .from('stock_by_branch')
              .insert({
                ingredient_id: id,
                branch_id: branch.id,
                current_stock: branchStockData.current_stock,
                min_stock: branchStockData.min_stock || updatedIngredientData.min_stock || 0
              });
            if (insertStockError) {
               console.error(`Error inserting stock for ingredient ${id} branch ${branch.id}:`, insertStockError);
            }
          }
        }
      }
    }
    await get().fetchIngredients();
    return { success: true, data: ingredient };
  },
  deleteIngredient: async (id) => {
    if (!supabase) return { error: "Supabase client not initialized" };

    const { error: stockError } = await supabase
      .from('stock_by_branch')
      .delete()
      .eq('ingredient_id', id);
    if (stockError) {
      console.error('Error deleting stock for ingredient:', stockError);
      return { error: stockError.message };
    }
    
    const { error: productIngredientsError } = await supabase
      .from('product_ingredients')
      .delete()
      .eq('ingredient_id', id);
    if (productIngredientsError) {
      console.error('Error deleting product_ingredients for ingredient:', productIngredientsError);
    }

    const { error } = await supabase.from('ingredients').delete().eq('id', id);
    if (error) {
      console.error('Error deleting ingredient:', error);
      return { error: error.message };
    }
    await get().fetchIngredients();
    return { success: true };
  },
  
  updateStockForIngredient: async (ingredientId, branchId, newStockLevel, newMinStock) => {
    if (!supabase) return { error: "Supabase client not initialized" };
    const { data, error } = await supabase
      .from('stock_by_branch')
      .update({ current_stock: newStockLevel, min_stock: newMinStock })
      .eq('ingredient_id', ingredientId)
      .eq('branch_id', branchId)
      .select();

    if (error) {
      console.error('Error updating stock for ingredient:', error);
      return { error: error.message };
    }
    await get().fetchIngredients(); // Refetch all ingredients to update local state
    return { success: true, data };
  },
});

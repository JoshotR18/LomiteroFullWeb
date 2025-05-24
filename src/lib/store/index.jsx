
import { create } from 'zustand';
import { authSlice } from '@/lib/store/auth';
import { branchesSlice } from '@/lib/store/branches';
import { productsSlice } from '@/lib/store/products';
import { categoriesSlice } from '@/lib/store/categories';
import { ingredientsSlice } from '@/lib/store/ingredients';
import { stockSlice } from '@/lib/store/stock';
import { ordersSlice } from '@/lib/store/orders';
import { financialStatsSlice, formatGuaranies } from '@/lib/store/financialStats';

const useStore = create((set, get) => ({
  ...authSlice(set, get),
  ...branchesSlice(set, get),
  ...productsSlice(set, get),
  ...categoriesSlice(set, get),
  ...ingredientsSlice(set, get),
  ...stockSlice(set, get),
  ...ordersSlice(set, get),
  ...financialStatsSlice(set, get),
}));

export { formatGuaranies };
export default useStore;


import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const OrderSearchFilter = ({ searchTerm, onSearchTermChange }) => (
  <div className="mb-6 p-6 bg-slate-800/50 rounded-xl shadow-xl border border-purple-700/30 flex items-center">
    <div className="relative flex-grow">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <Input
        placeholder="Buscar por ID, cliente, email..."
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
        className="pl-10 w-full bg-slate-700 border-purple-600 text-gray-100 focus:border-purple-400"
      />
    </div>
  </div>
);

export default OrderSearchFilter;

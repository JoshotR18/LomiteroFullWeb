
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

const BranchSelector = ({ selectedBranch, onBranchChange, branches }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex justify-end"
    >
      <Select value={selectedBranch} onValueChange={onBranchChange}>
        <SelectTrigger className="w-[240px] bg-slate-700/80 border-purple-600/70 text-gray-100 focus:border-purple-400 shadow-md hover:border-purple-500 transition-colors">
          <SelectValue placeholder="Seleccionar Sucursal" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-purple-700 text-white shadow-xl">
          <SelectItem value="all" className="hover:!bg-purple-600/70 focus:!bg-purple-600/70 data-[state=checked]:bg-purple-700/80">
            Todas las sucursales
          </SelectItem>
          {branches.map(branch => (
            <SelectItem 
              key={branch.id} 
              value={branch.id} 
              className="hover:!bg-purple-600/70 focus:!bg-purple-600/70 data-[state=checked]:bg-purple-700/80"
            >
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </motion.div>
  );
};

export default BranchSelector;

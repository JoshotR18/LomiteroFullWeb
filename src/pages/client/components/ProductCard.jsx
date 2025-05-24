
import React from 'react';
import { motion } from 'framer-motion';
import { formatGuaranies } from '@/lib/store';
import { PlusCircle } from 'lucide-react';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      onClick={() => onAddToCart(product)}
      className="bg-slate-800/70 border border-purple-700/50 rounded-xl overflow-hidden shadow-lg hover:shadow-purple-500/30 transition-all duration-300 flex flex-col cursor-pointer hover:border-purple-400 hover:bg-slate-700/90"
    >
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-purple-300 leading-tight">{product.name}</h3>
          <PlusCircle className="h-6 w-6 text-green-400 flex-shrink-0 ml-2" />
        </div>
        <p className="text-sm text-slate-400 mb-3 flex-grow min-h-[40px]">
          {product.description || "Delicioso producto de nuestro menú."}
        </p>
        <div className="mt-auto">
          <p className="text-2xl font-bold text-green-400 text-right">{formatGuaranies(product.price)}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;

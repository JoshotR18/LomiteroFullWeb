
import React from 'react';
import { motion } from 'framer-motion';
import { ListChecks, ChefHat, Bell } from 'lucide-react';

const OrderSummaryCards = ({ orders }) => {
  const pendingOrdersCount = orders.filter(order => order.status === 'Pendiente').length;
  const preparingOrdersCount = orders.filter(order => order.status === 'En preparación').length;
  const readyOrdersCount = orders.filter(order => order.status === 'Listo para servir').length;

  const summaryItems = [
    { title: "Pedidos Pendientes", count: pendingOrdersCount, icon: <ListChecks size={36} className="text-yellow-400" />, desc: "Esperando ser procesados", color: "yellow" },
    { title: "En Preparación", count: preparingOrdersCount, icon: <ChefHat size={36} className="text-blue-400" />, desc: "Actualmente en cocina", color: "blue" },
    { title: "Listos para Servir", count: readyOrdersCount, icon: <Bell size={36} className="text-green-400" />, desc: "Esperando ser entregados", color: "green" },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut"
      }
    })
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      {summaryItems.map((item, index) => (
        <motion.div 
          key={index} 
          className={`p-6 rounded-xl shadow-xl flex items-center space-x-4 bg-slate-800/70 border border-purple-700/60 hover:shadow-purple-500/30 transition-shadow duration-300 hover:border-purple-500`}
          variants={cardVariants}
          custom={index}
        >
          <div className={`p-3 rounded-full bg-gradient-to-br from-${item.color}-500/30 to-${item.color}-600/30`}>
            {item.icon}
          </div>
          <div>
            <h3 className={`text-2xl font-semibold text-white`}>{item.count}</h3>
            <p className={`text-sm text-${item.color}-300`}>{item.title}</p>
            <p className="text-xs text-slate-400">{item.desc}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default OrderSummaryCards;

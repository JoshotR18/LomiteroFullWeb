
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatGuaranies } from '@/lib/store/financialStats';

const FinancialStatCard = ({ title, value, isCurrency, icon, description, trend, trendPeriod = "periodo anterior", cardClassName = "", isLoading, tooltipText }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const displayValue = isLoading 
    ? "Cargando..." 
    : (isCurrency ? formatGuaranies(value) : (typeof value === 'number' ? value.toLocaleString('es-PY') : value));

  const valueLength = displayValue.toString().length;
  let textSizeClass = "text-2xl sm:text-3xl";
  if (valueLength > 12 && valueLength <= 15) {
    textSizeClass = "text-xl sm:text-2xl";
  } else if (valueLength > 15) {
    textSizeClass = "text-lg sm:text-xl";
  }


  return (
    <motion.div variants={cardVariants} title={tooltipText}>
      <Card className={`shadow-xl bg-slate-800/60 border-purple-700/40 text-gray-100 backdrop-blur-md ${cardClassName} overflow-hidden h-full flex flex-col justify-between`}>
        <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-purple-300 truncate pr-2">{title}</CardTitle>
          {icon && React.cloneElement(icon, { className: `${icon.props.className || ''} h-5 w-5 text-purple-400`})}
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-center">
          <div 
            className={`${textSizeClass} font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis leading-tight`}
          >
            {displayValue}
          </div>
          {trend !== undefined && trend !== null && !isLoading && (
            <div className={`flex items-center text-xs mt-1 ${parseFloat(trend) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {parseFloat(trend) >= 0 ? <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" /> : <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />}
              {trend} vs {trendPeriod}
            </div>
          )}
          {description && !isLoading && <p className="text-xs text-slate-400 mt-1.5">{description}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FinancialStatCard;


import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarClock } from 'lucide-react';
import { motion } from 'framer-motion';

const DateRangePicker = ({ onApplyFilter, isLoading }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleApply = () => {
    if (startDate && endDate) {
      onApplyFilter({ 
        start: new Date(startDate).toISOString(), 
        end: new Date(endDate).toISOString() 
      });
    } else if (!startDate && !endDate) {
      onApplyFilter(null); 
    } else {
      alert("Por favor, selecciona ambas fechas o ninguna para quitar el filtro.");
    }
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    onApplyFilter(null); 
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-slate-800/60 border-purple-700/40 text-gray-100 backdrop-blur-md shadow-xl mt-6">
        <CardHeader className="flex flex-row items-center space-x-2">
          <CalendarClock className="h-6 w-6 text-purple-400" />
          <CardTitle className="text-purple-300 text-xl">Filtrar por Rango de Fechas y Horas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="start-date" className="text-slate-300 mb-1 block">Desde:</Label>
              <Input
                id="start-date"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-gray-200 placeholder:text-slate-400 focus:ring-purple-500"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="end-date" className="text-slate-300 mb-1 block">Hasta:</Label>
              <Input
                id="end-date"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-gray-200 placeholder:text-slate-400 focus:ring-purple-500"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleApply} 
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              disabled={isLoading || (!startDate && !endDate)}
            >
              Aplicar Filtro
            </Button>
            <Button 
              onClick={handleClear} 
              variant="outline"
              className="flex-1 border-purple-500 text-purple-300 hover:bg-purple-700/30 hover:text-purple-200"
              disabled={isLoading}
            >
              Limpiar Filtro
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DateRangePicker;

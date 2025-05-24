
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit2, Trash2, MapPin, Phone } from 'lucide-react';

const BranchCard = ({ branch, onEdit, onDelete }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 120 }}
      className="h-full"
    >
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:via-gray-800 dark:to-slate-900 text-slate-800 dark:text-white border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden h-full flex flex-col">
        <CardHeader className="p-6">
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 dark:from-purple-400 dark:via-pink-400 dark:to-red-400">
              {branch.name}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white">
                <DropdownMenuItem onClick={() => onEdit(branch)} className="hover:!bg-slate-100 dark:hover:!bg-slate-700 focus:!bg-slate-100 dark:focus:!bg-slate-700">
                  <Edit2 className="mr-2 h-4 w-4 text-sky-500 dark:text-sky-400" />
                  <span className="text-sky-600 dark:text-sky-400">Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(branch)} className="hover:!bg-slate-100 dark:hover:!bg-slate-700 focus:!bg-slate-100 dark:focus:!bg-slate-700">
                  <Trash2 className="mr-2 h-4 w-4 text-red-500 dark:text-red-400" />
                  <span className="text-red-600 dark:text-red-400">Eliminar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-3 flex-grow">
          <div className="flex items-center text-slate-600 dark:text-slate-300">
            <MapPin className="mr-3 h-5 w-5 text-pink-500 dark:text-pink-400 flex-shrink-0" />
            <span>{branch.address}</span>
          </div>
          {branch.phone && (
            <div className="flex items-center text-slate-600 dark:text-slate-300">
              <Phone className="mr-3 h-5 w-5 text-green-500 dark:text-green-400 flex-shrink-0" />
              <span>{branch.phone}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
           <Button 
            variant="outline" 
            className="w-full text-purple-600 dark:text-purple-300 border-purple-500 dark:border-purple-400 hover:bg-purple-500 dark:hover:bg-purple-400 hover:text-white dark:hover:text-black transition-colors"
            onClick={() => onEdit(branch)}
          >
            Ver Detalles / Editar
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default BranchCard;

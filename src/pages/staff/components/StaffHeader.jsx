
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Store, PlusCircle, LogOut, UserCircle, ChevronsUpDown, ListOrdered, LayoutDashboard } from 'lucide-react';

const StaffHeader = ({ 
  user, 
  selectedBranch, 
  branches = [], 
  onSelectBranch, 
  onTakeOrder, 
  onLogout, 
  userName,
  cartItemCount,
  onCartClick,
  onToggleOrdersView,
  activeOrdersView,
  activeOrderCount
}) => {
  return (
    <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-6 p-4 bg-slate-800/50 rounded-xl shadow-2xl border border-purple-700/50">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4"
      >
        <img  alt="Lomi-tero Logo Staff" className="h-16 w-auto rounded-md shadow-lg border-2 border-purple-500" src="https://images.unsplash.com/photo-1703077769619-ee4e1e14ff7d" />
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 mb-1">
            Panel de Personal
          </h1>
          <p className="text-purple-300 text-sm md:text-base">
            {selectedBranch ? `Sucursal: ${selectedBranch.name}` : (branches.length > 0 ? 'Selecciona una sucursal para comenzar' : 'No hay sucursales disponibles')}
          </p>
        </div>
      </motion.div>
      
      <motion.div 
        className="flex flex-wrap items-center gap-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {branches.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[180px] bg-slate-700 border-purple-600 hover:bg-purple-700/80 text-gray-100 shadow-md">
                <Store className="mr-2 h-4 w-4 text-purple-400" />
                {selectedBranch ? selectedBranch.name : "Cambiar Sucursal"}
                <ChevronsUpDown className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-purple-700 text-gray-100 w-[--radix-dropdown-menu-trigger-width]">
              {branches.map((branch) => (
                <DropdownMenuItem
                  key={branch.id}
                  onClick={() => onSelectBranch(branch)}
                  className={`hover:bg-purple-700/50 focus:bg-purple-700/50 ${selectedBranch?.id === branch.id ? 'bg-purple-600/70' : ''}`}
                >
                  {branch.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        <Button
          onClick={onToggleOrdersView}
          variant="outline"
          className="bg-slate-700 border-purple-600 hover:bg-purple-700/80 text-gray-100 shadow-md relative"
        >
          {activeOrdersView ? <LayoutDashboard className="mr-2 h-4 w-4 text-purple-400" /> : <ListOrdered className="mr-2 h-4 w-4 text-purple-400" />}
          {activeOrdersView ? "Ver Menú" : "Ver Pedidos"}
          {activeOrderCount > 0 && !activeOrdersView && (
            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
              {activeOrderCount}
            </span>
          )}
        </Button>

        <Button
          onClick={onCartClick}
          className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white flex items-center gap-2 shadow-lg transform hover:scale-105 transition-transform relative"
          disabled={!selectedBranch || activeOrdersView}
        >
          <PlusCircle size={20} />
          Nuevo Pedido
          {cartItemCount > 0 && (
             <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
              {cartItemCount}
            </span>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-slate-700 border-purple-600 hover:bg-purple-700/80 text-gray-100 shadow-md">
              <UserCircle className="mr-2 h-4 w-4 text-purple-400" />
              {userName || "Usuario"}
              <ChevronsUpDown className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-800 border-purple-700 text-gray-100">
            <DropdownMenuItem disabled className="text-xs text-purple-300">
              Conectado como: {userName}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-purple-700/50" />
            <DropdownMenuItem onClick={onLogout} className="hover:bg-red-600/50 focus:bg-red-600/50 text-red-300 hover:text-red-200 focus:text-red-200">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
             <DropdownMenuSeparator className="bg-purple-700/50" />
             <Link to="/">
                <DropdownMenuItem className="hover:bg-slate-700/50 focus:bg-slate-700/50">
                    Volver al Inicio
                </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
    </header>
  );
};

export default StaffHeader;

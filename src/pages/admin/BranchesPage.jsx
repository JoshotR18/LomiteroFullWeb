
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Search, ServerCrash, FileQuestion } from 'lucide-react';
import useStore from '@/lib/store';
import BranchForm from './components/BranchForm';
import BranchCard from './components/BranchCard';

const initialBranchData = {
  id: null,
  name: '',
  address: '',
  phone: '',
};

const BranchesPage = () => {
  const { toast } = useToast();
  const { branches, fetchBranches, addBranch, updateBranch, deleteBranch, isLoading, error } = useStore(state => ({
    branches: state.branches,
    fetchBranches: state.fetchBranches,
    addBranch: state.addBranch,
    updateBranch: state.updateBranch,
    deleteBranch: state.deleteBranch,
    isLoading: state.isLoading,
    error: state.error,
  }));

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentBranch, setCurrentBranch] = useState(initialBranchData);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchToDelete, setBranchToDelete] = useState(null);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleFormSubmit = async (formData) => {
    try {
      let result;
      if (isEditing) {
        result = await updateBranch(currentBranch.id, formData);
        if (result.success) {
          toast({
            title: "Sucursal Actualizada",
            description: `La sucursal "${formData.name}" ha sido actualizada.`,
            className: "bg-green-100 text-green-800 border-green-300 dark:bg-green-700 dark:text-green-100 dark:border-green-500",
          });
        }
      } else {
        result = await addBranch(formData);
        if (result.success) {
          toast({
            title: "Sucursal Creada",
            description: `La sucursal "${formData.name}" ha sido creada.`,
            className: "bg-green-100 text-green-800 border-green-300 dark:bg-green-700 dark:text-green-100 dark:border-green-500",
          });
        }
      }

      if (result.error) {
        throw new Error(result.error);
      }
      
      setIsFormOpen(false);
      setCurrentBranch(initialBranchData);
      setIsEditing(false);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "No se pudo guardar la sucursal.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (branch) => {
    setCurrentBranch(branch);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (branch) => {
    setBranchToDelete(branch);
  };

  const handleDeleteConfirm = async () => {
    if (!branchToDelete) return;
    
    try {
      const result = await deleteBranch(branchToDelete.id);
      if (result.success) {
        toast({
          title: "Sucursal Eliminada",
          description: `La sucursal "${branchToDelete.name}" ha sido eliminada.`,
          variant: "destructive",
        });
      } else {
        throw new Error(result.error);
      }
      setBranchToDelete(null);
    } catch (err) {
      toast({
        title: "Error al eliminar",
        description: err.message || "No se pudo eliminar la sucursal.",
        variant: "destructive",
      });
      setBranchToDelete(null);
    }
  };

  const filteredBranches = branches.filter(branch =>
    (branch.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (branch.address?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8 bg-slate-50 dark:bg-slate-900 rounded-lg shadow-sm"
    >
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 dark:from-purple-600 dark:via-pink-600 dark:to-red-600">
            Gestión de Sucursales
          </h1>
          <p className="text-slate-600 dark:text-muted-foreground mt-1">Administra todas las sucursales de tu negocio.</p>
        </div>
        <Button
          size="lg"
          onClick={() => {
            setIsEditing(false);
            setCurrentBranch(initialBranchData);
            setIsFormOpen(true);
          }}
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg transform hover:scale-105 transition-transform duration-150"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Añadir Sucursal
        </Button>
      </header>

      <BranchForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        initialData={currentBranch}
        isEditing={isEditing}
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-muted-foreground" />
        <Input
          placeholder="Buscar sucursales por nombre o dirección..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md pl-10 py-2 border-2 border-slate-300 dark:border-input focus:border-purple-500 dark:focus:border-primary transition-colors rounded-lg shadow-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400"
        />
      </div>
      
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 dark:border-primary border-t-transparent rounded-full"
          />
        </div>
      )}

      {error && !isLoading && (
         <div className="text-center py-10 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg shadow-md">
          <ServerCrash className="mx-auto h-16 w-16 text-red-500 dark:text-red-400 mb-4" />
          <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Error al cargar sucursales</h3>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button onClick={() => fetchBranches()} className="mt-4 bg-red-500 hover:bg-red-600 text-white">Reintentar</Button>
        </div>
      )}

      {!isLoading && !error && filteredBranches.length === 0 && (
        <div className="text-center py-10 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700/30 rounded-lg shadow-md">
          <FileQuestion className="mx-auto h-16 w-16 text-yellow-500 dark:text-yellow-400 mb-4" />
          <h3 className="text-xl font-semibold text-yellow-700 dark:text-yellow-300 mb-2">No se encontraron sucursales</h3>
          <p className="text-yellow-600 dark:text-yellow-400">
            {searchTerm ? "Intenta con otro término de búsqueda." : "Añade una nueva sucursal para empezar."}
          </p>
        </div>
      )}
      
      {!isLoading && !error && filteredBranches.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {filteredBranches.map((branch) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                onEdit={handleEdit}
                onDelete={openDeleteDialog}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AlertDialog open={!!branchToDelete} onOpenChange={() => setBranchToDelete(null)}>
        <AlertDialogContent className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:via-slate-900 dark:to-black text-slate-900 dark:text-white border-slate-300 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-yellow-600 dark:text-yellow-400">¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Esta acción no se puede deshacer. Esto eliminará permanentemente la sucursal <span className="font-semibold text-yellow-700 dark:text-yellow-500">{branchToDelete?.name}</span> y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white"
            >
              Sí, eliminar sucursal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default BranchesPage;


import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Search, Package, ServerCrash, FileQuestion } from 'lucide-react';
import useStore from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';

const CategoriesPage = () => {
  const { 
    categories, 
    fetchCategories, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    products,
    fetchProducts,
    isLoading: isLoadingCategories, 
    error: errorCategories 
  } = useStore(state => ({
    categories: state.categories,
    fetchCategories: state.fetchCategories,
    addCategory: state.addCategory,
    updateCategory: state.updateCategory,
    deleteCategory: state.deleteCategory,
    products: state.products,
    fetchProducts: state.fetchProducts,
    isLoading: state.isLoading,
    error: state.error,
  }));
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
  });

  useEffect(() => {
    fetchCategories();
    fetchProducts(); 
  }, [fetchCategories, fetchProducts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast({ title: "Error", description: "El nombre es requerido.", variant: "destructive" });
      return;
    }

    try {
      let result;
      if (selectedCategory) {
        result = await updateCategory(selectedCategory.id, formData);
        if (result.success) {
          toast({ title: "Categoría actualizada", description: "La categoría ha sido actualizada exitosamente.", className: "bg-green-100 text-green-800 border-green-300 dark:bg-green-700 dark:text-green-100 dark:border-green-500" });
        }
      } else {
        result = await addCategory(formData);
        if (result.success) {
          toast({ title: "Categoría agregada", description: "La categoría ha sido agregada exitosamente.", className: "bg-green-100 text-green-800 border-green-300 dark:bg-green-700 dark:text-green-100 dark:border-green-500" });
        }
      }

      if (result.error) {
        throw new Error(result.error);
      }

      setIsDialogOpen(false);
      setSelectedCategory(null);
      setFormData({ name: '', description: '', icon: '' });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "No se pudo guardar la categoría.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      icon: category.icon || '',
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (category) => {
    const productsInCategory = products.filter(p => p.category_id === category.id);
    if (productsInCategory.length > 0) {
      toast({
        title: "No se puede eliminar",
        description: "Esta categoría tiene productos asociados. Elimine o reasigne los productos primero.",
        variant: "destructive",
      });
    } else {
      setCategoryToDelete(category);
    }
  };

  const handleDeleteConfirm = async () => {
    if (categoryToDelete) {
      try {
        const result = await deleteCategory(categoryToDelete.id);
        if (result.success) {
          toast({
            title: "Categoría eliminada",
            description: "La categoría ha sido eliminada exitosamente",
            variant: "destructive"
          });
        } else {
          throw new Error(result.error);
        }
        setCategoryToDelete(null);
      } catch (err) {
        toast({
          title: "Error al eliminar",
          description: err.message || "No se pudo eliminar la categoría.",
          variant: "destructive",
        });
        setCategoryToDelete(null);
      }
    }
  };

  const filteredCategories = categories.filter(category =>
    (category.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (category.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50 dark:bg-slate-900 rounded-lg shadow-sm"
    >
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-blue-600 dark:via-purple-600 dark:to-pink-600">
            Categorías de Productos
          </h2>
          <p className="text-slate-600 dark:text-muted-foreground mt-1">Organiza tus productos en categorías claras y concisas.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setSelectedCategory(null);
                setFormData({ name: '', description: '', icon: '' });
              }}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg transform hover:scale-105 transition-transform duration-150"
            >
              <Plus className="mr-2 h-4 w-4" /> Agregar Categoría
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:via-slate-900 dark:to-black text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 rounded-lg shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-cyan-400 dark:from-sky-400 dark:to-cyan-300">
                {selectedCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div>
                <Label htmlFor="name" className="text-sky-600 dark:text-sky-300">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Ej: Hamburguesas"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-sky-600 dark:text-sky-300">Descripción</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Ej: Deliciosas hamburguesas artesanales"
                />
              </div>
              <div>
                <Label htmlFor="icon" className="text-sky-600 dark:text-sky-300">Ícono (emoji o nombre de Lucide Icon)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="🍔 ó Burger"
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white w-full sm:w-auto">
                  {selectedCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-muted-foreground" />
        <Input
          placeholder="Buscar categorías por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md pl-10 py-2 border-2 border-slate-300 dark:border-input focus:border-purple-500 dark:focus:border-primary transition-colors rounded-lg shadow-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400"
        />
      </div>

      {isLoadingCategories && (
         <div className="flex justify-center items-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 dark:border-primary border-t-transparent rounded-full"
          />
        </div>
      )}

      {errorCategories && !isLoadingCategories && (
         <div className="text-center py-10 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg shadow-md">
          <ServerCrash className="mx-auto h-16 w-16 text-red-500 dark:text-red-400 mb-4" />
          <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Error al cargar categorías</h3>
          <p className="text-red-600 dark:text-red-400">{errorCategories}</p>
          <Button onClick={() => fetchCategories()} className="mt-4 bg-red-500 hover:bg-red-600 text-white">Reintentar</Button>
        </div>
      )}
      
      {!isLoadingCategories && !errorCategories && filteredCategories.length === 0 && (
         <div className="text-center py-10 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700/30 rounded-lg shadow-md">
          <FileQuestion className="mx-auto h-16 w-16 text-yellow-500 dark:text-yellow-400 mb-4" />
          <h3 className="text-xl font-semibold text-yellow-700 dark:text-yellow-300 mb-2">No se encontraron categorías</h3>
          <p className="text-yellow-600 dark:text-yellow-400">
            {searchTerm ? "Intenta con otro término de búsqueda." : "Añade una nueva categoría para empezar."}
          </p>
        </div>
      )}

      {!isLoadingCategories && !errorCategories && filteredCategories.length > 0 && (
        <Card className="shadow-xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-gray-900 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400">
              Lista de Categorías
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 dark:border-slate-700">
                    <TableHead className="text-purple-600 dark:text-purple-300">Ícono</TableHead>
                    <TableHead className="text-purple-600 dark:text-purple-300">Nombre</TableHead>
                    <TableHead className="text-purple-600 dark:text-purple-300">Descripción</TableHead>
                    <TableHead className="text-purple-600 dark:text-purple-300">Productos</TableHead>
                    <TableHead className="text-right text-purple-600 dark:text-purple-300">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id} className="border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                      <TableCell className="text-2xl text-slate-700 dark:text-slate-300">{category.icon || <Package className="w-6 h-6 text-slate-500 dark:text-slate-400"/>}</TableCell>
                      <TableCell className="font-medium text-slate-800 dark:text-slate-200">{category.name}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">{category.description}</TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300">
                        {products.filter(p => p.category_id === category.id).length}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(category)}
                          className="text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400"
                          onClick={() => openDeleteDialog(category)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
        <AlertDialogContent className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:via-slate-900 dark:to-black text-slate-900 dark:text-white border-slate-300 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-yellow-600 dark:text-yellow-400">¿Confirmas la eliminación?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Esta acción eliminará la categoría <span className="font-semibold text-yellow-700 dark:text-yellow-500">{categoryToDelete?.name}</span>. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white">
              Eliminar Categoría
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default CategoriesPage;

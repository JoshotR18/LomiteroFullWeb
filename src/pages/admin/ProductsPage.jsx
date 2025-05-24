
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, PackageOpen, ServerCrash, FileQuestion, Edit2, Trash2 } from 'lucide-react';
import useStore from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';
import ProductForm from '@/pages/admin/components/ProductForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatGuaranies } from '@/lib/store';

const ProductsPageHeader = ({ onAddNew }) => (
  <header className="flex flex-col sm:flex-row justify-between items-center gap-4">
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 dark:from-green-400 dark:via-emerald-500 dark:to-teal-600">
        Gestión de Productos
      </h1>
      <p className="text-slate-600 dark:text-muted-foreground mt-1">Crea, edita y organiza los productos de tu menú.</p>
    </div>
    <Button
      size="lg"
      onClick={onAddNew}
      className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg transform hover:scale-105 transition-transform duration-150"
    >
      <Plus className="mr-2 h-5 w-5" />
      Añadir Producto
    </Button>
  </header>
);

const ProductsSearchBar = ({ searchTerm, onSearchTermChange }) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-muted-foreground" />
    <Input
      placeholder="Buscar productos por nombre o categoría..."
      value={searchTerm}
      onChange={(e) => onSearchTermChange(e.target.value)}
      className="w-full max-w-md pl-10 py-2 border-2 border-slate-300 dark:border-input focus:border-emerald-500 dark:focus:border-primary transition-colors rounded-lg shadow-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400"
    />
  </div>
);

const ProductRowDisplay = ({ product, categoryName, onEdit, onDelete }) => (
  <TableRow className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
    <TableCell>
      <div className="flex items-center gap-3">
        {product.image_url ? (
          <img-replace
            src={product.image_url}
            alt={product.name}
            className="h-12 w-12 rounded-md object-cover shadow-sm border border-slate-200 dark:border-slate-700"
          />
        ) : (
          <div className="h-12 w-12 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-400 border border-slate-300 dark:border-slate-600">
            <PackageOpen size={24} />
          </div>
        )}
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-100">{product.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{product.description}</p>
        </div>
      </div>
    </TableCell>
    <TableCell className="text-slate-600 dark:text-slate-300">{categoryName}</TableCell>
    <TableCell className="text-slate-700 dark:text-slate-300">{formatGuaranies(product.price)}</TableCell>
    <TableCell className="text-slate-600 dark:text-slate-300">
      {product.stock_control_type === 'ingredients' ? (
        <Badge variant="outline" className="border-blue-400 text-blue-600 dark:border-blue-500 dark:text-blue-300">Por Ingredientes</Badge>
      ) : (
        <Badge variant="outline" className="border-purple-400 text-purple-600 dark:border-purple-500 dark:text-purple-300">Stock Directo</Badge>
      )}
    </TableCell>
    <TableCell>
      {product.active ? (
        <Badge className="bg-green-500 text-white dark:bg-green-500 dark:text-white">Activo</Badge>
      ) : (
        <Badge variant="destructive" className="bg-red-500 dark:bg-red-600">Inactivo</Badge>
      )}
    </TableCell>
    <TableCell className="text-right">
      <div className="flex justify-end items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit(product)} className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20">
          <Edit2 size={18} />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(product)} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/20">
          <Trash2 size={18} />
        </Button>
      </div>
    </TableCell>
  </TableRow>
);


const ProductsTable = ({ products, categories, onEdit, onDelete }) => (
  <Card className="shadow-xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-gray-900 border-slate-200 dark:border-slate-700">
    <CardHeader>
      <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400 flex items-center">
        <PackageOpen className="mr-3 h-7 w-7" /> Lista de Productos
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 dark:border-slate-700">
              <TableHead className="text-emerald-600 dark:text-emerald-300">Nombre</TableHead>
              <TableHead className="text-emerald-600 dark:text-emerald-300">Categoría</TableHead>
              <TableHead className="text-emerald-600 dark:text-emerald-300">Precio</TableHead>
              <TableHead className="text-emerald-600 dark:text-emerald-300">Control Stock</TableHead>
              <TableHead className="text-emerald-600 dark:text-emerald-300">Estado</TableHead>
              <TableHead className="text-right text-emerald-600 dark:text-emerald-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const categoryName = categories.find(c => c.id === product.category_id)?.name || 'N/A';
              return (
                <ProductRowDisplay
                  key={product.id}
                  product={product}
                  categoryName={categoryName}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              );
            })}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
);

const ProductsPage = () => {
  const { 
    products, fetchProducts, categories, fetchCategories, 
    ingredients, fetchIngredients, isLoadingProducts, productsError,
    addProduct, updateProduct, deleteProduct
  } = useStore(state => ({
    products: state.products, fetchProducts: state.fetchProducts,
    categories: state.categories, fetchCategories: state.fetchCategories,
    ingredients: state.ingredients, fetchIngredients: state.fetchIngredients,
    isLoadingProducts: state.isLoadingProducts, productsError: state.productsError,
    addProduct: state.addProduct, updateProduct: state.updateProduct, deleteProduct: state.deleteProduct,
  }));

  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentProduct, setCurrentProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const loadData = useCallback(async () => {
    await fetchProducts();
    await fetchCategories();
    await fetchIngredients();
  }, [fetchProducts, fetchCategories, fetchIngredients]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFormSubmit = async (formData) => {
    try {
      let result;
      if (currentProduct) {
        result = await updateProduct(currentProduct.id, formData);
        if (result.success) {
          toast({ title: "Producto Actualizado", description: `El producto "${formData.name}" ha sido actualizado.`, className: "bg-green-100 text-green-800 border-green-300 dark:bg-green-700 dark:text-green-100 dark:border-green-500" });
        }
      } else {
        result = await addProduct(formData);
        if (result.success) {
          toast({ title: "Producto Creado", description: `El producto "${formData.name}" ha sido creado.`, className: "bg-green-100 text-green-800 border-green-300 dark:bg-green-700 dark:text-green-100 dark:border-green-500" });
        }
      }

      if (!result || result.error) {
        throw new Error(result?.error?.message || result?.error || "Error desconocido al guardar el producto.");
      }
      setIsFormOpen(false);
      setCurrentProduct(null);
      
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "No se pudo guardar el producto.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (product) => {
    setProductToDelete(product);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      const result = await deleteProduct(productToDelete.id); 
      if (result.success) {
        toast({
          title: "Producto Eliminado",
          description: `El producto "${productToDelete.name}" ha sido eliminado permanentemente.`,
          className: "bg-red-100 text-red-800 border-red-300 dark:bg-red-600 dark:text-white",
        });
      } else {
        throw new Error(result.error.message || result.error || "Error desconocido al eliminar producto.");
      }
      setProductToDelete(null);
      
    } catch (err) {
      toast({
        title: "Error al eliminar",
        description: err.message || "No se pudo eliminar el producto.",
        variant: "destructive",
      });
      setProductToDelete(null);
    }
  };

  const filteredProducts = products.filter(product => {
    const categoryName = categories.find(c => c.id === product.category_id)?.name || '';
    return (
      (product.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (categoryName.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  });

  const handleAddNewProduct = () => {
    setCurrentProduct(null);
    setIsFormOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8 bg-slate-50 dark:bg-slate-900 rounded-lg shadow-sm"
    >
      <ProductsPageHeader onAddNew={handleAddNewProduct} />

      <ProductForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        initialData={currentProduct}
        categories={categories || []}
        ingredientsList={ingredients || []}
        isLoading={isLoadingProducts} 
      />

      <ProductsSearchBar searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />

      {isLoadingProducts && (
        <div className="flex justify-center items-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-emerald-500 dark:border-emerald-500 border-t-transparent rounded-full"
          />
        </div>
      )}

      {productsError && !isLoadingProducts && (
         <div className="text-center py-10 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg shadow-md">
          <ServerCrash className="mx-auto h-16 w-16 text-red-500 dark:text-red-400 mb-4" />
          <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Error al cargar productos</h3>
          <p className="text-red-600 dark:text-red-400">{typeof productsError === 'string' ? productsError : productsError.message || "Error desconocido"}</p>
          <Button onClick={loadData} className="mt-4 bg-red-500 hover:bg-red-600 text-white">Reintentar</Button>
        </div>
      )}

      {!isLoadingProducts && !productsError && filteredProducts.length === 0 && (
         <div className="text-center py-10 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700/30 rounded-lg shadow-md">
          <FileQuestion className="mx-auto h-16 w-16 text-yellow-500 dark:text-yellow-400 mb-4" />
          <h3 className="text-xl font-semibold text-yellow-700 dark:text-yellow-300 mb-2">No se encontraron productos</h3>
          <p className="text-yellow-600 dark:text-yellow-400">
            {searchTerm ? "Intenta con otro término de búsqueda." : "Añade un nuevo producto para empezar."}
          </p>
        </div>
      )}
      
      {!isLoadingProducts && !productsError && filteredProducts.length > 0 && (
        <ProductsTable 
          products={filteredProducts} 
          categories={categories || []} 
          onEdit={handleEdit} 
          onDelete={openDeleteDialog} 
        />
      )}

      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:via-slate-900 dark:to-black text-slate-900 dark:text-white border-slate-300 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-red-600 dark:text-red-400">¿Eliminar Producto Permanentemente?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Esta acción eliminará permanentemente el producto <span className="font-semibold text-red-700 dark:text-red-500">{productToDelete?.name}</span> y todas sus referencias en ítems de pedidos. Esta acción no se puede deshacer y afectará los registros históricos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white"
            >
              Sí, eliminar producto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default ProductsPage;

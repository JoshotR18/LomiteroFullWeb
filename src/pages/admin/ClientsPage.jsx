
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import useStore from '@/lib/store';
import { PlusCircle, Edit, Trash2, Search, Eye, EyeOff, Users, UserPlus, Building } from 'lucide-react';

const UserForm = ({ isOpen, onOpenChange, onSubmit, user, branches, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client',
    branch_id: '__NONE__', 
  });
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '', 
        role: user.role || 'client',
        branch_id: user.branch_id || '__NONE__', 
      });
    } else {
      setFormData({ name: '', email: '', password: '', role: 'client', branch_id: '__NONE__' });
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = { ...formData };
    if (!dataToSubmit.password && !user) { 
      toast({ title: "Error", description: "La contraseña es obligatoria para nuevos usuarios.", variant: "destructive" });
      return;
    }
    if (!dataToSubmit.password) { 
      delete dataToSubmit.password;
    }
    if (dataToSubmit.role !== 'staff') {
      dataToSubmit.branch_id = null; 
    } else if (dataToSubmit.branch_id === '__NONE__') {
      dataToSubmit.branch_id = null; 
    }
    onSubmit(dataToSubmit);
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-purple-700 text-slate-900 dark:text-gray-100 shadow-2xl rounded-lg sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-purple-600 dark:text-purple-300 text-2xl flex items-center">
            <UserPlus className="mr-3 h-6 w-6" />
            {user ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400 pt-2">
            {user ? 'Modifica los detalles del usuario.' : 'Completa el formulario para agregar un nuevo usuario.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 dark:text-gray-300">Nombre Completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-purple-600 text-slate-900 dark:text-gray-100 focus:border-purple-500 dark:focus:border-purple-400"
              placeholder="Ej: Juan Pérez"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 dark:text-gray-300">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-purple-600 text-slate-900 dark:text-gray-100 focus:border-purple-500 dark:focus:border-purple-400"
              placeholder="ejemplo@correo.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700 dark:text-gray-300">
              Contraseña {user ? '(Dejar en blanco para no cambiar)' : ''}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!user} 
                minLength={user ? undefined : 6}
                className="bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-purple-600 text-slate-900 dark:text-gray-100 focus:border-purple-500 dark:focus:border-purple-400 pr-10"
                placeholder={user ? "Nueva contraseña (opcional)" : "Mínimo 6 caracteres"}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="text-slate-700 dark:text-gray-300">Rol</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value, branch_id: value !== 'staff' ? '__NONE__' : formData.branch_id })}
            >
              <SelectTrigger className="bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-purple-600 text-slate-900 dark:text-gray-100 focus:border-purple-500 dark:focus:border-purple-400">
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-purple-700 text-slate-900 dark:text-gray-100">
                <SelectItem value="admin" className="hover:!bg-purple-100 dark:hover:!bg-purple-600 focus:!bg-purple-100 dark:focus:!bg-purple-600">Administrador</SelectItem>
                <SelectItem value="staff" className="hover:!bg-purple-100 dark:hover:!bg-purple-600 focus:!bg-purple-100 dark:focus:!bg-purple-600">Personal</SelectItem>
                <SelectItem value="client" className="hover:!bg-purple-100 dark:hover:!bg-purple-600 focus:!bg-purple-100 dark:focus:!bg-purple-600">Cliente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.role === 'staff' && (
            <div className="space-y-2">
              <Label htmlFor="branch_id" className="text-slate-700 dark:text-gray-300">Sucursal Asignada (Personal)</Label>
              <Select
                value={formData.branch_id || '__NONE__'}
                onValueChange={(value) => setFormData({ ...formData, branch_id: value })}
              >
                <SelectTrigger className="bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-purple-600 text-slate-900 dark:text-gray-100 focus:border-purple-500 dark:focus:border-purple-400">
                  <SelectValue placeholder="Seleccionar sucursal" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-purple-700 text-slate-900 dark:text-gray-100">
                  <SelectItem value="__NONE__" className="hover:!bg-purple-100 dark:hover:!bg-purple-600 focus:!bg-purple-100 dark:focus:!bg-purple-600">Ninguna</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id} className="hover:!bg-purple-100 dark:hover:!bg-purple-600 focus:!bg-purple-100 dark:focus:!bg-purple-600">
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter className="pt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="text-slate-700 dark:text-gray-300 border-slate-400 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white">
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 hover:from-purple-600 hover:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700 text-white" disabled={isLoading}>
              {isLoading ? 'Guardando...' : (user ? 'Guardar Cambios' : 'Agregar Usuario')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


const ClientsPage = () => {
  const { users, fetchUsers, addUser, updateUser, deleteUser, branches, fetchBranches, isLoading } = useStore();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const loadData = useCallback(async () => {
    await fetchUsers();
    await fetchBranches();
  }, [fetchUsers, fetchBranches]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFormSubmit = async (userData) => {
    let result;
    if (editingUser) {
      result = await updateUser(editingUser.id, userData);
      if (result.success) {
        toast({ title: "Usuario Actualizado", description: "Los datos del usuario han sido actualizados.", className: "bg-green-100 text-green-800 border-green-300 dark:bg-green-700 dark:text-green-100 dark:border-green-500" });
      }
    } else {
      result = await addUser(userData);
      if (result.success) {
        toast({ title: "Usuario Agregado", description: "El nuevo usuario ha sido creado.", className: "bg-green-100 text-green-800 border-green-300 dark:bg-green-700 dark:text-green-100 dark:border-green-500" });
      }
    }

    if (result.success) {
      setIsFormOpen(false);
      setEditingUser(null);
    } else {
      toast({ title: "Error", description: result.error || "No se pudo guardar el usuario.", variant: "destructive" });
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = async (userId) => {
    const result = await deleteUser(userId);
    if (result.success) {
      toast({ title: "Usuario Eliminado", description: "El usuario ha sido eliminado.", className: "bg-red-100 text-red-800 border-red-300 dark:bg-red-500 dark:text-white" });
    } else {
      toast({ title: "Error", description: result.error || "No se pudo eliminar el usuario.", variant: "destructive" });
    }
  };

  const filteredUsers = (Array.isArray(users) ? users : [])
    .filter(user =>
      (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )
    .filter(user => filterRole === 'all' || user.role === filterRole);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 md:p-10 bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-gray-900 dark:to-slate-900 min-h-screen text-slate-800 dark:text-gray-100 rounded-lg shadow-sm"
    >
      <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Users className="h-10 w-10 text-purple-500 dark:text-purple-400" />
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 dark:from-purple-400 dark:via-pink-400 dark:to-orange-400">
            Gestión de Usuarios
          </h1>
        </div>
        <Button 
          onClick={() => { setEditingUser(null); setIsFormOpen(true); }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 hover:from-purple-600 hover:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700 text-white flex items-center gap-2 shadow-lg transform hover:scale-105 transition-transform"
        >
          <UserPlus size={20} />
          Agregar Usuario
        </Button>
      </header>

      <div className="mb-6 p-6 bg-white dark:bg-slate-800/50 rounded-xl shadow-xl border border-slate-200 dark:border-purple-700/30 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-purple-600 text-slate-900 dark:text-gray-100 focus:border-purple-500 dark:focus:border-purple-400"
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-full md:w-[180px] bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-purple-600 text-slate-900 dark:text-gray-100 focus:border-purple-500 dark:focus:border-purple-400">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-purple-700 text-slate-900 dark:text-gray-100">
            <SelectItem value="all" className="hover:!bg-purple-100 dark:hover:!bg-purple-600 focus:!bg-purple-100 dark:focus:!bg-purple-600">Todos los Roles</SelectItem>
            <SelectItem value="admin" className="hover:!bg-purple-100 dark:hover:!bg-purple-600 focus:!bg-purple-100 dark:focus:!bg-purple-600">Administrador</SelectItem>
            <SelectItem value="staff" className="hover:!bg-purple-100 dark:hover:!bg-purple-600 focus:!bg-purple-100 dark:focus:!bg-purple-600">Personal</SelectItem>
            <SelectItem value="client" className="hover:!bg-purple-100 dark:hover:!bg-purple-600 focus:!bg-purple-100 dark:focus:!bg-purple-600">Cliente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && !isFormOpen && <p className="text-center text-purple-600 dark:text-purple-300">Cargando usuarios...</p>}
      
      {!isLoading && filteredUsers.length === 0 && (
        <p className="text-center text-xl text-purple-600 dark:text-purple-300 py-8">
          No se encontraron usuarios que coincidan con los filtros.
        </p>
      )}

      {!isLoading && filteredUsers.length > 0 && (
        <div className="overflow-x-auto bg-white dark:bg-slate-800/50 rounded-xl shadow-2xl border border-slate-200 dark:border-purple-700/30">
          <Table>
            <TableHeader>
              <TableRow className="border-b-slate-300 dark:border-b-purple-700/50 hover:bg-slate-100 dark:hover:bg-slate-700/30">
                <TableHead className="text-purple-700 dark:text-purple-300">Nombre</TableHead>
                <TableHead className="text-purple-700 dark:text-purple-300">Email</TableHead>
                <TableHead className="text-purple-700 dark:text-purple-300">Rol</TableHead>
                <TableHead className="text-purple-700 dark:text-purple-300">Sucursal (Staff)</TableHead>
                <TableHead className="text-purple-700 dark:text-purple-300">Fecha de Creación</TableHead>
                <TableHead className="text-right text-purple-700 dark:text-purple-300">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-b-slate-200 dark:border-b-purple-800/30 hover:bg-slate-100 dark:hover:bg-slate-700/40 transition-colors duration-150">
                  <TableCell className="font-medium text-slate-800 dark:text-gray-200">{user.name}</TableCell>
                  <TableCell className="text-slate-600 dark:text-gray-300">{user.email}</TableCell>
                  <TableCell className="text-slate-600 dark:text-gray-300 capitalize">{user.role}</TableCell>
                  <TableCell className="text-slate-600 dark:text-gray-300">
                    {user.role === 'staff' && user.branches ? user.branches.name : (user.role === 'staff' && !user.branches ? 'No asignada' : 'N/A')}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-gray-400 text-sm">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20">
                      <Edit size={18} />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/20">
                          <Trash2 size={18} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-purple-700 text-slate-900 dark:text-gray-100">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-red-600 dark:text-red-400">¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
                            Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario <span className="font-semibold text-purple-700 dark:text-purple-300">{user.name}</span>.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="text-slate-700 dark:text-gray-300 border-slate-400 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white">Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(user.id)} className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white">
                            Eliminar Usuario
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <UserForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        user={editingUser}
        branches={Array.isArray(branches) ? branches : []}
        isLoading={isLoading}
      />
    </motion.div>
  );
};

export default ClientsPage;

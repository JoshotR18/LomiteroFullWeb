
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import useStore from '@/lib/store';

export function AuthForm({ mode = 'login', onSubmit, switchMode, role = 'client', isLoading = false, formGradient = "bg-slate-800/70", accentColor = "text-purple-400" }) {
  const { toast } = useToast();
  const { branches } = useStore();
  const [formData, setFormData] = React.useState({
    name: '',
    email: '', 
    password: '',
    confirmPassword: '',
    branchId: ''
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (mode === 'register' && role === 'client') {
      if (!formData.name.trim()) {
        toast({ title: "Error de Validación", description: "Por favor ingresa tu nombre completo.", variant: "destructive" });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast({ title: "Error de Validación", description: "Las contraseñas no coinciden.", variant: "destructive" });
        return;
      }
      if (formData.password.length < 6) {
        toast({ title: "Error de Validación", description: "La contraseña debe tener al menos 6 caracteres.", variant: "destructive" });
        return;
      }
      if (!formData.branchId) {
        toast({ title: "Error de Validación", description: "Por favor selecciona una sucursal para registrarte.", variant: "destructive" });
        return;
      }
    }
    onSubmit(formData);
  };

  const inputClass = "bg-slate-700/50 border-slate-600 placeholder-slate-400 text-white focus:bg-slate-700 focus:border-purple-500 ring-offset-slate-900 focus:ring-purple-500";
  const labelClass = "text-slate-300";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "circOut" }}
      className="w-full max-w-md"
    >
      <Card className={`w-full backdrop-blur-lg border border-slate-700/50 shadow-2xl rounded-xl ${formGradient}`}>
        <CardHeader className="text-center">
          <CardTitle className={`text-3xl font-bold ${accentColor} drop-shadow-md`}>{mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</CardTitle>
          <CardDescription className="text-slate-400 pt-1">
            {mode === 'login' 
              ? `Ingresa tus credenciales para acceder como ${role}`
              : `Regístrate para disfrutar de Lomi-tero como ${role}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && role === 'client' && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className={labelClass}>Nombre Completo</Label>
                <Input
                  id="name" type="text" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required disabled={isLoading} placeholder="Ej: Juan Pérez"
                  className={inputClass}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className={labelClass}>Correo Electrónico</Label>
              <Input
                id="email" type="email" value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required disabled={isLoading} placeholder={role === 'admin' || role === 'staff' ? "email@empresa.com" : "tu@email.com"}
                className={inputClass}
              />
            </div>
            
            {role === 'client' && mode === 'register' && (
              <div className="space-y-1.5">
                <Label htmlFor="branch" className={labelClass}>Sucursal Preferida</Label>
                <Select
                  value={formData.branchId}
                  onValueChange={(value) => setFormData({ ...formData, branchId: value })}
                  disabled={isLoading} required
                >
                  <SelectTrigger className={`${inputClass} data-[placeholder]:text-slate-400`}>
                    <SelectValue placeholder="Selecciona una sucursal" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-700 text-slate-200">
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id} className="focus:bg-purple-600/50 focus:text-white">
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5 relative">
              <Label htmlFor="password" className={labelClass}>Contraseña</Label>
              <Input
                id="password" type={showPassword ? "text" : "password"} value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required disabled={isLoading} placeholder={mode === 'register' && role === 'client' ? "Mínimo 6 caracteres" : "••••••••"}
                className={`${inputClass} pr-10`}
              />
              <Button type="button" variant="ghost" size="icon" 
                className="absolute right-1 top-7 h-7 w-7 text-slate-400 hover:bg-slate-700 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18}/> : <Eye size={18} />}
              </Button>
            </div>

            {mode === 'register' && role === 'client' && (
              <div className="space-y-1.5 relative">
                <Label htmlFor="confirmPassword" className={labelClass}>Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required disabled={isLoading} placeholder="Confirma tu contraseña"
                  className={`${inputClass} pr-10`}
                />
                <Button type="button" variant="ghost" size="icon" 
                  className="absolute right-1 top-7 h-7 w-7 text-slate-400 hover:bg-slate-700 hover:text-white"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18} />}
                </Button>
              </div>
            )}

            <Button 
              type="submit" 
              className={`w-full font-semibold text-base py-3 bg-gradient-to-r ${mode === 'login' ? 'from-pink-500 via-purple-500 to-indigo-600' : 'from-green-500 via-teal-500 to-cyan-600'} hover:opacity-90 text-white shadow-lg transform hover:scale-105 transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${mode === 'login' ? 'focus:ring-purple-500' : 'focus:ring-teal-500'}`} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {mode === 'login' ? 'Iniciando...' : 'Registrando...'}
                </>
              ) : (
                mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'
              )}
            </Button>
          </form>
        </CardContent>
        {role === 'client' && ( 
          <CardFooter className="flex justify-center pt-4">
            <Button 
              variant="link" 
              onClick={switchMode}
              disabled={isLoading}
              className={`${accentColor} hover:text-opacity-80 transition-opacity duration-300`}
            >
              {mode === 'login' 
                ? '¿Aún no tienes cuenta? Regístrate aquí'
                : '¿Ya tienes una cuenta? Inicia Sesión'}
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}

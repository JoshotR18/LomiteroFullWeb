
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/ui/auth-form';
import useStore from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Lock, Users, ShoppingBag, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LoginPage = ({ role }) => {
  const navigate = useNavigate();
  const { login, registerClient, fetchBranches, isAuthenticated: storeIsAuthenticated, role: storeRole } = useStore();
  const { toast } = useToast();
  const [mode, setMode] = useState('login');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    if (storeIsAuthenticated) {
      if (storeRole === 'admin') navigate('/admin');
      else if (storeRole === 'client') navigate('/client');
      else if (storeRole === 'staff') navigate('/staff');
    }
  }, [storeIsAuthenticated, storeRole, navigate]);

  const handleLogin = async (credentials) => {
    setIsLoading(true);
    const loginCredentials = { username: credentials.email, password: credentials.password };

    const result = await login(loginCredentials, role);
    setIsLoading(false);
    if (result.success) {
      toast({
        title: "Inicio de Sesión Exitoso",
        description: `¡Bienvenido de nuevo, ${result.user.name || result.user.email}!`,
        className: "bg-green-600 text-white shadow-xl border-green-700",
      });
      if (role === 'admin') navigate('/admin');
      else if (role === 'client') navigate('/client');
      else if (role === 'staff') navigate('/staff');
    } else {
      toast({
        title: "Error de Inicio de Sesión",
        description: result.error || "Credenciales incorrectas o error del servidor.",
        variant: "destructive",
        className: "shadow-xl border-red-700"
      });
    }
  };

  const handleRegister = async (userData) => {
    setIsLoading(true);
    const result = await registerClient({
      email: userData.email,
      password: userData.password,
      name: userData.name, 
      branch_id: userData.branchId,
    });
    setIsLoading(false);
    if (result.success && result.needsVerification) {
      toast({
        title: "Registro Casi Completo",
        description: "Se ha enviado un correo de verificación. Por favor, revisa tu bandeja de entrada.",
        className: "bg-yellow-500 text-black shadow-xl border-yellow-600",
        duration: 7000,
      });
      setMode('login'); 
    } else if (result.success && !result.needsVerification) {
       toast({
        title: "Registro Exitoso",
        description: "Tu cuenta ha sido creada y verificada. Por favor, inicia sesión.",
        className: "bg-green-600 text-white shadow-xl border-green-700",
      });
      setMode('login');
    }
    else {
      toast({
        title: "Error de Registro",
        description: result.error || "No se pudo registrar el usuario.",
        variant: "destructive",
        className: "shadow-xl border-red-700"
      });
    }
  };

  const handleSubmit = (formData) => {
    if (mode === 'login') {
      handleLogin(formData);
    } else {
      handleRegister(formData);
    }
  };

  const pageConfig = {
    admin: {
      title: "Acceso Administrador",
      icon: <Lock className="h-10 w-10" />,
      gradientFrom: "from-red-500",
      gradientTo: "to-pink-600",
      accentColor: "text-red-400",
      formGradient: "bg-gradient-to-br from-slate-800 via-slate-800/80 to-red-900/50"
    },
    client: {
      title: "Portal de Cliente",
      icon: <ShoppingBag className="h-10 w-10" />,
      gradientFrom: "from-blue-500",
      gradientTo: "to-sky-600",
      accentColor: "text-blue-400",
      formGradient: "bg-gradient-to-br from-slate-800 via-slate-800/80 to-blue-900/50"
    },
    staff: {
      title: "Acceso Personal",
      icon: <Users className="h-10 w-10" />,
      gradientFrom: "from-purple-500",
      gradientTo: "to-indigo-600",
      accentColor: "text-purple-400",
      formGradient: "bg-gradient-to-br from-slate-800 via-slate-800/80 to-purple-900/50"
    }
  };

  const currentConfig = pageConfig[role] || pageConfig.client;

  return (
    <div className={`relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br ${currentConfig.gradientFrom} ${currentConfig.gradientTo} p-4 selection:bg-purple-500 selection:text-white`}>
      <motion.div 
        className="text-center mb-6"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className={`inline-block p-4 bg-slate-800/60 backdrop-blur-sm rounded-full shadow-2xl mb-4 border-2 border-white/20 ${currentConfig.accentColor}`}>
          {currentConfig.icon}
        </div>
        <h1 className="text-5xl font-bold text-white tracking-tight drop-shadow-lg">{currentConfig.title}</h1>
         <p className="text-slate-300 mt-2 text-lg">Bienvenido a Lomi-tero</p>
      </motion.div>
      
      <div className="flex-grow flex flex-col items-center justify-center w-full px-4">
        <AuthForm 
          mode={mode} 
          onSubmit={handleSubmit} 
          switchMode={() => setMode(prev => prev === 'login' ? 'register' : 'login')}
          role={role}
          isLoading={isLoading}
          formGradient={currentConfig.formGradient}
          accentColor={currentConfig.accentColor}
        />
        
        {role !== 'client' && (
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button 
              variant="outline" 
              onClick={() => navigate('/')} 
              className="text-slate-200 border-slate-600 hover:bg-slate-700/50 hover:text-white transition-colors duration-300 group"
            >
              <Home className="mr-2 h-4 w-4 text-slate-400 group-hover:text-purple-400 transition-colors duration-300" />
              Volver a Inicio
            </Button>
          </motion.div>
        )}
      </div>
      
       <footer className="w-full text-center text-slate-400 text-xs py-4">
        &copy; {new Date().getFullYear()} Lomi-tero. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default LoginPage;

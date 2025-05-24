
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useStore from '@/lib/store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const VerifyEmailPage = () => {
  const handleEmailVerification = useStore(state => state.handleEmailVerification);
  const checkSession = useStore(state => state.checkSession);
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [message, setMessage] = useState('Verificando tu email...');
  const location = useLocation();

  useEffect(() => {
    const verify = async () => {
      const params = new URLSearchParams(location.hash.substring(1)); 
      const errorDescription = params.get('error_description');

      if (errorDescription) {
        setVerificationStatus('error');
        setMessage(errorDescription || 'Ocurrió un error durante la verificación.');
        return;
      }
      
      const result = await handleEmailVerification();
      setVerificationStatus(result.status);
      setMessage(result.message);
      if (result.status === 'success') {
        await checkSession(); 
      }
    };

    verify();
  }, [handleEmailVerification, checkSession, location.hash]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md bg-slate-800/80 border-purple-700/50 text-gray-100 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-purple-300">Verificación de Email</CardTitle>
            <CardDescription className="text-slate-400 pt-2">{message}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 py-8">
            {verificationStatus === 'verifying' && (
              <Loader2 className="h-16 w-16 text-purple-400 animate-spin" />
            )}
            {verificationStatus === 'success' && (
              <>
                <CheckCircle className="h-20 w-20 text-green-400" />
                <p className="text-center text-slate-300">
                  ¡Tu cuenta ha sido activada! Ahora puedes iniciar sesión.
                </p>
                <Button asChild className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white">
                  <Link to="/login/client">Ir a Iniciar Sesión</Link>
                </Button>
              </>
            )}
            {verificationStatus === 'error' && (
              <>
                <XCircle className="h-20 w-20 text-red-400" />
                <p className="text-center text-slate-300">
                  Intenta registrarte de nuevo o contacta a soporte si el problema persiste.
                </p>
                <Button asChild variant="outline" className="w-full text-purple-300 border-purple-500 hover:bg-purple-700 hover:text-white">
                  <Link to="/login/client">Volver al Inicio</Link>
                </Button>
              </>
            )}
             {verificationStatus === 'pending' && (
              <>
                <Loader2 className="h-16 w-16 text-yellow-400 animate-spin" />
                 <p className="text-center text-slate-300">
                  Parece que la verificación aún está pendiente. Por favor, revisa tu correo electrónico.
                </p>
                <Button asChild variant="outline" className="w-full text-purple-300 border-purple-500 hover:bg-purple-700 hover:text-white">
                  <Link to="/">Volver al Inicio</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;

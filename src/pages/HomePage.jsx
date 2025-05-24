
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Users, UserCircle, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HomePage = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  const sections = [
    {
      title: 'Administración',
      description: 'Gestiona sucursales, productos, inventario y más.',
      icon: <Shield className="h-10 w-10 text-red-400" />,
      link: '/login/admin',
      buttonText: 'Acceder como Admin',
      gradient: 'from-red-500 to-pink-500'
    },
    {
      title: 'Personal',
      description: 'Visualiza y gestiona los pedidos de los clientes.',
      icon: <Users className="h-10 w-10 text-purple-400" />,
      link: '/login/staff',
      buttonText: 'Acceder como Personal',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      title: 'Clientes',
      description: 'Realiza tus pedidos de forma rápida y sencilla.',
      icon: <ShoppingBag className="h-10 w-10 text-blue-400" />,
      link: '/login/client',
      buttonText: 'Iniciar Sesión / Registrarse',
      gradient: 'from-blue-500 to-sky-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 text-white flex flex-col items-center justify-center p-4">
      <motion.header 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="text-center mb-12 md:mb-16"
      >
        <h1 className="text-6xl md:text-7xl font-extrabold mb-4">
          Bienvenido a <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">Lomi-tero</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto">
          Los mejores platos de comida rápida, preparados con amor y servidos con rapidez.
        </p>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 w-full max-w-6xl">
        {sections.map((section, index) => (
          <motion.div
            key={index}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className={`bg-slate-800/50 backdrop-blur-md border border-purple-700/30 p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center transform transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50`}
          >
            <div className={`p-4 rounded-full bg-gradient-to-br ${section.gradient} mb-6 shadow-lg`}>
              {section.icon}
            </div>
            <h2 className="text-3xl font-bold mb-3 text-slate-100">{section.title}</h2>
            <p className="text-slate-400 mb-8 h-16">{section.description}</p>
            <Link to={section.link} className="w-full mt-auto">
              <Button 
                variant="default" 
                className={`w-full py-3 text-lg font-semibold bg-gradient-to-r ${section.gradient} hover:opacity-90 transition-opacity duration-300 shadow-md hover:shadow-lg`}
              >
                {section.buttonText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-16 md:mt-24 text-center text-slate-500 text-sm"
      >
        <p>&copy; {new Date().getFullYear()} Lomi-tero. Todos los derechos reservados.</p>
      </motion.footer>
    </div>
  );
};

export default HomePage;

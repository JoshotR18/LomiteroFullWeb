
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ModeToggle';
import useStore from '@/lib/store';

const ClientLayout = () => {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/client/menu" className="text-2xl font-bold gradient-text">
            Lomi-tero
          </Link>
          <nav className="flex items-center space-x-4">
            <Link to="/client/menu">
              <Button variant="ghost">Menú</Button>
            </Link>
            <Link to="/client/orders">
              <Button variant="ghost">Mis Pedidos</Button>
            </Link>
            <ModeToggle />
            <Button variant="outline" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout;

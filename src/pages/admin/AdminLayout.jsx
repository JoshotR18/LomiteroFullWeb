
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ModeToggle } from '@/components/ModeToggle';
import { Home, LayoutDashboard, Building2, Package, ShoppingBasket, Users, UtensilsCrossed as UtensilsCross, Menu, LogOut, Settings, Sun, Moon, ListFilter, Boxes } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import useStore from '@/lib/store';

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Sucursales', path: '/admin/branches', icon: Building2 },
  { name: 'Categorías', path: '/admin/categories', icon: ListFilter },
  { name: 'Productos', path: '/admin/products', icon: ShoppingBasket },
  { name: 'Ingredientes', path: '/admin/ingredients', icon: UtensilsCross },
  { name: 'Stock', path: '/admin/stock', icon: Boxes },
  { name: 'Clientes', path: '/admin/clients', icon: Users },
  { name: 'Pedidos', path: '/admin/orders', icon: Package },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useStore();
  const { theme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login/admin');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="lg:hidden fixed top-4 left-4 z-50">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <nav className="space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-screen fixed w-64 flex-col border-r bg-card">
        <div className="p-6">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="https://storage.googleapis.com/hostinger-horizons-assets-prod/429eda84-121f-4af6-956d-a308a24a5da0/f527bd92719b51babd2ededa687e46cf.png"
              alt="Lomi-tero Logo"
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold">Lomi-tero</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center justify-between mb-4">
            <ModeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="container mx-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

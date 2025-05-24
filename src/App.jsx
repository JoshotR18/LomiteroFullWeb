
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import StaffPage from '@/pages/StaffPage';
import KitchenPage from '@/pages/KitchenPage';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import BranchesPage from '@/pages/admin/BranchesPage';
import ProductsPage from '@/pages/admin/ProductsPage';
import CategoriesPage from '@/pages/admin/CategoriesPage';
import IngredientsPage from '@/pages/admin/IngredientsPage';
import StockPage from '@/pages/admin/StockPage';
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage';
import ClientsPage from '@/pages/admin/ClientsPage';
import FinancialReportPage from '@/pages/admin/FinancialReportPage';
import ClientLayout from '@/pages/client/ClientLayout';
import MenuPage from '@/pages/client/MenuPage';
import OrdersPage from '@/pages/client/OrdersPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';
import { ThemeProvider } from '@/components/ThemeProvider';
import useStore from '@/lib/store';
import { supabase } from '@/lib/supabase';

function ProtectedRoute({ children, allowedRole }) {
  const isAuthenticated = useStore(state => state.isAuthenticated);
  const role = useStore(state => state.role);
  const user = useStore(state => state.user);
  
  if (!isAuthenticated || role !== allowedRole) {
    return <Navigate to={`/login/${allowedRole}`} replace />;
  }
  
  if (allowedRole === 'client' && user && !user.email_confirmed_at) {
    const currentPath = window.location.pathname + window.location.search;
    if (!currentPath.includes('/verify-email')) {
      return <Navigate to={`/verify-email?redirectTo=${encodeURIComponent(currentPath)}`} replace />;
    }
  }
  
  return React.cloneElement(children, { user });
}

function App() {
  const initializeApp = useStore(state => state.initializeApp);
  const appInitializationCalled = useStore(state => state.appInitializationCalled);
  const [authListenerSubscribed, setAuthListenerSubscribed] = useState(false);

  useEffect(() => {
    console.log("App.jsx useEffect for initializeApp: appInitializationCalled =", appInitializationCalled);
    if (typeof initializeApp === 'function' && !appInitializationCalled) {
      console.log("App.jsx: Calling initializeApp");
      initializeApp();
    } else if (typeof initializeApp !== 'function') {
      console.error("App.jsx: initializeApp is not a function. Current value:", initializeApp);
    }
  }, [initializeApp, appInitializationCalled]);

  useEffect(() => {
    if (appInitializationCalled && !authListenerSubscribed) {
      const store = useStore.getState();
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log("Auth event from App.jsx:", event, session);
          const currentStoreState = useStore.getState(); 
          if (event === "SIGNED_IN" && session?.user) {
            await currentStoreState.fetchUserProfile();
            
            const fetchPromises = [
              currentStoreState.fetchBranches(),
              currentStoreState.fetchCategories(),
              currentStoreState.fetchIngredients(),
              currentStoreState.fetchProducts(),
            ];
            
            const role = currentStoreState.role;
            const userId = currentStoreState.user?.id;

            if (role === 'admin' || role === 'staff') {
              fetchPromises.push(currentStoreState.fetchOrders());
            }
             if (role === 'admin'){
              fetchPromises.push(currentStoreState.fetchAllStockData());
              fetchPromises.push(currentStoreState.fetchSalesForStats());
            }
            if (role === 'client' && userId){
               fetchPromises.push(currentStoreState.fetchClientOrders(userId));
            }
            await Promise.allSettled(fetchPromises);

          } else if (event === "SIGNED_OUT") {
            currentStoreState.logout();
          } else if (event === "USER_UPDATED" && session?.user) {
            await currentStoreState.fetchUserProfile();
          } else if (event === "PASSWORD_RECOVERY") {
            console.log("Password recovery event triggered in App.jsx");
          } else if (event === "TOKEN_REFRESHED") {
            console.log("Token refreshed in App.jsx");
          }
        }
      );
      setAuthListenerSubscribed(true);
      console.log("Auth listener subscribed in App.jsx");

      return () => {
        if (authListener && typeof authListener.unsubscribe === 'function') {
          authListener.unsubscribe();
          console.log("Auth listener unsubscribed in App.jsx");
        } else if (authListener && authListener.subscription && typeof authListener.subscription.unsubscribe === 'function') {
          authListener.subscription.unsubscribe();
          console.log("Auth listener (subscription) unsubscribed in App.jsx");
        }
        setAuthListenerSubscribed(false);
      };
    }
  }, [appInitializationCalled, authListenerSubscribed]);


  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          <Route path="/login/admin" element={<LoginPage role="admin" />} />
          <Route path="/login/client" element={<LoginPage role="client" />} />
          <Route path="/login/staff" element={<LoginPage role="staff" />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} /> 
          
          <Route path="/admin" element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="branches" element={<BranchesPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="ingredients" element={<IngredientsPage />} />
            <Route path="stock" element={<StockPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="financial-report" element={<FinancialReportPage />} />
          </Route>
          
          <Route path="/staff" element={
            <ProtectedRoute allowedRole="staff">
              <StaffPage />
            </ProtectedRoute>
          } />
          <Route path="/kitchen" element={<KitchenPage />} />
          
          <Route path="/client" element={
            <ProtectedRoute allowedRole="client">
              <ClientLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="menu" replace />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="orders" element={<OrdersPage />} />
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;

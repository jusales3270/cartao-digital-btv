import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Login } from '@/components/Login';
import { Dashboard } from '@/components/Dashboard';
import { CartaoDigital } from '@/components/CartaoDigital';
import { Validacao } from '@/components/Validacao';
import { AdminPanel } from '@/components/AdminPanel';
import { PrimeiroAcesso } from '@/components/PrimeiroAcesso';
import { ValidacaoPublica } from '@/components/ValidacaoPublica';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

// Componente interno para views autenticadas
function AuthenticatedApp() {
  const currentView = useAuthStore((state) => state.currentView);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Renderiza a view atual
  const renderView = () => {
    switch (currentView) {
      case 'login':
        return <Login />;
      case 'primeiro-acesso':
        return isAuthenticated ? <PrimeiroAcesso /> : <Login />;
      case 'dashboard':
        return isAuthenticated ? <Dashboard /> : <Login />;
      case 'cartao':
        return isAuthenticated ? <CartaoDigital /> : <Login />;
      case 'validacao':
        return <Validacao />;
      case 'admin':
        return isAuthenticated ? <AdminPanel /> : <Login />;
      default:
        return <Login />;
    }
  };

  return renderView();
}

function App() {
  return (
    <>
      <Routes>
        {/* Rota pública - Validação via QR Code (para comerciantes) */}
        <Route path="/validar/:token" element={<ValidacaoPublica />} />

        {/* Rotas internas da aplicação */}
        <Route path="/*" element={<AuthenticatedApp />} />
      </Routes>
      <Toaster position="top-center" />
    </>
  );
}

export default App;

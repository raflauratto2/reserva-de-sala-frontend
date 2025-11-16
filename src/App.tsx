import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { Login } from '@/views/Login';
import { Register } from '@/views/Register';
import { ReservasList } from '@/views/ReservasList';
import { ReservaForm } from '@/views/ReservaForm';
import { SalasList } from '@/views/SalasList';
import { useAuthStore } from '@/store/auth-store';

function AppRoutes() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/reservas" replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/reservas" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/reservas" replace /> : <Register />}
      />
      <Route
        path="/reservas"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ReservasList />} />
        <Route path="nova" element={<ReservaForm />} />
        <Route path=":id/editar" element={<ReservaForm />} />
      </Route>
      <Route
        path="/salas"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SalasList />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;


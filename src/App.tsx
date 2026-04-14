import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Coordenador from "./pages/Coordenador.tsx";
import Aluno from "./pages/Aluno.tsx";
import Admin from "./pages/Admin.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<Index />} />
            
            {/* Login com parâmetro de role */}
            <Route path="/login/:role" element={<Login />} />
            
            {/* CORREÇÃO 1: Rota de fallback para /login (redireciona para home) */}
            <Route path="/login" element={<Navigate to="/" replace />} />

            {/* Rota Protegida: Coordenador */}
            <Route 
              path="/coordenador/*" 
              element={
                <ProtectedRoute allowedRoles={['coordenador', 'super_admin']}>
                  <Coordenador />
                </ProtectedRoute>
              } 
            />
            
            {/* Rota Protegida: Aluno */}
            <Route 
              path="/aluno/*" 
              element={
                <ProtectedRoute allowedRoles={['aluno']}>
                  <Aluno />
                </ProtectedRoute>
              } 
            />
            
            {/* Rota Protegida: Admin */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <Admin />
                </ProtectedRoute>
              } 
            />

            {/* Rota de Erro */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
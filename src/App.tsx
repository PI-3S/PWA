import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute"; // Importando o protetor

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
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<Index />} />
            <Route path="/login/:role" element={<Login />} />

            {/* Rotas Privadas e Protegidas por Perfil */}
            <Route 
              path="/coordenador" 
              element={
                <ProtectedRoute allowedRoles={['coordenador']}>
                  <Coordenador />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/aluno" 
              element={
                <ProtectedRoute allowedRoles={['aluno']}>
                  <Aluno />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <Admin />
                </ProtectedRoute>
              } 
            />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
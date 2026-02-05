import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Servidor, UserSession, View } from '@/types';
import { loginServidor } from '@/lib/api';

interface AuthState extends UserSession {
  currentView: View;
  login: (cpf: string, senha: string) => Promise<{ success: boolean; message?: string; primeiroAcesso?: boolean }>;
  logout: () => void;
  setView: (view: View) => void;
  atualizarUsuario: (usuario: Servidor) => void;
  completarPrimeiroAcesso: (cpf: string, novaSenha: string) => Promise<{ success: boolean; message?: string }>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      role: null,
      currentView: 'login',

      login: async (cpf: string, senha: string) => {
        // Usa a API layer que suporta mock e Supabase
        const result = await loginServidor(cpf, senha);

        if (!result.success) {
          return { success: false, message: result.message };
        }

        if (!result.servidor) {
          return { success: false, message: 'Erro ao carregar dados do servidor' };
        }

        // Determina a role
        let role: 'servidor' | 'admin' | 'comerciante' = 'servidor';
        if (result.servidor.matricula === 'ADMIN01') {
          role = 'admin';
        }

        // Adapta para o formato esperado pelo tipo Servidor do frontend
        const user: Servidor = {
          id: result.servidor.id,
          cpf: result.servidor.cpf,
          nome: result.servidor.nome,
          secretaria: result.servidor.secretaria,
          cargo: result.servidor.cargo,
          matricula: result.servidor.matricula,
          status: result.servidor.status,
          foto: result.servidor.foto_url || undefined,
          dataAdmissao: result.servidor.data_admissao || undefined,
          primeiroAcesso: result.primeiroAcesso ?? false,
        };

        set({
          user,
          isAuthenticated: true,
          role,
        });

        if (result.primeiroAcesso) {
          set({ currentView: 'primeiro-acesso' });
          return { success: true, primeiroAcesso: true };
        }

        // Define a view inicial baseada na role
        if (role === 'admin') {
          set({ currentView: 'admin' });
        } else {
          set({ currentView: 'dashboard' });
        }

        return { success: true };
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          role: null,
          currentView: 'login',
        });
      },

      setView: (view: View) => {
        set({ currentView: view });
      },

      atualizarUsuario: (usuario: Servidor) => {
        set({ user: usuario });
      },

      completarPrimeiroAcesso: async (_cpf: string, novaSenha: string) => {
        await new Promise(resolve => setTimeout(resolve, 600));

        const { user } = get();
        if (!user) {
          return { success: false, message: 'Sessão expirada' };
        }

        // Atualiza o usuário
        const usuarioAtualizado = {
          ...user,
          senha: novaSenha,
          primeiroAcesso: false,
        };

        set({
          user: usuarioAtualizado,
          currentView: 'dashboard',
        });

        return { success: true };
      },
    }),
    {
      name: 'cartao-servidor-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
      }),
    }
  )
);

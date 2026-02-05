import { create } from 'zustand';
import type { QRCodeData } from '@/types';
import { gerarTokenCartao } from '@/lib/api';

interface QRCodeState {
  qrCodeAtual: QRCodeData | null;
  validationUrl: string | null;
  tempoRestante: number;
  geracoesRestantes: number;
  ultimaGeracao: number;
  isLoading: boolean;
  gerarQRCode: (servidorId: string) => Promise<{ success: boolean; token?: string; url?: string; message?: string }>;
  limparQRCode: () => void;
  decrementarTempo: () => void;
  podeGerarNovo: () => boolean;
}

const TEMPO_VALIDADE = 120; // 2 minutos
const MAX_GERACOES_POR_MINUTO = 10;
const TEMPO_RESET_RATE_LIMIT = 60 * 1000; // 1 minuto em ms

export const useQRCodeStore = create<QRCodeState>((set, get) => ({
  qrCodeAtual: null,
  validationUrl: null,
  tempoRestante: 0,
  geracoesRestantes: MAX_GERACOES_POR_MINUTO,
  ultimaGeracao: 0,
  isLoading: false,

  gerarQRCode: async (servidorId: string) => {
    const agora = Date.now();
    const state = get();

    // Rate limiting
    if (agora - state.ultimaGeracao < TEMPO_RESET_RATE_LIMIT) {
      if (state.geracoesRestantes <= 0) {
        return {
          success: false,
          message: 'Limite de gerações atingido. Aguarde 1 minuto.'
        };
      }
    } else {
      // Reseta o contador após 1 minuto
      set({ geracoesRestantes: MAX_GERACOES_POR_MINUTO });
    }

    set({ isLoading: true });

    try {
      // Chama a API para gerar o token
      const resultado = await gerarTokenCartao(servidorId);

      if (!resultado.success || !resultado.token) {
        set({ isLoading: false });
        return {
          success: false,
          message: resultado.message || 'Erro ao gerar código'
        };
      }

      const novoQRCode: QRCodeData = {
        token: resultado.token,
        servidorId,
        timestamp: agora,
        expiraEm: agora + (resultado.expiraEm || 120) * 1000,
      };

      set({
        qrCodeAtual: novoQRCode,
        validationUrl: resultado.url || null,
        tempoRestante: resultado.expiraEm || TEMPO_VALIDADE,
        geracoesRestantes: get().geracoesRestantes - 1,
        ultimaGeracao: agora,
        isLoading: false,
      });

      return {
        success: true,
        token: resultado.token,
        url: resultado.url
      };
    } catch (error) {
      set({ isLoading: false });
      return {
        success: false,
        message: 'Erro ao gerar código'
      };
    }
  },

  limparQRCode: () => {
    set({
      qrCodeAtual: null,
      validationUrl: null,
      tempoRestante: 0,
    });
  },

  decrementarTempo: () => {
    const state = get();
    if (state.tempoRestante > 0) {
      set({ tempoRestante: state.tempoRestante - 1 });
    } else if (state.qrCodeAtual) {
      // QR Code expirado na interface
      set({ qrCodeAtual: null, validationUrl: null });
    }
  },

  podeGerarNovo: () => {
    const state = get();
    const agora = Date.now();

    if (state.isLoading) return false;

    if (agora - state.ultimaGeracao >= TEMPO_RESET_RATE_LIMIT) {
      return true;
    }

    return state.geracoesRestantes > 0;
  },
}));

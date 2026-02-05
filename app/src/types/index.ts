// Tipos do Sistema de Identidade Digital

export interface Servidor {
  id: string;
  cpf: string;
  senha?: string;  // Opcional (não vem do banco)
  nome: string;
  email?: string;  // Opcional
  dataNascimento?: string;  // Opcional
  matricula: string;
  secretaria: string;
  cargo: string;
  foto?: string;  // Opcional
  status: 'ativo' | 'inativo' | 'bloqueado';
  dataAdmissao?: string;  // Opcional
  primeiroAcesso: boolean;
  ultimoAcesso?: string;
}

export interface Validacao {
  id: string;
  servidorId: string;
  servidorNome: string;
  servidorFoto: string;
  servidorSecretaria: string;
  comercianteNome: string;
  comercianteCnpj: string;
  timestamp: Date;
  status: 'aprovado' | 'negado' | 'expirado';
  qrCodeId: string;
}

export interface QRCodeData {
  token: string;
  servidorId: string;
  timestamp: number;
  expiraEm: number;
}

export interface UserSession {
  user: Servidor | null;
  isAuthenticated: boolean;
  role: 'servidor' | 'admin' | 'comerciante' | null;
}

export interface AdminStats {
  totalServidores: number;
  servidoresAtivos: number;
  servidoresInativos: number;
  servidoresBloqueados: number;
  totalValidacoesHoje: number;
  totalValidacoesMes?: number;
}

export type View = 'login' | 'dashboard' | 'cartao' | 'validacao' | 'admin' | 'primeiro-acesso';

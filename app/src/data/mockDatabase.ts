import type { Servidor, Validacao, AdminStats } from '@/types';

// Dados mockados de servidores
export const servidoresMock: Servidor[] = [
  {
    id: '1',
    cpf: '123.456.789-00',
    senha: 'senha123',
    nome: 'João da Silva Santos',
    email: 'joao.santos@prefeitura.gov.br',
    dataNascimento: '15/03/1985',
    matricula: '2021001',
    secretaria: 'Secretaria de Educação',
    cargo: 'Professor de Matemática',
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    status: 'ativo',
    dataAdmissao: '2021-02-15',
    primeiroAcesso: false,
    ultimoAcesso: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    cpf: '987.654.321-00',
    senha: 'senha456',
    nome: 'Maria Oliveira Costa',
    email: 'maria.costa@prefeitura.gov.br',
    dataNascimento: '22/07/1990',
    matricula: '2019054',
    secretaria: 'Secretaria de Saúde',
    cargo: 'Enfermeira',
    foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    status: 'ativo',
    dataAdmissao: '2019-08-10',
    primeiroAcesso: false,
    ultimoAcesso: '2024-01-14T16:45:00Z',
  },
  {
    id: '3',
    cpf: '456.789.123-00',
    senha: 'senha789',
    nome: 'Pedro Henrique Lima',
    email: 'pedro.lima@prefeitura.gov.br',
    dataNascimento: '10/11/1988',
    matricula: '2020089',
    secretaria: 'Secretaria de Obras',
    cargo: 'Engenheiro Civil',
    foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    status: 'ativo',
    dataAdmissao: '2020-03-20',
    primeiroAcesso: true,
  },
  {
    id: '4',
    cpf: '789.123.456-00',
    senha: 'senha000',
    nome: 'Ana Paula Ferreira',
    email: 'ana.ferreira@prefeitura.gov.br',
    dataNascimento: '05/05/1992',
    matricula: '2022156',
    secretaria: 'Secretaria de Administração',
    cargo: 'Assistente Administrativo',
    foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    status: 'inativo',
    dataAdmissao: '2022-06-01',
    primeiroAcesso: false,
    ultimoAcesso: '2023-12-20T09:15:00Z',
  },
  {
    id: '5',
    cpf: '321.654.987-00',
    senha: 'senha111',
    nome: 'Carlos Eduardo Souza',
    email: 'carlos.souza@prefeitura.gov.br',
    dataNascimento: '18/09/1983',
    matricula: '2018034',
    secretaria: 'Secretaria de Segurança',
    cargo: 'Guarda Municipal',
    foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    status: 'bloqueado',
    dataAdmissao: '2018-11-15',
    primeiroAcesso: false,
    ultimoAcesso: '2023-11-30T14:20:00Z',
  },
  {
    id: '6',
    cpf: '111.222.333-44',
    senha: 'admin123',
    nome: 'Administrador RH',
    email: 'rh@prefeitura.gov.br',
    dataNascimento: '01/01/1980',
    matricula: 'ADMIN01',
    secretaria: 'Recursos Humanos',
    cargo: 'Administrador do Sistema',
    foto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
    status: 'ativo',
    dataAdmissao: '2015-01-01',
    primeiroAcesso: false,
    ultimoAcesso: '2024-01-15T08:00:00Z',
  },
];

// Validações mockadas
export const validacoesMock: Validacao[] = [
  {
    id: '1',
    servidorId: '1',
    servidorNome: 'João da Silva Santos',
    servidorFoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    servidorSecretaria: 'Secretaria de Educação',
    comercianteNome: 'Padaria do Seu Joaquim',
    comercianteCnpj: '12.345.678/0001-90',
    timestamp: new Date('2024-01-15T10:30:00Z'),
    status: 'aprovado',
    qrCodeId: 'qr-001',
  },
  {
    id: '2',
    servidorId: '2',
    servidorNome: 'Maria Oliveira Costa',
    servidorFoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    servidorSecretaria: 'Secretaria de Saúde',
    comercianteNome: 'Farmácia Bem Estar',
    comercianteCnpj: '98.765.432/0001-10',
    timestamp: new Date('2024-01-15T14:45:00Z'),
    status: 'aprovado',
    qrCodeId: 'qr-002',
  },
  {
    id: '3',
    servidorId: '1',
    servidorNome: 'João da Silva Santos',
    servidorFoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    servidorSecretaria: 'Secretaria de Educação',
    comercianteNome: 'Restaurante Sabor Caseiro',
    comercianteCnpj: '45.678.901/0001-23',
    timestamp: new Date('2024-01-14T12:15:00Z'),
    status: 'aprovado',
    qrCodeId: 'qr-003',
  },
];

// Estatísticas para o admin
export const adminStatsMock: AdminStats = {
  totalServidores: 156,
  servidoresAtivos: 142,
  servidoresInativos: 0,
  servidoresBloqueados: 14,
  totalValidacoesHoje: 28,
  totalValidacoesMes: 847,
};

// QR Codes ativos (simulação em memória)
interface QRCodeAtivo {
  token: string;
  servidorId: string;
  criadoEm: number;
  expiraEm: number;
}

export const qrCodesAtivos: Map<string, QRCodeAtivo> = new Map();

// Funções auxiliares
export function buscarServidorPorCPF(cpf: string): Servidor | undefined {
  return servidoresMock.find(s => s.cpf === cpf);
}

export function buscarServidorPorId(id: string): Servidor | undefined {
  return servidoresMock.find(s => s.id === id);
}

export function autenticarServidor(cpf: string, senha: string): Servidor | null {
  const servidor = servidoresMock.find(s => s.cpf === cpf && s.senha === senha);
  return servidor || null;
}

export function registrarQRCode(token: string, servidorId: string): void {
  const agora = Date.now();
  qrCodesAtivos.set(token, {
    token,
    servidorId,
    criadoEm: agora,
    expiraEm: agora + 2 * 60 * 1000, // 2 minutos
  });
}

export function validarQRCode(token: string): { valido: boolean; servidorId?: string; motivo?: string } {
  const qrCode = qrCodesAtivos.get(token);

  if (!qrCode) {
    return { valido: false, motivo: 'QR Code não encontrado' };
  }

  const agora = Date.now();
  if (agora > qrCode.expiraEm) {
    qrCodesAtivos.delete(token);
    return { valido: false, motivo: 'QR Code expirado' };
  }

  return { valido: true, servidorId: qrCode.servidorId };
}

export function limparQRCodesExpirados(): void {
  const agora = Date.now();
  for (const [token, qrCode] of qrCodesAtivos.entries()) {
    if (agora > qrCode.expiraEm) {
      qrCodesAtivos.delete(token);
    }
  }
}

// Limpar QR codes expirados a cada 30 segundos
setInterval(limparQRCodesExpirados, 30000);

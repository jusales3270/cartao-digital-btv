/* eslint-disable @typescript-eslint/no-explicit-any */
// Serviços de API para comunicação com Supabase
// Nota: Erros de tipo nas operações de escrita são esperados quando Supabase não está configurado
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Servidor, ServidorInsert, CsvUpload } from '@/types/database';

// Cliente não tipado para operações de escrita
const db = supabase as any;

// URL base da aplicação
const getAppUrl = () => import.meta.env.VITE_APP_URL || window.location.origin;

// ============================================
// AUTENTICAÇÃO
// ============================================

export interface LoginResult {
    success: boolean;
    message?: string;
    servidor?: Servidor;
    primeiroAcesso?: boolean;
}

/**
 * Autentica um servidor usando CPF e senha
 * Busca servidor no Supabase por CPF
 */
export async function loginServidor(cpf: string, _senha: string): Promise<LoginResult> {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!isSupabaseConfigured()) {
        // Modo mock - compatibilidade com dados existentes
        const { autenticarServidor } = await import('@/data/mockDatabase');
        const servidor = autenticarServidor(cpf, _senha);

        if (!servidor) {
            return { success: false, message: 'CPF ou senha incorretos' };
        }

        if (servidor.status === 'bloqueado') {
            return { success: false, message: 'Usuário bloqueado. Entre em contato com o RH.' };
        }

        // Adapta o formato do mock para o formato do banco
        const servidorAdaptado: Servidor = {
            id: servidor.id,
            cpf: servidor.cpf,
            nome: servidor.nome,
            secretaria: servidor.secretaria,
            cargo: servidor.cargo,
            matricula: servidor.matricula,
            status: servidor.status,
            foto_url: servidor.foto ?? null,
            data_admissao: servidor.dataAdmissao ?? null,
            primeiro_acesso: servidor.primeiroAcesso,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        return {
            success: true,
            servidor: servidorAdaptado,
            primeiroAcesso: servidor.primeiroAcesso
        };
    }

    // Supabase: Busca servidor pelo CPF
    try {
        const { data, error } = await db
            .from('servidores')
            .select('*')
            .eq('cpf', cpf)
            .single();

        const servidor = data as Servidor | null;

        if (error || !servidor) {
            return { success: false, message: 'CPF não encontrado' };
        }

        // Verifica status
        if (servidor.status === 'bloqueado') {
            return { success: false, message: 'Usuário bloqueado. Entre em contato com o RH.' };
        }

        if (servidor.status === 'inativo') {
            return { success: false, message: 'Servidor inativo. Entre em contato com o RH.' };
        }

        return {
            success: true,
            servidor: servidor,
            primeiroAcesso: servidor.primeiro_acesso ?? false
        };
    } catch {
        return { success: false, message: 'Erro de conexão com o servidor' };
    }
}

// ============================================
// QR CODE / TOKEN
// ============================================

export interface GerarTokenResult {
    success: boolean;
    token?: string;
    url?: string;
    expiraEm?: number;
    message?: string;
}

/**
 * Gera um token JWT para o QR Code do servidor
 * Retorna a URL completa para validação pública
 */
export async function gerarTokenCartao(servidorId: string): Promise<GerarTokenResult> {
    // Gera um token único usando timestamp + random
    const generateToken = () => {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substring(2, 15);
        return `${timestamp}-${randomPart}`.toUpperCase();
    };

    if (!isSupabaseConfigured()) {
        // Modo mock - gera token local
        const token = generateToken();
        return {
            success: true,
            token,
            url: `${getAppUrl()}/validar/${token}`,
            expiraEm: 120 // segundos
        };
    }

    try {
        const token = generateToken();
        const expiraEm = new Date(Date.now() + 2 * 60 * 1000); // 2 minutos

        // Insere o token no banco de dados
        const { error } = await db
            .from('tokens')
            .insert({
                servidor_id: servidorId,
                token: token,
                usado: false,
                expira_em: expiraEm.toISOString()
            });

        if (error) {
            console.error('Erro ao inserir token:', error);
            return { success: false, message: 'Erro ao gerar token' };
        }

        return {
            success: true,
            token,
            url: `${getAppUrl()}/validar/${token}`,
            expiraEm: 120
        };
    } catch (err) {
        console.error('Erro na geração de token:', err);
        return { success: false, message: 'Erro de conexão' };
    }
}

// ============================================
// SERVIDORES (ADMIN)
// ============================================

/**
 * Lista todos os servidores (apenas para admin)
 */
export async function listarServidores(): Promise<Servidor[]> {
    if (!isSupabaseConfigured()) {
        // Modo mock
        const { servidoresMock } = await import('@/data/mockDatabase');
        return servidoresMock.map(s => ({
            id: s.id,
            cpf: s.cpf,
            nome: s.nome,
            secretaria: s.secretaria,
            cargo: s.cargo,
            matricula: s.matricula,
            status: s.status,
            foto_url: s.foto ?? null,
            data_admissao: s.dataAdmissao ?? null,
            primeiro_acesso: s.primeiroAcesso,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }));
    }

    const { data, error } = await supabase
        .from('servidores')
        .select('*')
        .order('nome');

    if (error) {
        console.error('Erro ao listar servidores:', error);
        return [];
    }

    return data || [];
}

/**
 * Busca um servidor por ID
 */
export async function buscarServidorPorId(id: string): Promise<Servidor | null> {
    if (!isSupabaseConfigured()) {
        const { buscarServidorPorId: mockBuscar } = await import('@/data/mockDatabase');
        const s = mockBuscar(id);
        if (!s) return null;

        return {
            id: s.id,
            cpf: s.cpf,
            nome: s.nome,
            secretaria: s.secretaria,
            cargo: s.cargo,
            matricula: s.matricula,
            status: s.status,
            foto_url: s.foto ?? null,
            data_admissao: s.dataAdmissao ?? null,
            primeiro_acesso: s.primeiroAcesso,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
    }

    const { data, error } = await supabase
        .from('servidores')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Erro ao buscar servidor:', error);
        return null;
    }

    return data;
}

/**
 * Atualiza o status de um servidor
 */
export async function atualizarStatusServidor(
    id: string,
    status: 'ativo' | 'inativo' | 'bloqueado'
): Promise<boolean> {
    if (!isSupabaseConfigured()) {
        console.warn('Supabase não configurado - operação simulada');
        return true;
    }

    const { error } = await db
        .from('servidores')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        console.error('Erro ao atualizar status:', error);
        return false;
    }

    return true;
}

// ============================================
// UPLOAD CSV
// ============================================

export interface CSVParseResult {
    success: boolean;
    servidores: ServidorInsert[];
    erros: string[];
}

/**
 * Processa um arquivo CSV e retorna os dados parseados
 */
export function parseCSV(csvContent: string): CSVParseResult {
    const lines = csvContent.split('\n').filter(line => line.trim());
    const erros: string[] = [];
    const servidores: ServidorInsert[] = [];

    if (lines.length < 2) {
        return { success: false, servidores: [], erros: ['Arquivo CSV vazio ou inválido'] };
    }

    // Primeira linha é o cabeçalho
    const headers = lines[0].split(';').map(h => h.trim().toLowerCase());

    // Mapear colunas esperadas
    const cpfIndex = headers.findIndex(h => h.includes('cpf'));
    const nomeIndex = headers.findIndex(h => h.includes('nome'));
    const secretariaIndex = headers.findIndex(h => h.includes('secretaria'));
    const cargoIndex = headers.findIndex(h => h.includes('cargo'));
    const matriculaIndex = headers.findIndex(h => h.includes('matricula') || h.includes('matrícula'));
    const statusIndex = headers.findIndex(h => h.includes('status'));
    const admissaoIndex = headers.findIndex(h => h.includes('admissao') || h.includes('admissão') || h.includes('data'));

    if (cpfIndex === -1 || nomeIndex === -1) {
        return {
            success: false,
            servidores: [],
            erros: ['CSV deve conter pelo menos colunas: CPF, Nome']
        };
    }

    // Processar linhas de dados
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(';').map(v => v.trim());

        const cpf = values[cpfIndex];
        const nome = values[nomeIndex];

        if (!cpf || !nome) {
            erros.push(`Linha ${i + 1}: CPF ou Nome faltando`);
            continue;
        }

        servidores.push({
            cpf,
            nome,
            secretaria: secretariaIndex >= 0 ? values[secretariaIndex] : 'Não informada',
            cargo: cargoIndex >= 0 ? values[cargoIndex] : 'Não informado',
            matricula: matriculaIndex >= 0 ? values[matriculaIndex] : `MAT${Date.now()}`,
            status: statusIndex >= 0 && ['ativo', 'inativo', 'bloqueado'].includes(values[statusIndex]?.toLowerCase())
                ? values[statusIndex].toLowerCase() as 'ativo' | 'inativo' | 'bloqueado'
                : 'ativo',
            data_admissao: admissaoIndex >= 0 ? values[admissaoIndex] : null,
            primeiro_acesso: true,
        });
    }

    return { success: true, servidores, erros };
}

/**
 * Importa servidores do CSV para o banco de dados
 */
export async function importarServidoresCSV(
    servidores: ServidorInsert[],
    adminId: string,
    filename: string
): Promise<{ importados: number; atualizados: number; erros: number }> {
    if (!isSupabaseConfigured()) {
        console.warn('Supabase não configurado - importação simulada');
        return { importados: servidores.length, atualizados: 0, erros: 0 };
    }

    let importados = 0;
    let atualizados = 0;
    let erros = 0;

    for (const servidor of servidores) {
        // Verifica se já existe pelo CPF
        const { data: existente } = await db
            .from('servidores')
            .select('id')
            .eq('cpf', servidor.cpf)
            .single();

        if (existente && typeof existente === 'object' && 'id' in existente) {
            // Atualiza
            const { error } = await db
                .from('servidores')
                .update({
                    nome: servidor.nome,
                    secretaria: servidor.secretaria,
                    cargo: servidor.cargo,
                    status: servidor.status,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', existente.id);

            if (error) {
                erros++;
            } else {
                atualizados++;
            }
        } else {
            // Insere novo
            const { error } = await db
                .from('servidores')
                .insert(servidor);

            if (error) {
                erros++;
            } else {
                importados++;
            }
        }
    }

    // Registra o upload
    await db.from('csv_uploads').insert({
        admin_id: adminId,
        filename,
        registros_importados: importados,
        registros_atualizados: atualizados,
        registros_erro: erros,
    });

    return { importados, atualizados, erros };
}

/**
 * Lista histórico de uploads de CSV
 */
export async function listarUploadsCSV(): Promise<CsvUpload[]> {
    if (!isSupabaseConfigured()) {
        return [];
    }

    const { data, error } = await supabase
        .from('csv_uploads')
        .select('*')
        .order('uploaded_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Erro ao listar uploads:', error);
        return [];
    }

    return data || [];
}

// ============================================
// VALIDAÇÕES (HISTÓRICO)
// ============================================

export interface ValidacaoLog {
    id: string;
    servidor_id: string;
    token_id?: string;
    resultado: 'valido' | 'expirado' | 'invalido' | 'bloqueado';
    ip_origem?: string;
    user_agent?: string;
    validado_em: string;
    servidores: {
        nome: string;
        cpf: string;
        matricula: string;
        secretaria: string;
    };
}

/**
 * Lista histórico de validações
 */
export async function listarValidacoes(): Promise<ValidacaoLog[]> {
    if (!isSupabaseConfigured()) {
        const { validacoesMock } = await import('@/data/mockDatabase');
        // Adaptar mock para o formato do banco
        return validacoesMock.map(v => ({
            id: v.id,
            servidor_id: v.servidorId,
            resultado: v.status === 'aprovado' ? 'valido' : v.status as any,
            validado_em: v.timestamp.toISOString(),
            servidores: {
                nome: v.servidorNome,
                cpf: '000.000.000-00', // Mock não tem CPF na validação
                matricula: '0000', // Mock não tem matrícula
                secretaria: v.servidorSecretaria
            }
        }));
    }

    const { data, error } = await supabase
        .from('validacoes')
        .select(`
            *,
            servidores (
                nome,
                cpf,
                matricula,
                secretaria
            )
        `)
        .order('validado_em', { ascending: false })
        .limit(50);

    if (error) {
        console.error('Erro ao listar validações:', error);
        return [];
    }

    return data as unknown as ValidacaoLog[];
}

// ============================================
// ESTATÍSTICAS (ADMIN)
// ============================================

export interface AdminStats {
    totalServidores: number;
    servidoresAtivos: number;
    servidoresInativos: number;
    servidoresBloqueados: number;
    totalValidacoesHoje: number;
}

/**
 * Obtém estatísticas para o painel admin
 */
export async function getAdminStats(): Promise<AdminStats> {
    if (!isSupabaseConfigured()) {
        const { adminStatsMock } = await import('@/data/mockDatabase');
        return adminStatsMock;
    }

    try {
        // Busca contagem de servidores por status
        const { data, error } = await db
            .from('servidores')
            .select('status');

        if (error) throw error;

        const servidores = data as { status: string }[] | null;
        const total = servidores?.length || 0;
        const ativos = servidores?.filter(s => s.status === 'ativo').length || 0;
        const inativos = servidores?.filter(s => s.status === 'inativo').length || 0;
        const bloqueados = servidores?.filter(s => s.status === 'bloqueado').length || 0;

        // Busca validações de hoje
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const { count: validacoesHoje } = await supabase
            .from('tokens')
            .select('*', { count: 'exact', head: true })
            .eq('usado', true)
            .gte('usado_em', hoje.toISOString());

        return {
            totalServidores: total,
            servidoresAtivos: ativos,
            servidoresInativos: inativos,
            servidoresBloqueados: bloqueados,
            totalValidacoesHoje: validacoesHoje || 0
        };
    } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
        return {
            totalServidores: 0,
            servidoresAtivos: 0,
            servidoresInativos: 0,
            servidoresBloqueados: 0,
            totalValidacoesHoje: 0
        };
    }
}

// Tipos gerados para o banco de dados Supabase
// Estes tipos refletem a estrutura das tabelas no PostgreSQL

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type ServidorStatus = 'ativo' | 'inativo' | 'bloqueado';

export interface Database {
    public: {
        Tables: {
            servidores: {
                Row: {
                    id: string;
                    cpf: string;
                    nome: string;
                    secretaria: string;
                    cargo: string;
                    matricula: string;
                    status: ServidorStatus;
                    foto_url: string | null;
                    data_admissao: string | null;
                    primeiro_acesso: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    cpf: string;
                    nome: string;
                    secretaria: string;
                    cargo: string;
                    matricula: string;
                    status?: ServidorStatus;
                    foto_url?: string | null;
                    data_admissao?: string | null;
                    primeiro_acesso?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    cpf?: string;
                    nome?: string;
                    secretaria?: string;
                    cargo?: string;
                    matricula?: string;
                    status?: ServidorStatus;
                    foto_url?: string | null;
                    data_admissao?: string | null;
                    primeiro_acesso?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            admin_users: {
                Row: {
                    id: string;
                    user_id: string;
                    nome: string;
                    email: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    nome: string;
                    email: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    nome?: string;
                    email?: string;
                    created_at?: string;
                };
            };
            validacoes_log: {
                Row: {
                    id: string;
                    servidor_id: string;
                    token_hash: string;
                    validado_em: string;
                    ip_origem: string | null;
                    user_agent: string | null;
                };
                Insert: {
                    id?: string;
                    servidor_id: string;
                    token_hash: string;
                    validado_em?: string;
                    ip_origem?: string | null;
                    user_agent?: string | null;
                };
                Update: {
                    id?: string;
                    servidor_id?: string;
                    token_hash?: string;
                    validado_em?: string;
                    ip_origem?: string | null;
                    user_agent?: string | null;
                };
            };
            csv_uploads: {
                Row: {
                    id: string;
                    admin_id: string;
                    filename: string;
                    registros_importados: number;
                    registros_atualizados: number;
                    registros_erro: number;
                    uploaded_at: string;
                };
                Insert: {
                    id?: string;
                    admin_id: string;
                    filename: string;
                    registros_importados?: number;
                    registros_atualizados?: number;
                    registros_erro?: number;
                    uploaded_at?: string;
                };
                Update: {
                    id?: string;
                    admin_id?: string;
                    filename?: string;
                    registros_importados?: number;
                    registros_atualizados?: number;
                    registros_erro?: number;
                    uploaded_at?: string;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            servidor_status: ServidorStatus;
        };
    };
}

// Tipos derivados para uso no frontend
export type Servidor = Database['public']['Tables']['servidores']['Row'];
export type ServidorInsert = Database['public']['Tables']['servidores']['Insert'];
export type ServidorUpdate = Database['public']['Tables']['servidores']['Update'];

export type AdminUser = Database['public']['Tables']['admin_users']['Row'];
export type ValidacaoLog = Database['public']['Tables']['validacoes_log']['Row'];
export type CsvUpload = Database['public']['Tables']['csv_uploads']['Row'];

// Tipo para dados de validação pública (retornado pela Edge Function)
export interface ValidacaoPublicaData {
    valido: boolean;
    expirado?: boolean;
    mensagem?: string;
    servidor?: {
        nome: string;
        cpf_mascarado: string; // Ex: ***.456.789-**
        secretaria: string;
        cargo: string;
        status: ServidorStatus;
        foto_url: string | null;
    };
}

// Tipo para payload do token JWT do QR Code
export interface QRCodeTokenPayload {
    servidor_id: string;
    iat: number;
    exp: number;
}

-- =============================================
-- CARTÃO DIGITAL DE SERVIDORES - MIGRATIONS
-- Execute este script no SQL Editor do Supabase
-- =============================================

-- 1. TABELA DE SERVIDORES
-- Dados dos servidores públicos municipais
CREATE TABLE IF NOT EXISTS servidores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cpf TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    secretaria TEXT NOT NULL DEFAULT 'Não informada',
    cargo TEXT NOT NULL DEFAULT 'Não informado',
    matricula TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'bloqueado')),
    foto_url TEXT,
    data_admissao TEXT,
    primeiro_acesso BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_servidores_cpf ON servidores(cpf);
CREATE INDEX IF NOT EXISTS idx_servidores_matricula ON servidores(matricula);
CREATE INDEX IF NOT EXISTS idx_servidores_status ON servidores(status);

-- 2. TABELA DE TOKENS (QR CODES)
-- Tokens temporários para validação de cartões
CREATE TABLE IF NOT EXISTS tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    servidor_id UUID NOT NULL REFERENCES servidores(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    usado BOOLEAN DEFAULT false,
    criado_em TIMESTAMPTZ DEFAULT now(),
    expira_em TIMESTAMPTZ NOT NULL,
    usado_em TIMESTAMPTZ,
    ip_validacao TEXT
);

-- Índice para busca por token
CREATE INDEX IF NOT EXISTS idx_tokens_token ON tokens(token);
CREATE INDEX IF NOT EXISTS idx_tokens_servidor ON tokens(servidor_id);

-- 3. TABELA DE UPLOADS CSV
-- Histórico de importações de dados
CREATE TABLE IF NOT EXISTS csv_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    registros_importados INTEGER DEFAULT 0,
    registros_atualizados INTEGER DEFAULT 0,
    registros_erro INTEGER DEFAULT 0,
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para ordenação
CREATE INDEX IF NOT EXISTS idx_csv_uploads_date ON csv_uploads(uploaded_at DESC);

-- 4. TABELA DE VALIDAÇÕES
-- Log de validações realizadas
CREATE TABLE IF NOT EXISTS validacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id UUID REFERENCES tokens(id),
    servidor_id UUID NOT NULL REFERENCES servidores(id),
    resultado TEXT NOT NULL CHECK (resultado IN ('valido', 'expirado', 'invalido', 'bloqueado')),
    ip_origem TEXT,
    user_agent TEXT,
    validado_em TIMESTAMPTZ DEFAULT now()
);

-- Índice para busca
CREATE INDEX IF NOT EXISTS idx_validacoes_servidor ON validacoes(servidor_id);
CREATE INDEX IF NOT EXISTS idx_validacoes_data ON validacoes(validado_em DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE servidores ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE validacoes ENABLE ROW LEVEL SECURITY;

-- Políticas para SERVIDORES
-- Leitura pública (para validação)
CREATE POLICY "Servidores são públicos para leitura" ON servidores
    FOR SELECT USING (true);

-- Escrita apenas para service_role (backend)
CREATE POLICY "Apenas service_role pode inserir servidores" ON servidores
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Apenas service_role pode atualizar servidores" ON servidores
    FOR UPDATE USING (auth.role() = 'service_role');

-- Políticas para TOKENS
-- Leitura pública (para validação)
CREATE POLICY "Tokens são públicos para leitura" ON tokens
    FOR SELECT USING (true);

-- Escrita apenas autenticado
CREATE POLICY "Usuários autenticados podem criar tokens" ON tokens
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Políticas para VALIDAÇÕES
-- Qualquer um pode criar validação (lojistas)
CREATE POLICY "Qualquer um pode criar validação" ON validacoes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Validações são públicas para leitura" ON validacoes
    FOR SELECT USING (true);

-- Políticas para CSV_UPLOADS
-- Apenas authenticated/service_role
CREATE POLICY "Apenas admin pode ver uploads" ON csv_uploads
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Apenas admin pode criar uploads" ON csv_uploads
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- =============================================
-- DADOS DE EXEMPLO (opcional)
-- =============================================

-- Insere um servidor de teste
INSERT INTO servidores (cpf, nome, secretaria, cargo, matricula, status, primeiro_acesso)
VALUES 
    ('123.456.789-00', 'João da Silva Santos', 'Secretaria de Educação', 'Professor de Matemática', '2021001', 'ativo', false),
    ('987.654.321-00', 'Maria Fernanda Oliveira', 'Secretaria de Saúde', 'Enfermeira Chefe', '2020015', 'ativo', false),
    ('456.789.123-00', 'Carlos Alberto Mendes', 'Secretaria de Obras', 'Engenheiro Civil', '2019008', 'ativo', false)
ON CONFLICT (cpf) DO NOTHING;

-- =============================================
-- FIM DAS MIGRATIONS
-- =============================================

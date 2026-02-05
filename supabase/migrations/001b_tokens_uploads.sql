-- PARTE 2: DEMAIS TABELAS
-- Execute após a Parte 1

-- 2. TABELA DE TOKENS
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

CREATE INDEX IF NOT EXISTS idx_tokens_token ON tokens(token);
CREATE INDEX IF NOT EXISTS idx_tokens_servidor ON tokens(servidor_id);

-- 3. TABELA DE UPLOADS CSV
CREATE TABLE IF NOT EXISTS csv_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    registros_importados INTEGER DEFAULT 0,
    registros_atualizados INTEGER DEFAULT 0,
    registros_erro INTEGER DEFAULT 0,
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_csv_uploads_date ON csv_uploads(uploaded_at DESC);

-- 4. TABELA DE VALIDAÇÕES
CREATE TABLE IF NOT EXISTS validacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id UUID REFERENCES tokens(id),
    servidor_id UUID NOT NULL REFERENCES servidores(id),
    resultado TEXT NOT NULL CHECK (resultado IN ('valido', 'expirado', 'invalido', 'bloqueado')),
    ip_origem TEXT,
    user_agent TEXT,
    validado_em TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_validacoes_servidor ON validacoes(servidor_id);
CREATE INDEX IF NOT EXISTS idx_validacoes_data ON validacoes(validado_em DESC);

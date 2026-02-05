-- PARTE 1: TABELAS BÁSICAS
-- Execute primeiro esta parte

-- 1. TABELA DE SERVIDORES
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

-- Índices
CREATE INDEX IF NOT EXISTS idx_servidores_cpf ON servidores(cpf);
CREATE INDEX IF NOT EXISTS idx_servidores_matricula ON servidores(matricula);
CREATE INDEX IF NOT EXISTS idx_servidores_status ON servidores(status);

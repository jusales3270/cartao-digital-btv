-- PARTE 3: DADOS DE TESTE
-- Execute por último

-- Insere servidores de teste
INSERT INTO servidores (cpf, nome, secretaria, cargo, matricula, status, primeiro_acesso)
VALUES 
    ('123.456.789-00', 'João da Silva Santos', 'Secretaria de Educação', 'Professor de Matemática', '2021001', 'ativo', false),
    ('987.654.321-00', 'Maria Fernanda Oliveira', 'Secretaria de Saúde', 'Enfermeira Chefe', '2020015', 'ativo', false),
    ('456.789.123-00', 'Carlos Alberto Mendes', 'Secretaria de Obras', 'Engenheiro Civil', '2019008', 'ativo', false)
ON CONFLICT (cpf) DO NOTHING;

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Building2,
    Shield,
    Clock,
    User,
    Loader2
} from 'lucide-react';
import type { ValidacaoPublicaData } from '@/types/database';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Cliente não tipado para operações de escrita (evita erros de tipo quando Supabase não está configurado)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// Interface para os dados do token do banco
interface TokenData {
    id: string;
    servidor_id: string;
    token: string;
    usado: boolean;
    criado_em: string;
    expira_em: string;
    usado_em: string | null;
    ip_validacao: string | null;
    servidores: {
        nome: string;
        cpf: string;
        secretaria: string;
        cargo: string;
        status: 'ativo' | 'inativo' | 'bloqueado';
        foto_url: string | null;
    };
}

// Dados mock para desenvolvimento (quando Supabase não está configurado)
const mockValidacao: ValidacaoPublicaData = {
    valido: true,
    servidor: {
        nome: 'João da Silva Santos',
        cpf_mascarado: '***.456.789-**',
        secretaria: 'Secretaria de Educação',
        cargo: 'Professor de Matemática',
        status: 'ativo',
        foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    }
};

export function ValidacaoPublica() {
    const { token } = useParams<{ token: string }>();
    const [carregando, setCarregando] = useState(true);
    const [dados, setDados] = useState<ValidacaoPublicaData | null>(null);

    useEffect(() => {
        validarToken();
    }, [token]);

    const validarToken = async () => {
        setCarregando(true);

        // Verifica se token foi fornecido
        if (!token) {
            setDados({
                valido: false,
                mensagem: 'Token não fornecido'
            });
            setCarregando(false);
            return;
        }

        // Simula delay de rede
        await new Promise(resolve => setTimeout(resolve, 800));

        if (!isSupabaseConfigured()) {
            // Modo desenvolvimento - usa dados mock
            if (token && token.length > 10) {
                setDados(mockValidacao);
            } else {
                setDados({
                    valido: false,
                    mensagem: 'Token inválido ou não encontrado'
                });
            }
            setCarregando(false);
            return;
        }

        try {
            // Busca o token no banco de dados
            const { data, error: tokenError } = await db
                .from('tokens')
                .select('*, servidores(*)')
                .eq('token', token)
                .single();

            const tokenData = data as TokenData | null;

            if (tokenError || !tokenData) {
                setDados({
                    valido: false,
                    mensagem: 'Código não encontrado'
                });
                setCarregando(false);
                return;
            }

            // Verifica se expirou
            const expiraEm = new Date(tokenData.expira_em);
            if (expiraEm < new Date()) {
                setDados({
                    valido: false,
                    expirado: true,
                    mensagem: 'Código expirado. Solicite um novo ao servidor.'
                });
                await registrarLogValidacao(tokenData.servidor_id, tokenData.id, 'expirado');
                setCarregando(false);
                return;
            }

            // Verifica se já foi usado
            if (tokenData.usado) {
                setDados({
                    valido: false,
                    mensagem: 'Código já foi utilizado'
                });
                await registrarLogValidacao(tokenData.servidor_id, tokenData.id, 'invalido');
                setCarregando(false);
                return;
            }

            // Token válido - retorna dados do servidor
            const servidor = tokenData.servidores;

            // Mascara o CPF
            const cpfMascarado = servidor.cpf.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, '***.$2.***-**');

            setDados({
                valido: true,
                servidor: {
                    nome: servidor.nome,
                    cpf_mascarado: cpfMascarado,
                    secretaria: servidor.secretaria,
                    cargo: servidor.cargo,
                    status: servidor.status,
                    foto_url: servidor.foto_url
                }
            });

            // Marca token como usado (opcional - pode comentar se quiser permitir múltiplas validações)
            await db
                .from('tokens')
                .update({ usado: true, usado_em: new Date().toISOString() })
                .eq('token', token);

            // Registra log de sucesso
            await registrarLogValidacao(tokenData.servidor_id, tokenData.id, 'valido');

        } catch (err) {
            console.error('Erro na validação:', err);
            setDados({
                valido: false,
                mensagem: 'Erro de conexão'
            });
        }

        setCarregando(false);
    };

    const registrarLogValidacao = async (
        servidorId: string,
        tokenId: string | undefined,
        resultado: 'valido' | 'expirado' | 'invalido' | 'bloqueado'
    ) => {
        try {
            await db.from('validacoes').insert({
                servidor_id: servidorId,
                token_id: tokenId,
                resultado,
                user_agent: navigator.userAgent
            });
        } catch (err) {
            console.error('Erro ao registrar log:', err);
        }
    };

    const getIniciais = (nome: string) => {
        return nome
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ativo':
                return 'bg-green-100 text-green-700 border-green-300';
            case 'inativo':
                return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'bloqueado':
                return 'bg-red-100 text-red-700 border-red-300';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ativo':
                return 'VÍNCULO ATIVO';
            case 'inativo':
                return 'VÍNCULO INATIVO';
            case 'bloqueado':
                return 'BLOQUEADO';
            default:
                return status.toUpperCase();
        }
    };

    // Tela de carregamento
    if (carregando) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-sm p-8 text-center border-0 shadow-xl">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-gray-900">Validando...</h2>
                    <p className="text-sm text-gray-500 mt-2">Verificando autenticidade do cartão</p>
                </Card>
            </div>
        );
    }

    // Resultado inválido ou expirado
    if (!dados?.valido || !dados?.servidor) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-red-50 to-gray-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-sm overflow-hidden border-0 shadow-xl">
                    <div className={`p-8 text-center ${dados?.expirado ? 'bg-yellow-50' : 'bg-red-50'}`}>
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${dados?.expirado ? 'bg-yellow-100' : 'bg-red-100'
                            }`}>
                            {dados?.expirado ? (
                                <Clock className="w-10 h-10 text-yellow-600" />
                            ) : (
                                <XCircle className="w-10 h-10 text-red-600" />
                            )}
                        </div>

                        <h2 className={`text-2xl font-bold mb-2 ${dados?.expirado ? 'text-yellow-800' : 'text-red-800'
                            }`}>
                            {dados?.expirado ? 'Código Expirado' : 'Código Inválido'}
                        </h2>

                        <p className={`text-sm ${dados?.expirado ? 'text-yellow-700' : 'text-red-700'}`}>
                            {dados?.mensagem || 'O código escaneado não é válido'}
                        </p>
                    </div>

                    <div className="p-6 bg-white text-center">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Solicite novo código ao servidor</span>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    const { servidor } = dados;

    // Resultado válido - Carteira Digital
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-sm overflow-hidden border-0 shadow-2xl">
                {/* Cabeçalho com brasão */}
                <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 p-6 text-white relative overflow-hidden">
                    {/* Padrão decorativo */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <Building2 className="w-6 h-6" />
                            <span className="font-semibold text-sm tracking-wide">PREFEITURA MUNICIPAL</span>
                        </div>
                        <h1 className="text-center text-xl font-bold tracking-tight">
                            CARTEIRA DE IDENTIDADE
                        </h1>
                        <p className="text-center text-blue-100 text-sm mt-1">
                            Servidor Público Municipal
                        </p>
                    </div>
                </div>

                {/* Corpo do cartão - Dados do servidor */}
                <div className="p-6 bg-white">
                    {/* Foto e nome */}
                    <div className="flex items-center gap-4 mb-6">
                        <Avatar className="w-24 h-24 border-4 border-gray-200 shadow-lg">
                            <AvatarImage src={servidor.foto_url || undefined} alt={servidor.nome} />
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl font-bold">
                                {getIniciais(servidor.nome)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">Nome Completo</p>
                            <h2 className="font-bold text-gray-900 text-lg leading-tight">
                                {servidor.nome}
                            </h2>
                        </div>
                    </div>

                    {/* Campos de dados */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    CPF
                                </p>
                                <p className="font-semibold text-gray-900">{servidor.cpf_mascarado}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Cargo</p>
                                <p className="font-semibold text-gray-900 text-sm truncate">
                                    {servidor.cargo}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                Secretaria
                            </p>
                            <p className="font-semibold text-gray-900">
                                {servidor.secretaria}
                            </p>
                        </div>

                        {/* Status do vínculo */}
                        <div className={`p-4 rounded-xl border-2 ${getStatusColor(servidor.status)} text-center`}>
                            <div className="flex items-center justify-center gap-2">
                                {servidor.status === 'ativo' ? (
                                    <CheckCircle2 className="w-6 h-6" />
                                ) : servidor.status === 'bloqueado' ? (
                                    <XCircle className="w-6 h-6" />
                                ) : (
                                    <AlertTriangle className="w-6 h-6" />
                                )}
                                <span className="font-bold text-lg">
                                    {getStatusLabel(servidor.status)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer com verificação */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-2 text-green-700">
                        <Shield className="w-5 h-5" />
                        <span className="text-sm font-medium">Documento Verificado</span>
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-2">
                        Sistema de Identidade Digital - Prefeitura Municipal
                    </p>
                </div>
            </Card>
        </div>
    );
}

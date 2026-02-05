import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { listarServidores, atualizarStatusServidor, getAdminStats, parseCSV, importarServidoresCSV, listarValidacoes, type AdminStats, type ValidacaoLog } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LogOut,
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Search,
  MoreVertical,
  Ban,
  CheckCircle2,
  FileSpreadsheet,
  RefreshCw,
  Building2,
  History,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Interface para servidor com campos do banco
interface ServidorDB {
  id: string;
  cpf: string;
  nome: string;
  secretaria: string;
  cargo: string;
  matricula: string;
  status: 'ativo' | 'inativo' | 'bloqueado';
  foto_url?: string | null;
  data_admissao?: string | null;
  primeiro_acesso?: boolean;
  created_at?: string;
  updated_at?: string;
}

export function AdminPanel() {
  const logout = useAuthStore((state) => state.logout);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativo' | 'inativo' | 'bloqueado'>('todos');
  const [servidorSelecionado, setServidorSelecionado] = useState<ServidorDB | null>(null);
  const [showBloqueioDialog, setShowBloqueioDialog] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);

  // Dados do banco
  const [servidores, setServidores] = useState<ServidorDB[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [validacoes, setValidacoes] = useState<ValidacaoLog[]>([]);

  // CSV Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'parsing' | 'importing' | 'done' | 'error'>('idle');
  const [uploadResult, setUploadResult] = useState<{ importados: number; atualizados: number; erros: number } | null>(null);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  // Carrega dados na inicialização
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setCarregandoDados(true);
    try {
      const [servidoresData, statsData, validacoesData] = await Promise.all([
        listarServidores(),
        getAdminStats(),
        listarValidacoes()
      ]);
      setServidores(servidoresData as ServidorDB[]);
      setStats(statsData);
      setValidacoes(validacoesData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
    setCarregandoDados(false);
  };

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reseta estado
    setUploadStatus('parsing');
    setUploadResult(null);
    setUploadErrors([]);

    try {
      // Lê o arquivo
      const text = await file.text();

      // Parseia o CSV
      const parseResult = parseCSV(text);

      if (!parseResult.success || parseResult.servidores.length === 0) {
        setUploadStatus('error');
        setUploadErrors(parseResult.erros.length > 0 ? parseResult.erros : ['Nenhum servidor válido encontrado no arquivo']);
        return;
      }

      // Importa para o Supabase
      setUploadStatus('importing');
      const result = await importarServidoresCSV(parseResult.servidores, 'admin', file.name);

      setUploadResult(result);
      setUploadErrors(parseResult.erros);
      setUploadStatus('done');

      // Recarrega os dados
      await carregarDados();

    } catch (err) {
      console.error('Erro no upload:', err);
      setUploadStatus('error');
      setUploadErrors(['Erro ao processar o arquivo']);
    }

    // Limpa o input para permitir reupload do mesmo arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBloquear = async () => {
    if (!servidorSelecionado) return;

    setCarregando(true);

    const novoStatus = servidorSelecionado.status === 'bloqueado' ? 'ativo' : 'bloqueado';
    const sucesso = await atualizarStatusServidor(servidorSelecionado.id, novoStatus);

    if (sucesso) {
      // Atualiza a lista local
      setServidores(prev => prev.map(s =>
        s.id === servidorSelecionado.id ? { ...s, status: novoStatus } : s
      ));
      // Recarrega estatísticas
      const statsData = await getAdminStats();
      setStats(statsData);
    }

    setCarregando(false);
    setShowBloqueioDialog(false);
    setServidorSelecionado(null);
  };

  const servidoresFiltrados = servidores.filter(s => {
    const matchBusca = s.nome.toLowerCase().includes(busca.toLowerCase()) ||
      s.cpf.includes(busca) ||
      s.matricula.includes(busca);
    const matchStatus = filtroStatus === 'todos' || s.status === filtroStatus;
    return matchBusca && matchStatus;
  });

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
        return 'bg-green-100 text-green-700 border-green-200';
      case 'inativo':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'bloqueado':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const statsCards = stats ? [
    {
      label: 'Total Servidores',
      value: stats.totalServidores,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      label: 'Ativos',
      value: stats.servidoresAtivos,
      icon: UserCheck,
      color: 'bg-green-500'
    },
    {
      label: 'Bloqueados',
      value: stats.servidoresBloqueados,
      icon: UserX,
      color: 'bg-red-500'
    },
    {
      label: 'Validações Hoje',
      value: stats.totalValidacoesHoje,
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
  ] : [];

  if (carregandoDados) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative isolation-auto">
      {/* Background Watermark */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <img
          src="/brasao.png"
          alt=""
          className="w-[120vh] h-[120vh] object-contain opacity-[0.03] blur-[1px] grayscale"
        />
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <img src="/brasao.png" alt="Brasão Boituva" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 leading-tight">Painel Administrativo</h1>
                <p className="text-xs text-gray-500">Clube de Vantagens BTV</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={carregarDados}
                className="text-gray-500"
                title="Atualizar dados"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLogoutConfirm(true)}
                className="text-gray-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsCards.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="servidores" className="space-y-4">
          <TabsList className="bg-white border">
            <TabsTrigger value="servidores" className="data-[state=active]:bg-blue-50">
              <Users className="w-4 h-4 mr-2" />
              Servidores
            </TabsTrigger>
            <TabsTrigger value="validacoes" className="data-[state=active]:bg-blue-50">
              <History className="w-4 h-4 mr-2" />
              Validações
            </TabsTrigger>
            <TabsTrigger value="importar" className="data-[state=active]:bg-blue-50">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Importar
            </TabsTrigger>
          </TabsList>

          {/* Aba Servidores */}
          <TabsContent value="servidores">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="text-lg">Lista de Servidores</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Buscar por nome, CPF ou matrícula"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <select
                      value={filtroStatus}
                      onChange={(e) => setFiltroStatus(e.target.value as typeof filtroStatus)}
                      className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="todos">Todos</option>
                      <option value="ativo">Ativos</option>
                      <option value="inativo">Inativos</option>
                      <option value="bloqueado">Bloqueados</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Servidor</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Secretaria</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Matrícula</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {servidoresFiltrados.map((servidor) => (
                        <tr key={servidor.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={servidor.foto_url || undefined} alt={servidor.nome} />
                                <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">
                                  {getIniciais(servidor.nome)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900">{servidor.nome}</p>
                                <p className="text-sm text-gray-500">{servidor.cpf}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {servidor.secretaria.replace('Secretaria de ', '')}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {servidor.matricula}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={`${getStatusColor(servidor.status)} border`}>
                              {servidor.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setServidorSelecionado(servidor);
                                    setShowBloqueioDialog(true);
                                  }}
                                  className={servidor.status === 'bloqueado' ? 'text-green-600' : 'text-red-600'}
                                >
                                  {servidor.status === 'bloqueado' ? (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      Desbloquear
                                    </>
                                  ) : (
                                    <>
                                      <Ban className="w-4 h-4 mr-2" />
                                      Bloquear
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {servidoresFiltrados.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum servidor encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Validações */}
          <TabsContent value="validacoes">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Histórico de Validações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Horário</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Servidor</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">CPF</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">IP Origem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validacoes.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-gray-500">
                            Nenhuma validação registrada ainda
                          </td>
                        </tr>
                      ) : (
                        validacoes.map((log) => (
                          <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <History className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {new Date(log.validado_em).toLocaleString('pt-BR')}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-sm font-medium text-gray-900">{log.servidores?.nome || 'Desconhecido'}</p>
                              <p className="text-xs text-gray-500">{log.servidores?.secretaria}</p>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm font-mono text-gray-600">
                                {log.servidores?.cpf}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={`
                                ${log.resultado === 'valido' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                                ${log.resultado === 'invalido' ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''}
                                ${log.resultado === 'expirado' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : ''}
                              `}>
                                {log.resultado === 'valido' ? 'Válido' :
                                  log.resultado === 'invalido' ? 'Inválido' :
                                    log.resultado === 'expirado' ? 'Expirado' : log.resultado}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-gray-300" />
                                <span className="text-sm text-gray-500">{log.ip_origem || 'N/A'}</span>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Importar */}
          <TabsContent value="importar">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Importar Servidores</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Input file oculto */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Estado: Idle (inicial) */}
                {uploadStatus === 'idle' && (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Clique para selecionar um arquivo CSV
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      ou arraste o arquivo aqui
                    </p>
                    <Button variant="outline">
                      Selecionar Arquivo
                    </Button>
                  </div>
                )}

                {/* Estado: Parsing ou Importing */}
                {(uploadStatus === 'parsing' || uploadStatus === 'importing') && (
                  <div className="border-2 border-dashed border-blue-300 rounded-xl p-12 text-center bg-blue-50">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-blue-900 mb-2">
                      {uploadStatus === 'parsing' ? 'Processando arquivo...' : 'Importando servidores...'}
                    </h3>
                    <p className="text-sm text-blue-700">
                      {uploadStatus === 'parsing' ? 'Lendo e validando dados' : 'Enviando para o banco de dados'}
                    </p>
                  </div>
                )}

                {/* Estado: Done (sucesso) */}
                {uploadStatus === 'done' && uploadResult && (
                  <div className="border-2 border-green-300 rounded-xl p-8 bg-green-50">
                    <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-green-900 mb-4 text-center">
                      Importação concluída!
                    </h3>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-white rounded-lg p-4 text-center border border-green-200">
                        <p className="text-2xl font-bold text-green-700">{uploadResult.importados}</p>
                        <p className="text-sm text-gray-600">Novos</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 text-center border border-blue-200">
                        <p className="text-2xl font-bold text-blue-700">{uploadResult.atualizados}</p>
                        <p className="text-sm text-gray-600">Atualizados</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 text-center border border-red-200">
                        <p className="text-2xl font-bold text-red-700">{uploadResult.erros}</p>
                        <p className="text-sm text-gray-600">Erros</p>
                      </div>
                    </div>
                    {uploadErrors.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <p className="text-sm font-medium text-yellow-800 mb-1">Avisos:</p>
                        <ul className="text-sm text-yellow-700 list-disc list-inside">
                          {uploadErrors.slice(0, 5).map((erro, i) => (
                            <li key={i}>{erro}</li>
                          ))}
                          {uploadErrors.length > 5 && (
                            <li>... e mais {uploadErrors.length - 5} avisos</li>
                          )}
                        </ul>
                      </div>
                    )}
                    <Button
                      className="w-full"
                      onClick={() => setUploadStatus('idle')}
                    >
                      Importar outro arquivo
                    </Button>
                  </div>
                )}

                {/* Estado: Error */}
                {uploadStatus === 'error' && (
                  <div className="border-2 border-red-300 rounded-xl p-8 bg-red-50">
                    <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-red-900 mb-4 text-center">
                      Erro na importação
                    </h3>
                    {uploadErrors.length > 0 && (
                      <ul className="text-sm text-red-700 list-disc list-inside mb-4">
                        {uploadErrors.map((erro, i) => (
                          <li key={i}>{erro}</li>
                        ))}
                      </ul>
                    )}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setUploadStatus('idle')}
                    >
                      Tentar novamente
                    </Button>
                  </div>
                )}

                {/* Instruções de formato */}
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Formato esperado (separador: ponto e vírgula)
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Colunas: <strong>Nome;CPF;Matrícula;Secretaria;Cargo;Status</strong>
                      </p>
                      <p className="text-xs text-yellow-600 mt-2">
                        Exemplo: João Silva;123.456.789-00;2024001;Secretaria de Educação;Professor;ativo
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialog de Confirmação de Bloqueio */}
      <Dialog open={showBloqueioDialog} onOpenChange={setShowBloqueioDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {servidorSelecionado?.status === 'bloqueado' ? 'Desbloquear' : 'Bloquear'} Servidor
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja {servidorSelecionado?.status === 'bloqueado' ? 'desbloquear' : 'bloquear'}
              {' '}<strong>{servidorSelecionado?.nome}</strong>?
              {servidorSelecionado?.status !== 'bloqueado' && (
                <span className="block mt-2 text-red-600">
                  O servidor não poderá mais gerar cartões digitais.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBloqueioDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleBloquear}
              disabled={carregando}
              className={servidorSelecionado?.status === 'bloqueado'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
              }
            >
              {carregando ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : servidorSelecionado?.status === 'bloqueado' ? (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              ) : (
                <Ban className="w-4 h-4 mr-2" />
              )}
              {servidorSelecionado?.status === 'bloqueado' ? 'Desbloquear' : 'Bloquear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Logout */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sair do sistema?</DialogTitle>
            <DialogDescription>
              Você será desconectado do painel administrativo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutConfirm(false)}>
              Cancelar
            </Button>
            <Button onClick={handleLogout} variant="destructive">
              Sair
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  QrCode, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Building2,
  User,
  RefreshCw,
  Camera,
  ScanLine
} from 'lucide-react';
import { validarQRCode, buscarServidorPorId } from '@/data/mockDatabase';
import type { Servidor } from '@/types';

export function Validacao() {
  const [codigo, setCodigo] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState<{
    status: 'valido' | 'invalido' | 'expirado' | null;
    servidor?: Servidor;
    mensagem?: string;
  }>({ status: null });
  const inputRef = useRef<HTMLInputElement>(null);

  // Simula leitura de QR Code
  const handleValidar = async () => {
    if (!codigo.trim()) {
      setResultado({
        status: 'invalido',
        mensagem: 'Digite ou escaneie um código válido',
      });
      return;
    }

    setCarregando(true);
    
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Valida o QR Code
    const validacao = validarQRCode(codigo);
    
    if (validacao.valido && validacao.servidorId) {
      const servidor = buscarServidorPorId(validacao.servidorId);
      if (servidor && servidor.status === 'ativo') {
        setResultado({
          status: 'valido',
          servidor,
          mensagem: 'Vínculo ativo confirmado',
        });
      } else if (servidor) {
        setResultado({
          status: 'invalido',
          servidor,
          mensagem: servidor.status === 'bloqueado' 
            ? 'Servidor bloqueado no sistema' 
            : 'Vínculo inativo',
        });
      }
    } else {
      setResultado({
        status: validacao.motivo?.includes('expirado') ? 'expirado' : 'invalido',
        mensagem: validacao.motivo || 'Código inválido',
      });
    }

    setCarregando(false);
  };

  const handleNovaConsulta = () => {
    setCodigo('');
    setResultado({ status: null });
    inputRef.current?.focus();
  };

  const getIniciais = (nome: string) => {
    return nome
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Simula escaneamento de QR Code
  const simularScan = () => {
    const mockTokens = [
      'eyJzZXJ2aWRvcklkIjoiMSIsInRpbWVzdGFtcCI6MTcwNTMxMjAwMCwiZXhwIjoxNzA1MzEyMTIwMH0',
      'eyJzZXJ2aWRvcklkIjoiMiIsInRpbWVzdGFtcCI6MTcwNTMxMjAwMCwiZXhwIjoxNzA1MzEyMTIwMH0',
    ];
    const randomToken = mockTokens[Math.floor(Math.random() * mockTokens.length)];
    setCodigo(randomToken);
    // Dispara validação automaticamente
    setTimeout(() => {
      handleValidar();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">Validação</h1>
              <p className="text-xs text-gray-500">Clube de Vantagens - Comerciante</p>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-md mx-auto px-4 py-6">
        {!resultado.status ? (
          <>
            {/* Input de Validação */}
            <Card className="mb-6 border-0 shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-green-600" />
                  Validar QR Code
                </h2>
                
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder="Cole o código do QR Code"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value)}
                      className="h-14 pr-12 text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleValidar()}
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>

                  <Button
                    onClick={handleValidar}
                    disabled={carregando || !codigo.trim()}
                    className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-semibold"
                  >
                    {carregando ? (
                      <>
                        <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                        Validando...
                      </>
                    ) : (
                      <>
                        <ScanLine className="mr-2 h-5 w-5" />
                        Validar Código
                      </>
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">ou</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={simularScan}
                    className="w-full h-14 border-2 border-dashed border-green-300 hover:border-green-500 hover:bg-green-50"
                  >
                    <Camera className="mr-2 h-5 w-5 text-green-600" />
                    Simular Escaneamento
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Instruções */}
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Como validar
              </h3>
              <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                <li>Solicite o QR Code ao servidor no caixa</li>
                <li>Escaneie com a câmera do celular ou digite o código</li>
                <li>Verifique se a foto corresponde à pessoa</li>
                <li>Confirme o status de vínculo ativo</li>
              </ol>
            </div>

            {/* Dados de Teste */}
            <div className="mt-6 bg-gray-100 rounded-xl p-4">
              <p className="text-xs text-gray-600 font-medium mb-2">Códigos de teste:</p>
              <div className="space-y-2">
                <button
                  onClick={() => setCodigo('eyJzZXJ2aWRvcklkIjoiMSIsInRpbWVzdGFtcCI6MTcwNTMxMjAwMCwiZXhwIjoxNzA1MzEyMTIwMH0')}
                  className="w-full text-left text-xs bg-white p-2 rounded border hover:border-green-400 transition-colors"
                >
                  <span className="font-medium">João (Ativo):</span>{' '}
                  eyJzZXJ2aWRvcklkIjoiMSIsInRpbWVzdGFtcCI6MTcwNTMxMjAwMCwiZXhwIjoxNzA1MzEyMTIwMH0
                </button>
                <button
                  onClick={() => setCodigo('eyJzZXJ2aWRvcklkIjoiNCIsInRpbWVzdGFtcCI6MTcwNTMxMjAwMCwiZXhwIjoxNzA1MzEyMTIwMH0')}
                  className="w-full text-left text-xs bg-white p-2 rounded border hover:border-green-400 transition-colors"
                >
                  <span className="font-medium">Ana (Inativo):</span>{' '}
                  eyJzZXJ2aWRvcklkIjoiNCIsInRpbWVzdGFtcCI6MTcwNTMxMjAwMCwiZXhwIjoxNzA1MzEyMTIwMH0
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Resultado da Validação */}
            <Card className={`mb-6 border-0 shadow-lg overflow-hidden ${
              resultado.status === 'valido' 
                ? 'ring-2 ring-green-500' 
                : resultado.status === 'expirado'
                ? 'ring-2 ring-yellow-500'
                : 'ring-2 ring-red-500'
            }`}>
              {/* Header do Resultado */}
              <div className={`p-6 text-center ${
                resultado.status === 'valido' 
                  ? 'bg-green-50' 
                  : resultado.status === 'expirado'
                  ? 'bg-yellow-50'
                  : 'bg-red-50'
              }`}>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  resultado.status === 'valido' 
                    ? 'bg-green-100' 
                    : resultado.status === 'expirado'
                    ? 'bg-yellow-100'
                    : 'bg-red-100'
                }`}>
                  {resultado.status === 'valido' ? (
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  ) : resultado.status === 'expirado' ? (
                    <AlertTriangle className="w-10 h-10 text-yellow-600" />
                  ) : (
                    <XCircle className="w-10 h-10 text-red-600" />
                  )}
                </div>
                
                <h2 className={`text-2xl font-bold mb-1 ${
                  resultado.status === 'valido' 
                    ? 'text-green-800' 
                    : resultado.status === 'expirado'
                    ? 'text-yellow-800'
                    : 'text-red-800'
                }`}>
                  {resultado.status === 'valido' 
                    ? 'Válido!' 
                    : resultado.status === 'expirado'
                    ? 'Expirado'
                    : 'Inválido'}
                </h2>
                <p className={`text-sm ${
                  resultado.status === 'valido' 
                    ? 'text-green-700' 
                    : resultado.status === 'expirado'
                    ? 'text-yellow-700'
                    : 'text-red-700'
                }`}>
                  {resultado.mensagem}
                </p>
              </div>

              {/* Dados do Servidor (se houver) */}
              {resultado.servidor && (
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={resultado.servidor.foto} alt={resultado.servidor.nome} />
                      <AvatarFallback className="bg-gray-200 text-gray-600 text-lg">
                        {getIniciais(resultado.servidor.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{resultado.servidor.nome}</h3>
                      <p className="text-sm text-gray-500">{resultado.servidor.cargo}</p>
                      <Badge className={`mt-1 ${
                        resultado.servidor.status === 'ativo'
                          ? 'bg-green-100 text-green-700'
                          : resultado.servidor.status === 'inativo'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {resultado.servidor.status === 'ativo' ? 'Vínculo Ativo' : resultado.servidor.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-500 text-xs mb-1">Secretaria</p>
                      <p className="font-medium text-gray-900">
                        {resultado.servidor.secretaria.replace('Secretaria de ', '')}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-500 text-xs mb-1">Matrícula</p>
                      <p className="font-medium text-gray-900">{resultado.servidor.matricula}</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Botão Nova Consulta */}
            <Button
              onClick={handleNovaConsulta}
              className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white font-semibold"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Nova Consulta
            </Button>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-md mx-auto px-4 py-6 text-center">
        <p className="text-xs text-gray-400">
          Sistema de Identidade Digital - Prefeitura Municipal
        </p>
      </footer>
    </div>
  );
}

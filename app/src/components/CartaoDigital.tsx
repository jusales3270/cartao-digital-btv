import { useEffect, useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuthStore } from '@/store/authStore';
import { useQRCodeStore } from '@/store/qrCodeStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  RefreshCw,
  Clock,
  Shield,
  AlertTriangle,
  User,
  QrCode
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function CartaoDigital() {
  const user = useAuthStore((state) => state.user);
  const setView = useAuthStore((state) => state.setView);

  const qrCodeAtual = useQRCodeStore((state) => state.qrCodeAtual);
  const validationUrl = useQRCodeStore((state) => state.validationUrl);
  const tempoRestante = useQRCodeStore((state) => state.tempoRestante);
  const geracoesRestantes = useQRCodeStore((state) => state.geracoesRestantes);
  const gerarQRCode = useQRCodeStore((state) => state.gerarQRCode);
  const limparQRCode = useQRCodeStore((state) => state.limparQRCode);
  const decrementarTempo = useQRCodeStore((state) => state.decrementarTempo);
  const podeGerarNovo = useQRCodeStore((state) => state.podeGerarNovo);
  const isLoading = useQRCodeStore((state) => state.isLoading);

  const [erro, setErro] = useState('');

  // Gera o QR Code inicial
  useEffect(() => {
    if (!qrCodeAtual && user) {
      handleGerarQRCode();
    }
  }, []);

  // Timer para decrementar o tempo
  useEffect(() => {
    const interval = setInterval(() => {
      decrementarTempo();
    }, 1000);

    return () => clearInterval(interval);
  }, [decrementarTempo]);

  const [hasExpired, setHasExpired] = useState(false);

  // Monitora expiração para mostrar msg
  useEffect(() => {
    if (tempoRestante === 0 && !qrCodeAtual && !isLoading) {
      setHasExpired(true);
    }
  }, [tempoRestante, qrCodeAtual, isLoading]);

  const handleGerarQRCode = useCallback(async () => {
    if (!user) return;

    if (!podeGerarNovo()) {
      setErro('Limite de gerações atingido. Aguarde 1 minuto.');
      return;
    }

    setErro('');
    setHasExpired(false);
    const resultado = await gerarQRCode(user.id);

    if (!resultado.success) {
      setErro(resultado.message || 'Erro ao gerar QR Code');
    }
  }, [user, gerarQRCode, podeGerarNovo]);

  const handleVoltar = () => {
    limparQRCode();
    setView('dashboard');
  };

  const getIniciais = (nome: string) => {
    return nome
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getTempoColor = () => {
    if (tempoRestante > 60) return 'text-green-600';
    if (tempoRestante > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = () => {
    if (tempoRestante > 60) return 'bg-green-500';
    if (tempoRestante > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // URL de validação pública (gerada pela API)
  const getValidationUrl = () => {
    return validationUrl || '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleVoltar}
            className="text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-bold text-gray-900">Cartão Digital</h1>
            <p className="text-xs text-gray-500">Apresente no caixa</p>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-md mx-auto px-4 py-6">
        {/* Cartão Digital */}
        <Card className="mb-6 border-0 shadow-xl overflow-hidden bg-gradient-to-b from-white to-gray-50">
          {/* Cabeçalho do Cartão */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 p-6 text-white relative overflow-hidden">
            {/* Padrão decorativo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg p-1.5 backdrop-blur-sm flex items-center justify-center">
                    <img
                      src="/brasao.png"
                      alt="Brasão Boituva"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-xs tracking-wider opacity-80">PREFEITURA DE</span>
                    <span className="font-bold text-sm tracking-wide">BOITUVA</span>
                  </div>
                </div>
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur">
                  SERVIDOR
                </Badge>
              </div>

              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 border-4 border-white/30">
                  <AvatarImage src={user?.foto} alt={user?.nome} />
                  <AvatarFallback className="bg-blue-500 text-white text-xl">
                    {user ? getIniciais(user.nome) : 'US'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-blue-100 text-xs mb-1">Nome Completo</p>
                  <h2 className="font-bold text-lg leading-tight truncate">{user?.nome}</h2>
                  <p className="text-blue-100 text-sm mt-1">{user?.cargo}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Corpo do Cartão */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Matrícula</p>
                <p className="font-semibold text-gray-900">{user?.matricula}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Secretaria</p>
                <p className="font-semibold text-gray-900 truncate">
                  {user?.secretaria.replace('Secretaria de ', '')}
                </p>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-2xl shadow-inner border-2 border-gray-100 mb-4">
                {qrCodeAtual ? (
                  <QRCodeSVG
                    value={getValidationUrl()}
                    size={200}
                    level="H"
                    includeMargin={false}
                    bgColor="#ffffff"
                    fgColor="#1e40af"
                  />
                ) : (
                  <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-100 rounded-lg relative overflow-hidden">
                    {hasExpired ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
                        <div className="bg-red-100 p-3 rounded-full mb-2">
                          <Clock className="w-8 h-8 text-red-600" />
                        </div>
                        <span className="text-red-600 font-bold text-lg">EXPIRADO</span>
                        <span className="text-xs text-red-400 mt-1">Gere um novo código</span>
                      </div>
                    ) : (
                      <QrCode className="w-16 h-16 text-gray-300" />
                    )}
                  </div>
                )}
              </div>

              {/* Timer */}
              {qrCodeAtual && (
                <div className="w-full max-w-[200px]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className={`w-4 h-4 ${getTempoColor()}`} />
                      <span className={`text-sm font-medium ${getTempoColor()}`}>
                        {tempoRestante}s
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      Atualiza automaticamente
                    </span>
                  </div>
                  <Progress
                    value={(tempoRestante / 60) * 100}
                    className="h-2"
                  />
                  <div className={`h-2 rounded-full -mt-2 ${getProgressColor()}`}
                    style={{ width: `${(tempoRestante / 60) * 100}%`, transition: 'width 1s linear' }} />
                </div>
              )}
            </div>
          </div>

          {/* Footer do Cartão */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Código válido por 2 minutos • Uso único</span>
            </div>
          </div>
        </Card>

        {/* Ações */}
        <div className="space-y-3">
          <Button
            onClick={handleGerarQRCode}
            disabled={!podeGerarNovo()}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${!podeGerarNovo() ? '' : 'animate-spin-slow'}`} />
            Gerar Novo Código
          </Button>

          {
            erro && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-700">{erro}</p>
              </div>
            )
          }

          {
            geracoesRestantes < 10 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Atenção ao limite
                  </p>
                  <p className="text-sm text-yellow-700">
                    Você tem {geracoesRestantes} gerações restantes neste minuto.
                  </p>
                </div>
              </div>
            )
          }
        </div>

        {/* Instruções */}
        <div className="mt-6 bg-blue-50 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <User className="w-4 h-4" />
            Como usar
          </h3>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>Apresente este QR Code no caixa do estabelecimento</li>
            <li>O comerciante irá escanear com o celular dele</li>
            <li>Aguarde a confirmação de validação</li>
            <li>Pronto! Seu desconto será aplicado</li>
          </ol>
        </div>
      </main>
    </div >
  );
}

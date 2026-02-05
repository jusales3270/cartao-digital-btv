import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, Loader2, Shield, Lock, Eye, EyeOff } from 'lucide-react';

export function PrimeiroAcesso() {
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [dataNascimento, setDataNascimento] = useState('');
  const [matricula, setMatricula] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const user = useAuthStore((state) => state.user);
  const completarPrimeiroAcesso = useAuthStore((state) => state.completarPrimeiroAcesso);

  const validarEtapa1 = () => {
    if (!dataNascimento || !matricula) {
      setErro('Preencha todos os campos');
      return false;
    }

    // Valida data de nascimento
    const [dia, mes, ano] = dataNascimento.split('/');
    const dataFormatada = `${dia}/${mes}/${ano}`;
    
    if (user?.dataNascimento !== dataFormatada) {
      setErro('Data de nascimento incorreta');
      return false;
    }

    if (user?.matricula !== matricula) {
      setErro('Matrícula incorreta');
      return false;
    }

    return true;
  };

  const validarSenha = () => {
    if (novaSenha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem');
      return false;
    }

    return true;
  };

  const handleContinuar = () => {
    setErro('');
    if (validarEtapa1()) {
      setEtapa(2);
    }
  };

  const handleFinalizar = async () => {
    setErro('');
    if (!validarSenha()) return;

    setCarregando(true);
    try {
      const resultado = await completarPrimeiroAcesso(user!.cpf, novaSenha);
      if (resultado.success) {
        setSucesso(true);
      } else {
        setErro(resultado.message || 'Erro ao atualizar senha');
      }
    } catch (error) {
      setErro('Erro ao processar solicitação');
    } finally {
      setCarregando(false);
    }
  };

  const formatarData = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 8) {
      return numeros
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\d{4})$/, '$1');
    }
    return valor;
  };

  if (sucesso) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Cadastro Completo!
            </h2>
            <p className="text-gray-600 mb-6">
              Sua senha foi alterada com sucesso. Você será redirecionado para o dashboard.
            </p>
            <Button 
              onClick={() => useAuthStore.getState().setView('dashboard')}
              className="bg-green-600 hover:bg-green-700"
            >
              Continuar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl shadow-lg mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Primeiro Acesso
          </h1>
          <p className="text-gray-600 mt-2">
            Valide seus dados e crie uma nova senha
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Etapa {etapa} de 2</span>
              <span className="text-sm font-medium text-blue-600">{etapa === 1 ? '50%' : '100%'}</span>
            </div>
            <Progress value={etapa === 1 ? 50 : 100} className="h-2" />
          </CardHeader>
          <CardContent>
            {erro && (
              <Alert variant="destructive" className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{erro}</AlertDescription>
              </Alert>
            )}

            {etapa === 1 ? (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Olá, {user?.nome.split(' ')[0]}!</strong><br />
                    Para sua segurança, precisamos validar alguns dados antes de prosseguir.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                  <Input
                    id="dataNascimento"
                    type="text"
                    placeholder="DD/MM/AAAA"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(formatarData(e.target.value))}
                    maxLength={10}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="matricula">Número da Matrícula</Label>
                  <Input
                    id="matricula"
                    type="text"
                    placeholder="Digite sua matrícula"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    className="h-12"
                  />
                </div>

                <Button
                  onClick={handleContinuar}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                >
                  Continuar
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <Lock className="inline w-4 h-4 mr-1" />
                    Crie uma senha segura com pelo menos 6 caracteres.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="novaSenha">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="novaSenha"
                      type={mostrarSenha ? 'text' : 'password'}
                      placeholder="Digite a nova senha"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      className="h-12 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                  <Input
                    id="confirmarSenha"
                    type={mostrarSenha ? 'text' : 'password'}
                    placeholder="Digite a senha novamente"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setEtapa(1)}
                    className="flex-1 h-12"
                    disabled={carregando}
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleFinalizar}
                    className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
                    disabled={carregando}
                  >
                    {carregando ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Finalizar'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

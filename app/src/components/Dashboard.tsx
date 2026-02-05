import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  QrCode, 
  LogOut, 
  User, 
  Building2, 
  Briefcase, 
  ChevronRight,
  Shield,
  Clock,
  History
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

export function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const setView = useAuthStore((state) => state.setView);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
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
        return 'bg-green-100 text-green-700 border-green-200';
      case 'inativo':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'bloqueado':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">Cartão Digital</h1>
              <p className="text-xs text-gray-500">Clube de Vantagens</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowLogoutConfirm(true)}
            className="text-gray-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-md mx-auto px-4 py-6">
        {/* Card do Perfil */}
        <Card className="mb-6 border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-4 border-white/30">
                <AvatarImage src={user?.foto} alt={user?.nome} />
                <AvatarFallback className="bg-blue-500 text-white text-lg">
                  {user ? getIniciais(user.nome) : 'US'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-semibold truncate">{user?.nome}</h2>
                <p className="text-blue-100 text-sm">{user?.cargo}</p>
                <Badge className={`mt-2 ${getStatusColor(user?.status || '')} border`}>
                  {user?.status === 'ativo' ? 'Vínculo Ativo' : user?.status}
                </Badge>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Secretaria</p>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                    {user?.secretaria.replace('Secretaria de ', '')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Matrícula</p>
                  <p className="text-sm font-medium text-gray-900">{user?.matricula}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão Principal - Gerar Cartão */}
        <div className="mb-6">
          <Button
            onClick={() => setView('cartao')}
            className="w-full h-20 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-200 rounded-2xl flex flex-col items-center justify-center gap-2"
          >
            <QrCode className="w-8 h-8" />
            <span className="text-lg font-semibold">Gerar Cartão Digital</span>
          </Button>
        </div>

        {/* Menu de Opções */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide px-1">
            Opções
          </h3>
          
          <Card className="border-0 shadow-sm overflow-hidden">
            <button className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Meus Dados</p>
                <p className="text-sm text-gray-500">Visualizar informações pessoais</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            
            <div className="h-px bg-gray-100 mx-4" />
            
            <button className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <History className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Histórico de Uso</p>
                <p className="text-sm text-gray-500">Últimas validações</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            
            <div className="h-px bg-gray-100 mx-4" />
            
            <button className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Segurança</p>
                <p className="text-sm text-gray-500">Alterar senha</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </Card>
        </div>

        {/* Informações */}
        <div className="mt-6 bg-blue-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Como funciona?</p>
              <p className="text-sm text-blue-700 mt-1">
                Gere seu cartão digital e apresente o QR Code no caixa do estabelecimento parceiro. 
                O código muda automaticamente a cada 60 segundos para maior segurança.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Dialog de Confirmação de Logout */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sair do sistema?</DialogTitle>
            <DialogDescription>
              Você será desconectado e precisará fazer login novamente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="flex-1"
            >
              Sair
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

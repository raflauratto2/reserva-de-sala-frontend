import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePerfil } from '@/controllers/usePerfil';
import { useMeuPerfil } from '@/controllers/useMeuPerfil';
import { useToastContext } from '@/contexts/ToastContext';

interface EditPerfilModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditPerfilModal = ({ open, onOpenChange }: EditPerfilModalProps) => {
  const { perfil, refetch } = useMeuPerfil();
  const { atualizarPerfil, loadingAtualizar } = usePerfil();
  const { showToast } = useToastContext();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'perfil' | 'senha'>('perfil');

  // Carrega os dados do perfil quando o modal abre
  useEffect(() => {
    if (open && perfil) {
      setNome(perfil.nome || '');
      setEmail(perfil.email || '');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      setErrors({});
    }
  }, [open, perfil]);

  const validatePerfil = () => {
    const newErrors: Record<string, string> = {};

    if (!nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSenha = () => {
    const newErrors: Record<string, string> = {};

    if (!senhaAtual.trim()) {
      newErrors.senhaAtual = 'Senha atual é obrigatória';
    }

    if (!novaSenha.trim()) {
      newErrors.novaSenha = 'Nova senha é obrigatória';
    } else if (novaSenha.length < 6) {
      newErrors.novaSenha = 'A senha deve ter pelo menos 6 caracteres';
    }

    if (novaSenha !== confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdatePerfil = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePerfil()) {
      return;
    }

    try {
      await atualizarPerfil({
        nome: nome.trim(),
        email: email.trim(),
      });

      await refetch();
      showToast({ message: 'Perfil atualizado com sucesso!', variant: 'success' });
      // Delay para permitir que o toast apareça antes de fechar o modal
      setTimeout(() => {
        onOpenChange(false);
      }, 300);
    } catch (error: any) {
      showToast({ message: error.message || 'Erro ao atualizar perfil', variant: 'destructive' });
    }
  };

  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSenha()) {
      return;
    }

    try {
      // Usa a mesma mutation atualizarPerfil, mas apenas com o campo password
      await atualizarPerfil({
        password: novaSenha,
      });

      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      await refetch();
      showToast({ message: 'Senha alterada com sucesso!', variant: 'success' });
    } catch (error: any) {
      showToast({ message: error.message || 'Erro ao alterar senha', variant: 'destructive' });
    }
  };

  if (!perfil) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Atualize suas informações pessoais ou altere sua senha.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 border-b mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('perfil')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'perfil'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Dados Pessoais
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('senha')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'senha'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Alterar Senha
          </button>
        </div>

        {/* Formulário de Perfil */}
        {activeTab === 'perfil' && (
          <form onSubmit={handleUpdatePerfil} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  if (errors.nome) {
                    setErrors({ ...errors, nome: '' });
                  }
                }}
                placeholder="Seu nome completo"
              />
              {errors.nome && (
                <p className="text-sm text-destructive">{errors.nome}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors({ ...errors, email: '' });
                  }
                }}
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={perfil.username}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                O username não pode ser alterado.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loadingAtualizar}>
                {loadingAtualizar ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* Formulário de Senha */}
        {activeTab === 'senha' && (
          <form onSubmit={handleAlterarSenha} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="senhaAtual">Senha Atual</Label>
              <Input
                id="senhaAtual"
                type="password"
                value={senhaAtual}
                onChange={(e) => {
                  setSenhaAtual(e.target.value);
                  if (errors.senhaAtual) {
                    setErrors({ ...errors, senhaAtual: '' });
                  }
                }}
                placeholder="Digite sua senha atual"
              />
              {errors.senhaAtual && (
                <p className="text-sm text-destructive">{errors.senhaAtual}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="novaSenha">Nova Senha</Label>
              <Input
                id="novaSenha"
                type="password"
                value={novaSenha}
                onChange={(e) => {
                  setNovaSenha(e.target.value);
                  if (errors.novaSenha) {
                    setErrors({ ...errors, novaSenha: '' });
                  }
                }}
                placeholder="Digite a nova senha"
              />
              {errors.novaSenha && (
                <p className="text-sm text-destructive">{errors.novaSenha}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
              <Input
                id="confirmarSenha"
                type="password"
                value={confirmarSenha}
                onChange={(e) => {
                  setConfirmarSenha(e.target.value);
                  if (errors.confirmarSenha) {
                    setErrors({ ...errors, confirmarSenha: '' });
                  }
                }}
                placeholder="Confirme a nova senha"
              />
              {errors.confirmarSenha && (
                <p className="text-sm text-destructive">{errors.confirmarSenha}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSenhaAtual('');
                  setNovaSenha('');
                  setConfirmarSenha('');
                  setErrors({});
                }}
              >
                Limpar
              </Button>
              <Button type="submit" disabled={loadingAtualizar}>
                {loadingAtualizar ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};


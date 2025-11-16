import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { User } from '@/models/User';

interface EditUsuarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: User | null;
  onSave: (usuarioId: number, data: {
    nome?: string;
    email?: string;
    password?: string;
    admin?: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
}

export const EditUsuarioModal = ({
  open,
  onOpenChange,
  usuario,
  onSave,
}: EditUsuarioModalProps) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [admin, setAdmin] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome || '');
      setEmail(usuario.email || '');
      setPassword('');
      setConfirmPassword('');
      setAdmin(usuario.admin || false);
      setFormError('');
    }
  }, [usuario, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    // Validações
    if (!email) {
      setFormError('O email é obrigatório');
      setLoading(false);
      return;
    }

    if (password && password.length > 72) {
      setFormError('A senha não pode ter mais de 72 caracteres');
      setLoading(false);
      return;
    }

    if (password && password !== confirmPassword) {
      setFormError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      const updateData: {
        nome?: string;
        email?: string;
        password?: string;
        admin?: boolean;
      } = {
        nome: nome || undefined,
        email,
        admin,
      };

      // Só inclui senha se foi preenchida
      if (password) {
        updateData.password = password;
      }

      const result = await onSave(usuario!.id, updateData);

      if (result.success) {
        onOpenChange(false);
        // Limpar formulário
        setNome('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setAdmin(false);
      } else {
        setFormError(result.error || 'Erro ao atualizar usuário');
      }
    } catch (err: any) {
      setFormError(err.message || 'Erro ao atualizar usuário');
    } finally {
      setLoading(false);
    }
  };

  if (!usuario) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Atualize as informações do usuário. Deixe a senha em branco para não alterá-la.
          </DialogDescription>
        </DialogHeader>

        <Form onSubmit={handleSubmit}>
          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <FormItem>
              <FormLabel htmlFor="edit-nome">Nome</FormLabel>
              <FormControl>
                <Input
                  id="edit-nome"
                  type="text"
                  placeholder="Nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel htmlFor="edit-username">Username</FormLabel>
              <FormControl>
                <Input
                  id="edit-username"
                  type="text"
                  value={usuario.username}
                  disabled
                  className="bg-gray-100"
                />
              </FormControl>
              <p className="text-xs text-muted-foreground mt-1">
                O username não pode ser alterado.
              </p>
            </FormItem>

            <FormItem>
              <FormLabel htmlFor="edit-email">Email *</FormLabel>
              <FormControl>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel htmlFor="edit-password">Nova Senha</FormLabel>
              <FormControl>
                <Input
                  id="edit-password"
                  type="password"
                  placeholder="Deixe em branco para não alterar"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={72}
                />
              </FormControl>
            </FormItem>

            {password && (
              <FormItem>
                <FormLabel htmlFor="edit-confirm-password">Confirmar Nova Senha</FormLabel>
                <FormControl>
                  <Input
                    id="edit-confirm-password"
                    type="password"
                    placeholder="Confirme a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    maxLength={72}
                  />
                </FormControl>
              </FormItem>
            )}

            <FormItem>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-admin"
                  checked={admin}
                  onChange={(e) => setAdmin(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <FormLabel htmlFor="edit-admin" className="cursor-pointer">
                  Administrador
                </FormLabel>
              </div>
            </FormItem>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};


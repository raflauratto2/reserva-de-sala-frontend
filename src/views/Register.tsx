import { useState } from 'react';
import { useAuth } from '@/controllers/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useToast } from '@/components/ui/toast';
import { Link } from 'react-router-dom';

export const Register = () => {
  const { showToast, ToastContainer } = useToast();
  const [nome, setNome] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { handleRegister, registerLoading } = useAuth();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!nome || !username || !email || !password || !confirmPassword) {
      setFormError('Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('As senhas não coincidem');
      return;
    }

    if (password.length > 72) {
      setFormError('A senha não pode ter mais de 72 caracteres');
      return;
    }

    try {
      await handleRegister({ nome, username, email, password });
      showToast({ message: 'Conta criada com sucesso!', variant: 'success' });
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao criar conta. Verifique os dados informados.';
      setFormError(errorMsg);
      showToast({ message: errorMsg, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema</h1>
        <h2 className="text-xl text-gray-600">Reserva de Salas de Reunião</h2>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Criar Conta</CardTitle>
          <CardDescription>
            Preencha os dados para criar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form onSubmit={onSubmit}>
            {formError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <FormItem>
              <FormLabel htmlFor="nome">Nome</FormLabel>
              <FormControl>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  disabled={registerLoading}
                  required
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel htmlFor="username">Username</FormLabel>
              <FormControl>
                <Input
                  id="username"
                  type="text"
                  placeholder="usuario123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={registerLoading}
                  required
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel htmlFor="email">Email</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={registerLoading}
                  required
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel htmlFor="password">Senha</FormLabel>
              <FormControl>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={registerLoading}
                  required
                  maxLength={72}
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel htmlFor="confirmPassword">Confirmar Senha</FormLabel>
              <FormControl>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={registerLoading}
                  required
                  maxLength={72}
                />
              </FormControl>
            </FormItem>

            <Button type="submit" className="w-full" disabled={registerLoading}>
              {registerLoading ? 'Criando conta...' : 'Criar Conta'}
            </Button>

            <div className="mt-4 text-center text-sm">
              <span className="text-gray-600">Já tem uma conta? </span>
              <Link to="/login" className="text-blue-600 hover:underline">
                Fazer login
              </Link>
            </div>
          </Form>
        </CardContent>
      </Card>
      <ToastContainer />
    </div>
  );
};


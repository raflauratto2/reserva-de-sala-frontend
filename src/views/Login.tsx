import { useState } from 'react';
import { useAuth } from '@/controllers/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useToast } from '@/components/ui/toast';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { handleLogin, loginLoading } = useAuth();
  const { showToast, ToastContainer } = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!username || !password) {
      setFormError('Por favor, preencha todos os campos');
      return;
    }

    try {
      await handleLogin({ username, password });
    } catch (err: any) {
      console.log('Erro capturado no Login:', err);
      console.log('Tipo do erro:', typeof err);
      console.log('Erro completo:', JSON.stringify(err, null, 2));
      
      // Extrai a mensagem de erro de diferentes formatos
      let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';
      
      if (err?.graphQLErrors?.[0]?.message) {
        errorMessage = err.graphQLErrors[0].message;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      console.log('Mensagem de erro extraída:', errorMessage);
      setFormError(errorMessage);
      
      // Sempre mostra toast para erros de login
      const isAuthError = 
        errorMessage.includes('Username ou senha incorretos') || 
        errorMessage.includes('credenciais') ||
        errorMessage.includes('incorretos') ||
        errorMessage.toLowerCase().includes('username') ||
        errorMessage.toLowerCase().includes('password') ||
        errorMessage.toLowerCase().includes('senha incorreta');
      
      const toastMessage = isAuthError 
        ? 'Login falhou. Verifique seu usuário e senha.'
        : errorMessage;
      
      console.log('Exibindo toast com mensagem:', toastMessage);
      console.log('showToast disponível?', typeof showToast);
      
      // Sempre exibe o toast, mesmo que já tenha sido exibido antes
      showToast({
        message: toastMessage,
        variant: 'destructive',
        duration: 4000,
      });
      
      // Log adicional para debug
      console.log('Toast chamado, verificando se foi adicionado...');
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema</h1>
          <h2 className="text-xl text-gray-600">Reserva de Salas de Reunião</h2>
        </div>
        <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o sistema
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
              <FormLabel htmlFor="username">Usuário</FormLabel>
              <FormControl>
                <Input
                  id="username"
                  type="text"
                  placeholder="usuario123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loginLoading}
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
                  disabled={loginLoading}
                  required
                />
              </FormControl>
            </FormItem>

            <Button type="submit" className="w-full" disabled={loginLoading}>
              {loginLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
    </>
  );
};


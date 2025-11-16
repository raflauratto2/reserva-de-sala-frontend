import { useMutation } from '@apollo/client';
import { LOGIN, CRIAR_USUARIO } from '@/graphql/mutations/auth';
import { useAuthStore } from '@/store/auth-store';
import { useNavigate } from 'react-router-dom';
import { LoginInput, CreateUsuarioInput } from '@/models/User';

export const useAuth = () => {
  const navigate = useNavigate();
  const { login, logout, isAuthenticated } = useAuthStore();
  const [loginMutation, { loading: loginLoading, error: loginError }] = useMutation(LOGIN);
  const [criarUsuarioMutation, { loading: registerLoading, error: registerError }] = useMutation(CRIAR_USUARIO);

  const handleLogin = async (input: LoginInput) => {
    try {
      const { data } = await loginMutation({
        variables: {
          loginData: input,
        },
      });

      if (data?.login?.accessToken) {
        login(data.login.accessToken);
        navigate('/reservas');
      }
    } catch (err: any) {
      console.error('Erro ao fazer login:', err);
      console.error('Network error:', err.networkError);
      console.error('GraphQL errors:', err.graphQLErrors);
      
      // Tratamento específico para erro de conexão
      if (err.message?.includes('Failed to fetch') || err.networkError) {
        const networkErr = err.networkError || err;
        let errorMsg = 'Não foi possível conectar ao servidor. ';
        
        if (networkErr.message?.includes('CORS')) {
          errorMsg += 'Erro de CORS: O backend precisa permitir requisições do frontend. Verifique a configuração de CORS no backend.';
        } else if (networkErr.message?.includes('NetworkError')) {
          errorMsg += 'Erro de rede. Verifique se a API está rodando em http://localhost:8000/graphql';
        } else {
          errorMsg += `Verifique se a API está rodando em http://localhost:8000/graphql e se há problemas de CORS. Erro: ${networkErr.message || 'Desconhecido'}`;
        }
        
        throw new Error(errorMsg);
      }
      
      const errorMessage = err.graphQLErrors?.[0]?.message || err.message || 'Erro ao fazer login';
      throw new Error(errorMessage);
    }
  };

  const handleRegister = async (input: CreateUsuarioInput) => {
    try {
      console.log('Tentando criar usuário:', { username: input.username, email: input.email });
      
      const { data, errors } = await criarUsuarioMutation({
        variables: {
          usuario: input,
        },
      });

      console.log('Resposta da mutation:', { data, errors });

      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }

      if (data?.criarUsuario) {
        // Após criar usuário, fazer login automaticamente
        await handleLogin({
          username: input.username,
          password: input.password,
        });
      } else {
        throw new Error('Não foi possível criar a conta. Tente novamente.');
      }
    } catch (err: any) {
      console.error('Erro completo ao criar usuário:', err);
      console.error('Network error:', err.networkError);
      console.error('GraphQL errors:', err.graphQLErrors);
      
      // Tratamento específico para erro de conexão
      if (err.message?.includes('Failed to fetch') || err.networkError) {
        const networkErr = err.networkError || err;
        let errorMsg = 'Não foi possível conectar ao servidor. ';
        
        if (networkErr.message?.includes('CORS')) {
          errorMsg += 'Erro de CORS: O backend precisa permitir requisições do frontend. Verifique a configuração de CORS no backend.';
        } else if (networkErr.message?.includes('NetworkError')) {
          errorMsg += 'Erro de rede. Verifique se a API está rodando em http://localhost:8000/graphql';
        } else {
          errorMsg += `Verifique se a API está rodando em http://localhost:8000/graphql e se há problemas de CORS. Erro: ${networkErr.message || 'Desconhecido'}`;
        }
        
        throw new Error(errorMsg);
      }
      
      const errorMessage = err.graphQLErrors?.[0]?.message || err.message || 'Erro ao criar conta';
      throw new Error(errorMessage);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return {
    handleLogin,
    handleRegister,
    handleLogout,
    loginLoading,
    registerLoading,
    loginError,
    registerError,
    isAuthenticated,
  };
};


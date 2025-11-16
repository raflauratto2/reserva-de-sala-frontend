import { useMutation } from '@apollo/client';
import { LOGIN, CRIAR_USUARIO } from '@/graphql/mutations/auth';
import { MEU_PERFIL } from '@/graphql/queries/auth';
import { useAuthStore } from '@/store/auth-store';
import { useNavigate } from 'react-router-dom';
import { LoginInput, CreateUsuarioInput } from '@/models/User';
import { apolloClient } from '@/lib/apollo-client';

export const useAuth = () => {
  const navigate = useNavigate();
  const { login, logout, setUser, isAuthenticated } = useAuthStore();
  const [loginMutation, { loading: loginLoading, error: loginError }] = useMutation(LOGIN);
  const [criarUsuarioMutation, { loading: registerLoading, error: registerError }] = useMutation(CRIAR_USUARIO);

  // Função auxiliar para buscar perfil do usuário usando Apollo Client
  const fetchUserProfile = async (token: string) => {
    try {
      const { data } = await apolloClient.query({
        query: MEU_PERFIL,
        context: {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        fetchPolicy: 'network-only',
      });

      if (data?.meuPerfil) {
        return data.meuPerfil;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  };

  const handleLogin = async (input: LoginInput) => {
    try {
      const { data, errors } = await loginMutation({
        variables: {
          loginData: input,
        },
      });

      // Verifica se há erros GraphQL na resposta
      if (errors && errors.length > 0) {
        const errorMessage = errors[0].message || 'Erro ao fazer login';
        throw new Error(errorMessage);
      }

      if (data?.login?.accessToken) {
        const token = data.login.accessToken;
        login(token);
        
        // Busca o perfil do usuário após login (não bloqueia o login se falhar)
        try {
          const userProfile = await fetchUserProfile(token);
          if (userProfile) {
            setUser(userProfile);
          }
        } catch (profileError) {
          console.warn('Não foi possível carregar o perfil do usuário, mas o login foi bem-sucedido:', profileError);
          // Não bloqueia o login se a busca do perfil falhar
        }
        
        navigate('/dashboard');
      } else {
        throw new Error('Token de acesso não recebido');
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

  const handleCreateUser = async (input: CreateUsuarioInput) => {
    try {
      const { data, errors } = await criarUsuarioMutation({
        variables: {
          usuario: input,
        },
      });

      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }

      if (!data?.criarUsuario) {
        throw new Error('Não foi possível criar o usuário. Tente novamente.');
      }

      return { success: true, data: data.criarUsuario };
    } catch (err: any) {
      console.error('Erro ao criar usuário:', err);
      const errorMessage = err.graphQLErrors?.[0]?.message || err.message || 'Erro ao criar usuário';
      return { success: false, error: errorMessage };
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return {
    handleLogin,
    handleRegister,
    handleCreateUser,
    handleLogout,
    loginLoading,
    registerLoading,
    loginError,
    registerError,
    isAuthenticated,
  };
};


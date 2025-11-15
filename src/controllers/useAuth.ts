import { useMutation } from '@apollo/client';
import { LOGIN } from '@/graphql/mutations/auth';
import { useAuthStore } from '@/store/auth-store';
import { useNavigate } from 'react-router-dom';
import { LoginInput } from '@/models/User';

export const useAuth = () => {
  const navigate = useNavigate();
  const { login, logout, isAuthenticated, user } = useAuthStore();
  const [loginMutation, { loading, error }] = useMutation(LOGIN);

  const handleLogin = async (input: LoginInput) => {
    try {
      const { data } = await loginMutation({
        variables: input,
      });

      if (data?.login) {
        login(data.login.token, data.login.user);
        navigate('/reservas');
      }
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      throw err;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return {
    handleLogin,
    handleLogout,
    loading,
    error,
    isAuthenticated,
    user,
  };
};


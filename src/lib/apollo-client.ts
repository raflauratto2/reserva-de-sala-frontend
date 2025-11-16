import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const apiUrl = import.meta.env.VITE_GRAPHQL_API_URL || 'http://localhost:8000/graphql';

// Log para debug (remover em produção)
console.log('GraphQL API URL:', apiUrl);

const httpLink = createHttpLink({
  uri: apiUrl,
});

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`[Network error]:`, networkError);
    console.error(`[Network error details]:`, {
      message: networkError.message,
      name: networkError.name,
      statusCode: 'statusCode' in networkError ? networkError.statusCode : 'N/A',
      result: 'result' in networkError ? networkError.result : 'N/A',
    });
    
    // Log da operação que falhou
    if (operation) {
      console.error(`[Failed operation]:`, {
        query: operation.query?.loc?.source?.body || 'N/A',
        variables: operation.variables,
      });
    }
  }
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('auth_token');
  const newHeaders: Record<string, string> = { ...headers };
  
  if (token) {
    newHeaders.authorization = `Bearer ${token}`;
  }
  
  return {
    headers: newHeaders,
  };
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'none', // Erros são lançados como exceções
    },
    query: {
      errorPolicy: 'none',
    },
    mutate: {
      errorPolicy: 'none', // Erros são lançados como exceções
    },
  },
});


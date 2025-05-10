import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// Используем наш API роут вместо прямого обращения к Graph API
const httpLink = new HttpLink({
  uri: '/api/graph-proxy',
  // Добавляем заголовки для предотвращения кэширования
  fetchOptions: {
    cache: 'no-store',
  },
  headers: {
    'Cache-Control': 'no-cache',
  },
});

// Создаем и экспортируем Apollo Client
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  },
});

export default client;

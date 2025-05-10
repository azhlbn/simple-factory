import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const GRAPH_API_URL = process.env.NEXT_PUBLIC_GRAPH_API_URL;
if (!GRAPH_API_URL) {
  // Можно заменить на throw, если нужен жесткий контроль
  console.warn('NEXT_PUBLIC_GRAPH_API_URL is not set in .env.local! Apollo Client will not work correctly.');
}

const httpLink = new HttpLink({
  uri: GRAPH_API_URL,
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

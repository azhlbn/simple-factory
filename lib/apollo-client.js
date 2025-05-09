import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { GRAPH_API_URL } from '../config/totem';

// Создаем HTTP-соединение с The Graph API
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

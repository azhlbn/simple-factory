import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// URL для The Graph API на сети Minato
// Используем только переменную окружения
const GRAPH_API_URL = process.env.NEXT_PUBLIC_GRAPH_API_URL;

// Если вы еще не создали подграф, вы можете сделать это с помощью The Graph Studio:
// 1. Зарегистрируйтесь на https://thegraph.com/studio/
// 2. Создайте новый подграф для сети Minato
// 3. Определите схему GraphQL для индексации событий TotemCreated

const httpLink = new HttpLink({
  uri: GRAPH_API_URL,
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
    query: {
      fetchPolicy: 'network-only',
    },
  },
});

export default client;

import { gql } from '@apollo/client';

// Запрос для получения списка всех тотемов
export const GET_ALL_TOTEMS = gql`
  query GetAllTotems($first: Int!, $skip: Int!) {
    totemCreateds(
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      totemAddr
      totemTokenAddr
      totemId
      blockTimestamp
    }
  }
`;

// Запрос для получения данных конкретного тотема
export const GET_TOTEM_BY_ID = gql`
  query GetTotemById($id: ID!) {
    totemCreated(id: $id) {
      id
      totemAddr
      totemTokenAddr
      totemId
      blockTimestamp
    }
  }
`;

/**
 * @typedef {Object} TotemData
 * @property {string} id
 * @property {string} totemAddr
 * @property {string} totemTokenAddr
 * @property {string} totemId
 * @property {string} blockTimestamp
 * @property {object} [metadata]
 */

// Функция для форматирования URL IPFS
export function formatIpfsUrl(ipfsUrl) {
  if (!ipfsUrl) return '';
  if (ipfsUrl.startsWith('ipfs://')) {
    return `https://gateway.pinata.cloud/ipfs/${ipfsUrl.replace('ipfs://', '')}`;
  }
  return ipfsUrl;
}

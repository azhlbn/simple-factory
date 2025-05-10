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
 * @property {string} id - Уникальный идентификатор тотема
 * @property {string} totemAddr - Адрес контракта тотема
 * @property {string} totemTokenAddr - Адрес токена тотема
 * @property {string} totemId - ID тотема
 * @property {string} blockTimestamp - Временная метка блока
 * @property {Object} [metadata] - Метаданные тотема
 * @property {string} [metadata.name] - Название тотема
 * @property {string} [metadata.description] - Описание тотема
 * @property {string} [metadata.image] - IPFS URL изображения тотема
 * @property {Object} [metadata.social_links] - Социальные ссылки
 * @property {string} [metadata.social_links.twitter] - Ссылка на Twitter
 * @property {string} [metadata.social_links.discord] - Ссылка на Discord
 * @property {string} [metadata.social_links.website] - Ссылка на веб-сайт
 * @property {string[]} [metadata.categories] - Категории тотема
 */

// Функция для форматирования URL IPFS
export function formatIpfsUrl(ipfsUrl) {
  if (!ipfsUrl) return '';
  if (ipfsUrl.startsWith('ipfs://')) {
    return `https://gateway.pinata.cloud/ipfs/${ipfsUrl.replace('ipfs://', '')}`;
  }
  return ipfsUrl;
}

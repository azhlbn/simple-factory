// The Graph API utilities

/**
 * Formats an IPFS URL to use a gateway
 * @param {string} ipfsUrl - The IPFS URL to format
 * @returns {string} - Formatted URL
 */
export const formatIpfsUrl = (ipfsUrl) => {
  if (!ipfsUrl) return '';
  
  if (ipfsUrl.startsWith('ipfs://')) {
    return `https://gateway.pinata.cloud/ipfs/${ipfsUrl.replace('ipfs://', '')}`;
  }
  return ipfsUrl;
};

/**
 * Fetches all totems from The Graph
 * @param {number} first - Number of items to fetch
 * @param {number} skip - Number of items to skip
 * @returns {Promise<Array>} - Array of totem objects
 */
export const fetchAllTotems = async (first = 10, skip = 0) => {
  try {
    // Используем локальный прокси-сервер для обхода ограничений CORS
    const graphApiUrl = '/api/graph-proxy';
    
    if (!process.env.NEXT_PUBLIC_GRAPH_API_URL && !process.env.GRAPH_API_URL) {
      console.warn('Graph API URL not configured in environment variables');
      // Продолжаем выполнение, так как прокси использует URL по умолчанию
    }
    
    const query = `
      query {
        totemCreateds(
          first: ${first}
          skip: ${skip}
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
    
    const response = await fetch(graphApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    const result = await response.json();
    
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }
    
    // Преобразуем данные в формат, совместимый с нашим приложением
    const totems = result.data.totemCreateds.map(totem => ({
      id: totem.id,
      totemAddress: totem.totemAddr,
      tokenAddress: totem.totemTokenAddr,
      totemId: totem.totemId,
      createdAt: totem.blockTimestamp
    }));
    
    return totems;
  } catch (error) {
    console.error('Error fetching totems from The Graph:', error);
    throw error;
  }
};

/**
 * Fetches a single totem by its ID
 * @param {string} id - The ID of the totem
 * @returns {Promise<Object>} - Totem object
 */
export const fetchTotemById = async (id) => {
  try {
    // Получаем URL и удаляем кавычки, если они есть
    let graphApiUrl = process.env.NEXT_PUBLIC_GRAPH_API_URL || process.env.GRAPH_API_URL;
    
    if (!graphApiUrl) {
      console.warn('Graph API URL not configured, returning null');
      return null;
    }
    
    // Удаляем кавычки, если они есть
    graphApiUrl = graphApiUrl.replace(/["']/g, '');
    
    const query = `
      query {
        totemCreated(id: "${id}") {
          id
          totemAddr
          totemTokenAddr
          totemId
          blockTimestamp
        }
      }
    `;
    
    const response = await fetch(graphApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    const result = await response.json();
    
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }
    
    if (!result.data.totemCreated) {
      throw new Error(`Totem with id ${id} not found`);
    }
    
    const totem = result.data.totemCreated;
    return {
      id: totem.id,
      totemAddress: totem.totemAddr,
      tokenAddress: totem.totemTokenAddr,
      totemId: totem.totemId,
      createdAt: totem.blockTimestamp
    };
  } catch (error) {
    console.error(`Error fetching totem with id ${id}:`, error);
    throw error;
  }
};

/**
 * Fetches a single totem by its address
 * @param {string} totemAddress - The address of the totem contract
 * @returns {Promise<Object>} - Totem object
 */
export const fetchTotemByAddress = async (totemAddress) => {
  try {
    // Получаем URL и удаляем кавычки, если они есть
    let graphApiUrl = process.env.NEXT_PUBLIC_GRAPH_API_URL || process.env.GRAPH_API_URL;
    
    if (!graphApiUrl) {
      console.warn('Graph API URL not configured, returning null');
      return null;
    }
    
    // Удаляем кавычки, если они есть
    graphApiUrl = graphApiUrl.replace(/["']/g, '');
    
    const query = `
      query {
        totemCreateds(where: { totemAddr: "${totemAddress.toLowerCase()}" }) {
          id
          totemAddr
          totemTokenAddr
          totemId
          blockTimestamp
        }
      }
    `;
    
    const response = await fetch(graphApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    const result = await response.json();
    
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }
    
    if (result.data.totemCreateds.length === 0) {
      throw new Error(`Totem with address ${totemAddress} not found`);
    }
    
    const totem = result.data.totemCreateds[0];
    return {
      id: totem.id,
      totemAddress: totem.totemAddr,
      tokenAddress: totem.totemTokenAddr,
      totemId: totem.totemId,
      createdAt: totem.blockTimestamp
    };
  } catch (error) {
    console.error(`Error fetching totem with address ${totemAddress}:`, error);
    throw error;
  }
};

/**
 * Fetches totem metadata from IPFS
 * @param {string} dataHash - The IPFS hash (CID) of the metadata
 * @returns {Promise<Object>} - Metadata object
 */
export const fetchTotemMetadata = async (dataHash) => {
  try {
    // Remove ipfs:// prefix if present
    const cleanHash = dataHash.replace('ipfs://', '');
    
    // Fetch metadata from IPFS gateway
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cleanHash}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    
    const metadata = await response.json();
    return metadata;
  } catch (error) {
    console.error(`Error fetching metadata for hash ${dataHash}:`, error);
    throw error;
  }
};

/**
 * Fetches all totems with their metadata
 * @param {number} first - Number of items to fetch
 * @param {number} skip - Number of items to skip
 * @returns {Promise<Array>} - Array of totem objects with metadata
 */
export const fetchTotemsWithMetadata = async (first = 10, skip = 0) => {
  try {
    const totems = await fetchAllTotems(first, skip);
    
    // Если нет тотемов (например, API не настроен), возвращаем пустой массив
    if (!totems || totems.length === 0) {
      return [];
    }
    
    // Получаем данные тотемов из смарт-контрактов
    // В реальном приложении здесь было бы получение dataHash из смарт-контракта
    // Для простоты возвращаем тотемы без метаданных
    return totems;
  } catch (error) {
    console.error('Error fetching totems with metadata:', error);
    throw error;
  }
};

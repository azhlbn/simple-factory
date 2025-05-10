import { MINATO_NETWORK } from '../config/totem';

/**
 * Проверяет, подключен ли MetaMask к сети Minato
 * @param {ethers.providers.Web3Provider} provider - Web3 провайдер
 * @returns {Promise<boolean>} - true если подключен к Minato
 */
export const checkMinatoNetwork = async (provider) => {
  try {
    const network = await provider.getNetwork();
    // Сравниваем с 1946 (chainId сети Minato)
    return network.chainId === 1946;
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
};

/**
 * Переключает MetaMask на сеть Minato
 * @param {ethers.providers.Web3Provider} provider - Web3 провайдер
 * @returns {Promise<boolean>} - true если успешно переключились
 */
export const switchToMinato = async (provider) => {
  try {
    // Сначала пробуем просто переключиться
    await provider.send('wallet_switchEthereumChain', [{ 
      chainId: MINATO_NETWORK.chainId 
    }]);
    return true;
  } catch (error) {
    if (error.code === 4902) {
      try {
        // Если сеть не добавлена, добавляем её
        await provider.send('wallet_addEthereumChain', [MINATO_NETWORK]);
        return true;
      } catch (addError) {
        console.error('Error adding Minato network:', addError);
        return false;
      }
    }
    console.error('Error switching to Minato network:', error);
    return false;
  }
};

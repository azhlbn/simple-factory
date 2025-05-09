import axios from 'axios';

// Функция для загрузки файла в IPFS через Pinata
export async function uploadFileToPinata(file, pinataApiKey, pinataSecretApiKey) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Content-Type': `multipart/form-data;`,
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey,
        },
      }
    );

    return {
      success: true,
      IpfsHash: response.data.IpfsHash,
    };
  } catch (error) {
    console.error('Error uploading file to Pinata:', error);
    return {
      success: false,
      error: 'Failed to upload file to IPFS',
    };
  }
}

// Функция для загрузки JSON метаданных в IPFS через Pinata
export async function uploadJSONToPinata(
  jsonData,
  pinataApiKey,
  pinataSecretApiKey
) {
  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      jsonData,
      {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey,
        },
      }
    );

    return {
      success: true,
      IpfsHash: response.data.IpfsHash,
    };
  } catch (error) {
    console.error('Error uploading JSON to Pinata:', error);
    return {
      success: false,
      error: 'Failed to upload metadata to IPFS',
    };
  }
}
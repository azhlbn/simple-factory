import { uploadJSONToPinata } from '../../../utils/pinata';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const jsonData = req.body;

    // Получаем ключи Pinata из переменных окружения
    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretApiKey = process.env.PINATA_API_SECRET;

    // Загружаем JSON на IPFS через Pinata
    const result = await uploadJSONToPinata(jsonData, pinataApiKey, pinataSecretApiKey);

    if (result.success) {
      res.status(200).json({
        success: true,
        cid: result.IpfsHash,
      });
    } else {
      throw new Error(result.error || 'Failed to upload JSON to IPFS');
    }
  } catch (error) {
    console.error('Error uploading JSON to Pinata:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload JSON to IPFS',
    });
  }
}

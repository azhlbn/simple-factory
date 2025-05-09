// API-роут для проксирования запросов к The Graph API
// Это поможет обойти ограничения CORS

export default async function handler(req, res) {
  // Разрешаем только POST-запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Получаем URL для The Graph API из переменных окружения
    const graphApiUrl = process.env.NEXT_PUBLIC_GRAPH_API_URL || 
      'https://api.studio.thegraph.com/query/101656/mytho-minato/version/latest';

    // Проксируем запрос к The Graph API
    const response = await fetch(graphApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    // Получаем данные ответа
    const data = await response.json();

    // Возвращаем данные клиенту
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Error proxying request to The Graph:', error);
    return res.status(500).json({ error: 'Failed to proxy request to The Graph' });
  }
}

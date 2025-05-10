// API-роут для проксирования запросов к The Graph API
// Это поможет обойти ограничения CORS

export default async function handler(req, res) {
  // Добавляем CORS заголовки
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Обрабатываем OPTIONS запросы
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Разрешаем только POST-запросы для GraphQL
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Получаем URL для The Graph API из переменных окружения
    const graphApiUrl = process.env.NEXT_PUBLIC_GRAPH_API_URL;

    console.log('Proxying request to:', graphApiUrl);
    console.log('Request body:', req.body);

    // Проксируем запрос к The Graph API
    const response = await fetch(graphApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      console.error('Graph API error:', response.status, response.statusText);
      return res.status(response.status).json({ 
        error: `Graph API returned ${response.status}: ${response.statusText}` 
      });
    }

    // Получаем данные ответа
    const data = await response.json();
    console.log('Graph API response:', data);

    if (data.errors) {
      console.error('Graph API returned errors:', data.errors);
      return res.status(400).json(data);
    }

    // Возвращаем данные клиенту
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error proxying request to The Graph:', error);
    return res.status(500).json({ error: 'Failed to proxy request to The Graph' });
  }
}

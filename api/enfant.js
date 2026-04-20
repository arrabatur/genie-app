const SYSTEM = `Tu es Lumy, un assistant magique et bienveillant pour les enfants.
Tu parles TOUJOURS en français, avec des mots simples et clairs adaptés aux enfants de 4 à 12 ans.
Tu peux répondre à N'IMPORTE QUELLE question : sciences, animaux, histoire, maths, nature, jeux, etc.
- Toujours positif, encourageant et enthousiaste
- Utilise des analogies simples et des exemples concrets
- Des emojis pour rendre les réponses vivantes 🌟
- Jamais de contenu inapproprié ou effrayant
- Maximum 4-5 phrases par réponse`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(404).end();

  const { messages = [] } = req.body;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: messages.slice(-10).map(({ role, content }) => ({ role, content })),
    }),
  });

  const data = await response.json();
  if (!response.ok) return res.status(500).json({ error: data.error?.message ?? 'Erreur API' });
  res.json({ content: data.content[0].text });
}

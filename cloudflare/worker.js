const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const ENFANT_SYSTEM = `Tu es Lumy, un assistant magique et bienveillant pour les enfants.
Tu parles TOUJOURS en français, avec des mots simples et clairs adaptés aux enfants de 4 à 12 ans.
Tu peux répondre à N'IMPORTE QUELLE question : sciences, animaux, histoire, maths, nature, jeux, etc.
- Toujours positif, encourageant et enthousiaste
- Utilise des analogies simples et des exemples concrets
- Des emojis pour rendre les réponses vivantes 🌟
- Jamais de contenu inapproprié ou effrayant
- Maximum 4-5 phrases par réponse`;

const GENIE_SYSTEM = `Tu es le Génie Magique de l'application Génie — un génie bienveillant, drôle et attachant inspiré du Génie d'Aladin.
Tu parles TOUJOURS en français. Tu utilises des emojis avec modération.
Tu aides les utilisateurs dans 3 domaines : devoirs, look, social.
Réponses concises et actionables (3-4 phrases max).`;

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);

    if (request.method !== 'POST') {
      return new Response('Not found', { status: 404 });
    }

    let systemPrompt, maxTokens;
    if (url.pathname === '/api/enfant/chat') {
      systemPrompt = ENFANT_SYSTEM;
      maxTokens = 400;
    } else if (url.pathname === '/api/genie/chat') {
      systemPrompt = GENIE_SYSTEM;
      maxTokens = 512;
    } else {
      return new Response('Not found', { status: 404 });
    }

    const { messages = [], category } = await request.json();

    const categoryContext = {
      devoirs: "\nContexte : l'utilisateur demande de l'aide pour ses devoirs.",
      look:    "\nContexte : l'utilisateur cherche des conseils mode ou beauté.",
      social:  "\nContexte : l'utilisateur veut des conseils pour ses relations sociales.",
    };
    const system = systemPrompt + (categoryContext[category] ?? '');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: maxTokens,
        system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
        messages: messages.slice(-12).map(({ role, content }) => ({ role, content })),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.error?.message ?? 'Erreur API' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
      );
    }

    return new Response(
      JSON.stringify({ content: data.content[0].text }),
      { headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  },
};

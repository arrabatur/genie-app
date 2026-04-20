require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const Anthropic = require('@anthropic-ai/sdk');
const { users, posts, conversations, messages } = require('./data/mockData');
const setupSocket = require('./socket');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(cors());
app.use(express.json());

// ── Users ─────────────────────────────────────────────────────────────────────
app.get('/api/users', (_req, res) => res.json(users));
app.get('/api/users/:id', (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// ── Posts ─────────────────────────────────────────────────────────────────────
app.get('/api/posts', (_req, res) => res.json(posts));
app.post('/api/posts', (req, res) => {
  const { userId, imageUrl, caption } = req.body;
  const post = { id: uuidv4(), userId, imageUrl, caption, likes: 0, comments: 0, createdAt: new Date().toISOString() };
  posts.unshift(post);
  res.status(201).json(post);
});
app.post('/api/posts/:id/like', (req, res) => {
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  post.likes += 1;
  res.json(post);
});

// ── Conversations & Messages ──────────────────────────────────────────────────
app.get('/api/conversations/:userId', (req, res) => {
  res.json(conversations.filter((c) => c.participants.includes(req.params.userId)));
});
app.get('/api/messages/:conversationId', (req, res) => {
  res.json(messages[req.params.conversationId] ?? []);
});

// ── Stories ───────────────────────────────────────────────────────────────────
app.get('/api/stories', (_req, res) => {
  const stories = users.slice(1).map((u, i) => ({
    id: `s${i + 1}`, userId: u.id,
    imageUrl: `https://picsum.photos/seed/s${i + 1}/400/700`,
    expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
  }));
  res.json(stories);
});

// ── Génie IA ──────────────────────────────────────────────────────────────────
const GENIE_SYSTEM = `Tu es le Génie Magique de l'application Génie — un génie bienveillant, drôle et attachant inspiré du Génie d'Aladin.
Tu parles TOUJOURS en français. Tu utilises des emojis avec modération.

Tu aides les utilisateurs dans 3 domaines :
1. 📚 Devoirs : aide aux devoirs, explications claires, révisions, méthodes d'apprentissage
2. ✨ Look : conseils mode, beauté, style vestimentaire adaptés aux tendances actuelles
3. 👥 Social : conseils pour faire des amis, gérer les conflits, s'intégrer, développer sa confiance

Ton style :
- Chaleureux, encourageant, jamais condescendant
- Parfois une petite référence à Aladin ("Je t'accorde ce souhait !", "Par ma lampe magique !")
- Réponses concises et actionables (3-4 phrases max sauf si plus de détail est demandé)
- Tu ne juges jamais l'utilisateur
- Tu adaptes ton niveau de langage à celui de l'utilisateur`;

const CATEGORY_CONTEXT = {
  devoirs: "\nContexte : l'utilisateur demande de l'aide pour ses devoirs ou son apprentissage.",
  look:    "\nContexte : l'utilisateur cherche des conseils mode, beauté ou style.",
  social:  "\nContexte : l'utilisateur veut des conseils pour ses relations sociales.",
};

app.post('/api/genie/chat', async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'Clé API non configurée. Ajoute ANTHROPIC_API_KEY dans le .env du serveur.' });
  }

  const { messages: history = [], category } = req.body;

  try {
    const systemText = GENIE_SYSTEM + (CATEGORY_CONTEXT[category] ?? '');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: [{ type: 'text', text: systemText, cache_control: { type: 'ephemeral' } }],
      messages: history.slice(-12).map(({ role, content }) => ({ role, content })),
    });

    res.json({ content: response.content[0].text });
  } catch (err) {
    console.error('Genie error:', err.message);
    res.status(500).json({ error: "Le génie est indisponible pour l'instant 🌙 Réessaie dans un instant." });
  }
});

// ── Grandir ───────────────────────────────────────────────────────────────────
app.post('/api/grandir', async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: 'Clé API manquante.' });
  const { level = 1 } = req.body;
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: `Génère une question de culture générale de niveau ${level}/5 en français. Réponds uniquement avec un objet JSON valide, sans markdown, sans explication, sans texte avant ou après. Format : {"question":"...","choices":["A","B","C","D"],"correct":0,"explanation":"..."} où correct est l'index (0-3) de la bonne réponse.`
        },
        {
          role: 'assistant',
          content: '{'
        }
      ]
    });
    const raw = '{' + response.content[0].text;
    const json = JSON.parse(raw);
    res.json(json);
  } catch (err) {
    console.error('Grandir error:', err.message);
    res.status(500).json({ error: 'Erreur lors de la génération.' });
  }
});

// ── Chat libre ────────────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'Clé API non configurée.' });
  }
  const { messages: history = [] } = req.body;
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: history.slice(-20).map(({ role, content }) => ({ role, content })),
    });
    res.json({ content: response.content[0].text });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: "Je suis indisponible pour l'instant ✨" });
  }
});

// ── Enfant IA ─────────────────────────────────────────────────────────────────
const ENFANT_SYSTEM = `Tu es Lumy, un assistant magique et bienveillant pour les enfants.
Tu parles TOUJOURS en français, avec des mots simples et clairs adaptés aux enfants de 4 à 12 ans.
Tu peux répondre à N'IMPORTE QUELLE question : sciences, animaux, histoire, maths, nature, jeux, etc.

Ton style :
- Toujours positif, encourageant et enthousiaste
- Utilise des analogies simples et des exemples concrets
- Des emojis pour rendre les réponses vivantes 🌟
- Jamais de contenu inapproprié ou effrayant
- Si une question est trop complexe, simplifie-la avec une belle métaphore
- Termine souvent par une question ou un fait amusant pour susciter la curiosité
- Maximum 4-5 phrases par réponse pour ne pas surcharger`;

app.post('/api/enfant/chat', async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'Clé API non configurée.' });
  }

  const { messages: history = [] } = req.body;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: [{ type: 'text', text: ENFANT_SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: history.slice(-10).map(({ role, content }) => ({ role, content })),
    });

    res.json({ content: response.content[0].text });
  } catch (err) {
    console.error('Enfant error:', err.message);
    res.status(500).json({ error: "Oups, je suis un peu fatigué 😴 Réessaie dans un instant !" });
  }
});

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

setupSocket(io);

const PORT = process.env.PORT ?? 3001;
server.listen(PORT, () => {
  console.log(`\n🧞 Génie Server — http://localhost:${PORT}`);
  console.log(`   Clé Anthropic : ${process.env.ANTHROPIC_API_KEY ? '✅ configurée' : '⚠️  manquante (ajouter dans .env)'}\n`);
});

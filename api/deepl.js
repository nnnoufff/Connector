// Vercel serverless function: forwards translation requests to DeepL with the key kept on the server.
// The app calls /deepl/v2/translate (see vercel.json), exactly like the dev proxy in vite.config.js.
// Set DEEPL_API_KEY in the Vercel project settings (Settings > Environment Variables).
const MAX_CHARS = 1500

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'POST only' })
  const key = process.env.DEEPL_API_KEY
  // 403 tells the app that DeepL is not configured, so it falls back to the other translators.
  if (!key) return res.status(403).json({ message: 'DeepL is not configured' })

  // Only this site may spend the DeepL quota.
  const origin = req.headers.origin
  if (origin && new URL(origin).host !== req.headers.host) return res.status(403).json({ message: 'forbidden origin' })

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  const text = Array.isArray(body.text) ? body.text.map(String) : []
  if (!text.length || text.join('').length > MAX_CHARS || !body.target_lang) return res.status(400).json({ message: 'bad request' })

  const payload = { text, target_lang: String(body.target_lang) }
  if (body.source_lang) payload.source_lang = String(body.source_lang)

  const base = key.endsWith(':fx') ? 'https://api-free.deepl.com' : 'https://api.deepl.com'
  try {
    const r = await fetch(`${base}/v2/translate`, {
      method: 'POST',
      headers: { Authorization: `DeepL-Auth-Key ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    res.status(r.status).setHeader('Content-Type', 'application/json').send(await r.text())
  } catch {
    res.status(502).json({ message: 'DeepL unreachable' })
  }
}

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).send('No URL');

  try {
    let targetUrl = decodeURIComponent(url);
    if (!targetUrl.includes('.') || targetUrl.includes(' ')) {
      targetUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(targetUrl)}`;
    } else if (!targetUrl.startsWith('http')) {
      targetUrl = 'https://' + targetUrl;
    }

    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 M-Core/2.0' }
    });

    let html = await response.text();

    // نشيل حماية DuckDuckGo
    html = html.replace(/X-Frame-Options/gi, 'X-MCore-Options');
    html = html.replace(/frame-ancestors/gi, 'mcore-ancestors');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(html);

  } catch (error) {
    res.status(500).send(`<h1>Error: ${error.message}</h1>`);
  }
}

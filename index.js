export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).send('M-Core Server: No URL provided');
  }

  try {
    let targetUrl = url;

    // لو اللي جاي مش رابط، اعمل بحث في DuckDuckGo
    if (!url.includes('.') || url.includes(' ')) {
      const searchQuery = encodeURIComponent(url);
      targetUrl = `https://html.duckduckgo.com/html/?q=${searchQuery}`;
    } else if (!url.startsWith('http')) {
      targetUrl = 'https://' + url;
    }

    // هات الصفحة
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 M-Core/2.0'
      }
    });
    
    let html = await response.text();

    // صلح الروابط عشان تشتغل من السيرفر بتاعك
    const baseUrl = new URL(targetUrl).origin;
    html = html.replace(/href="\//g, `href="${baseUrl}/`);
    html = html.replace(/src="\//g, `src="${baseUrl}/`);
    
    // احقن كود M-Core في الصفحة
    const mCoreScript = `
      <script>
        // امنع فتح تبويبات جديدة
        window.open = function(url) { location.href = url; };
        
        // صلح كل الروابط تفتح من السيرفر
        document.addEventListener('click', function(e) {
          if (e.target.tagName === 'A' && e.target.href) {
            e.preventDefault();
            const newUrl = '${req.headers.host}/api/browse?url=' + encodeURIComponent(e.target.href);
            location.href = newUrl;
          }
        });
      </script>
    `;
    
    html = html.replace('</body>', mCoreScript + '</body>');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(html);

  } catch (error) {
    res.status(500).send(`
      <html dir="rtl">
        <body style="background:#000;color:#fff;text-align:center;padding:50px;font-family:Tahoma">
          <h1 style="color:#da3633">😢 M-Core Error</h1>
          <p>فشل تحميل: ${url}</p>
          <p style="opacity:0.6;font-size:14px">${error.message}</p>
        </body>
      </html>
    `);
  }
}

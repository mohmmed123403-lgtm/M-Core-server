export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).send('No URL');

  try {
    let targetUrl = decodeURIComponent(url);
    
    // لو ده بحث مش رابط
    if (!targetUrl.includes('.') || targetUrl.includes(' ')) {
      targetUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(targetUrl)}`;
    } else if (!targetUrl.startsWith('http')) {
      targetUrl = 'https://' + targetUrl;
    }

    const response = await fetch(targetUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 M-Core/2.0',
        'Accept-Language': 'ar,en;q=0.9'
      }
    });
    
    let html = await response.text();
    
    // احذف حماية DuckDuckGo اللي بتمنع الـ iframe
    html = html.replace(/X-Frame-Options/gi, 'X-MCore-Options');
    html = html.replace(/frame-ancestors/gi, 'mcore-ancestors');
    
    // صلح الروابط عشان تفتح من السيرفر بتاعك
    const baseUrl = new URL(targetUrl).origin;
    const currentHost = 'https://' + req.headers.host + '/api/browse?url=';
    
    html = html.replace(/href="\//g, `href="${currentHost}${baseUrl}/`);
    html = html.replace(/href="http/g, `href="${currentHost}http`);
    html = html.replace(/action="\//g, `action="${currentHost}${baseUrl}/`);
    
    // احقن كود يمنع فتح تبويبات جديدة
    const mCoreScript = `
      <base target="_self">
      <script>
        window.open = function(url) { location.href = '${currentHost}' + encodeURIComponent(url); };
        document.addEventListener('click', function(e) {
          if (e.target.tagName === 'A' && e.target.href && !e.target.href.startsWith('${currentHost}')) {
            e.preventDefault();
            location.href = '${currentHost}' + encodeURIComponent(e.target.href);
          }
        });
      </script>
    `;
    
    html = html.replace('</head>', mCoreScript + '</head>');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(html);

  } catch (error) {
    res.status(500).send(`
      <html dir="rtl"><body style="background:#000;color:#fff;text-align:center;padding:50px;font-family:Tahoma">
        <h1 style="color:#da3633">😢 M-Core Error</h1>
        <p>فشل تحميل: ${url}</p>
        <p style="opacity:0.6">${error.message}</p>
      </body></html>
    `);
  }
}

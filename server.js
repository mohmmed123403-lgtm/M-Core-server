const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const app = express();
app.use(cors());
app.use('/browse', (req, res, next) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('اكتب?url=الموقع');
    createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        onProxyRes: function (proxyRes) {
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['content-security-policy'];
        }
    })(req, res, next);
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`M-Core Proxy شغال 👑`));
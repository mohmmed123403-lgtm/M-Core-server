const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/browse', (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('URL is required');
  
  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    followRedirects: true,
    selfHandleResponse: false,
    onProxyReq: (proxyReq) => {
      proxyReq.setHeader('User-Agent', 'Mozilla/5.0');
    }
  })(req, res);
});

app.get('/', (req, res) => {
  res.send('M-Core Server is running');
});

module.exports = app;

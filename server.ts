import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// AI Studio dev server runs on port 3000
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Server API Routes for Central Integration & Persistence
const DATA_FILE = path.join(__dirname, 'server-db.json');

function readServerData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch (e) {
      console.error('Error reading server-db.json', e);
    }
  }
  return null;
}

function writeServerData(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing server-db.json', e);
  }
}

// Health check & Server Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    paroki: 'Paroki Santa Theresia Sedayu',
    keuskupan: 'Keuskupan Agung Semarang (KAS)',
    system: 'SIM Inventarisasi PGPM PDP3 2020',
    timestamp: new Date().toISOString(),
  });
});

// Sync endpoint for central synchronization
app.post('/api/sync', (req, res) => {
  const { assets, loans, maintenance, auditLogs, parokiCode } = req.body;
  if (assets) {
    writeServerData({
      parokiCode: parokiCode || 'PRK-KAS-047-SEDAYU',
      lastSync: new Date().toISOString(),
      assets,
      loans,
      maintenance,
      auditLogs,
    });
  }
  res.json({
    success: true,
    message: 'Data inventaris berhasil disinkronisasi ke server pusat',
    serverTimestamp: new Date().toISOString(),
    totalSynced: assets ? assets.length : 0,
  });
});

app.get('/api/data', (req, res) => {
  const data = readServerData();
  if (data) {
    res.json(data);
  } else {
    res.json({ status: 'no_server_data' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Mount Vite middlewares in development (HMR disabled in AI Studio)
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback to index.html for SPA routes in development
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        if (vite) {
          vite.ssrFixStacktrace(e);
        }
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server PGPM Sedayu listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

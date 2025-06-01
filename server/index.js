const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Simulasi data pekerja & status APD
let logs = [];

app.get('/api/status', (req, res) => {
  // Dummy pekerja
  res.json({
    name: "Budi Santoso",
    apd: "tidak lengkap",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    time: new Date().toLocaleString()
  });
});

app.post('/api/log', (req, res) => {
  const log = req.body;
  logs.unshift(log);
  if (logs.length > 10) logs.pop();
  res.json({ success: true });
});

app.get('/api/logs', (req, res) => {
  res.json(logs);
});

// Statistik harian/real-time
app.get('/api/summary', (req, res) => {
  res.json({
    date: new Date().toLocaleDateString(),
    violations: {
      total: 12,
      apd: { total: 8, helm: 4, google: 2, wearpack: 1, shoes: 1 },
      speed: { green: 2, yellow: 1, red: 1 }
    },
    entry: { total: 120, rejected: 5 },
    cctv_snapshots: 10
  });
});

// Status kamera (dummy)
app.get('/api/cameras', (req, res) => {
  res.json([
    { id: 'cam1', name: 'APD Gate 1', type: 'APD', status: 'online' },
    { id: 'cam2', name: 'APD Gate 2', type: 'APD', status: 'offline' },
    { id: 'cam3', name: 'Speed Point 1', type: 'Speed', status: 'online' },
    { id: 'cam4', name: 'Speed Point 2', type: 'Speed', status: 'online' },
    { id: 'cam5', name: 'Speed Point 3', type: 'Speed', status: 'offline' },
    { id: 'cam6', name: 'Speed Point 4', type: 'Speed', status: 'online' },
  ]);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

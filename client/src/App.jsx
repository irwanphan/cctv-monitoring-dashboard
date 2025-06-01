import React, { useEffect, useState, useRef } from "react";
import { Button, Card, Table, Tag, message, Statistic, Row, Col } from "antd";
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:3001/api" });

function CameraStatusPanel() {
  const [cameras, setCameras] = useState([]);

  // Data dummy kamera
  const dummyCameras = [
    { id: 'cam1', name: 'APD Gate 1', type: 'APD', status: 'online' },
    { id: 'cam2', name: 'APD Gate 2', type: 'APD', status: 'offline' },
    { id: 'cam3', name: 'Speed Point 1', type: 'Speed', status: 'online' },
    { id: 'cam4', name: 'Speed Point 2', type: 'Speed', status: 'online' },
    { id: 'cam5', name: 'Speed Point 3', type: 'Speed', status: 'offline' },
    { id: 'cam6', name: 'Speed Point 4', type: 'Speed', status: 'online' },
  ];

  useEffect(() => {
    // Coba fetch dari backend, jika gagal atau kosong, pakai dummy
    api.get("/cameras")
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setCameras(res.data);
        } else {
          setCameras(dummyCameras);
        }
      })
      .catch(() => setCameras(dummyCameras));
  }, []);

  return (
    <Card title="Status Kamera" style={{ marginBottom: 24 }}>
      <Row gutter={16}>
        {cameras.map(cam => (
          <Col span={4} key={cam.id}>
            <Card size="small">
              <b>{cam.name}</b>
              <div>
                <Tag color={cam.status === "online" ? "green" : "red"}>
                  {cam.status.toUpperCase()}
                </Tag>
              </div>
              <div style={{ fontSize: 12 }}>{cam.type === "APD" ? "APD" : "Speed"}</div>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
}

function App() {
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [notif, setNotif] = useState(false);
  const audioRef = useRef();
  const [summary, setSummary] = useState(null);

  const snapshotImages = [
    "https://images.pexels.com/photos/9957864/pexels-photo-9957864.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/11666974/pexels-photo-11666974.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/11666818/pexels-photo-11666818.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/32355466/pexels-photo-32355466/free-photo-of-charming-european-alleyway-framed-by-open-gate.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/32305004/pexels-photo-32305004/free-photo-of-rustic-industrial-workshop-interior-with-tools.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  ];

  useEffect(() => {
    fetchStatus();
    fetchLogs();
    fetchSummary();
  }, []);

  const fetchStatus = async () => {
    const { data } = await api.get("/status");
    setStatus(data);
  };

  const fetchLogs = async () => {
    const { data } = await api.get("/logs");
    setLogs(data);
  };

  const fetchSummary = async () => {
    const { data } = await api.get("/summary");
    setSummary(data);
  };

  const triggerViolation = async () => {
    setNotif(true);
    audioRef.current.play();
    // Pilih snapshot random untuk simulasi snapshot kamera AI
    const randomSnapshot = snapshotImages[Math.floor(Math.random() * snapshotImages.length)];
    const logWithSnapshot = {
      ...status,
      cctv_image: randomSnapshot
    };
    await api.post("/log", logWithSnapshot);
    fetchLogs();
    message.error("APD Tidak Lengkap!");
  };

  const resetNotif = () => {
    setNotif(false);
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto" }}>
      <CameraStatusPanel />
      {summary && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={4}>
            <Card><Statistic title="Total Pelanggaran" value={summary.violations.total} /></Card>
          </Col>
          <Col span={4}>
            <Card><Statistic title="Pelanggaran APD" value={summary.violations.apd.total} />
              <div style={{ fontSize: 12 }}>
                Helm: {summary.violations.apd.helm}<br />
                Google: {summary.violations.apd.google}<br />
                Wearpack: {summary.violations.apd.wearpack}<br />
                Shoes: {summary.violations.apd.shoes}
              </div>
            </Card>
          </Col>
          <Col span={4}>
            <Card><Statistic title="Pelanggaran Speed" value={summary.violations.speed.green + summary.violations.speed.yellow + summary.violations.speed.red} />
              <div style={{ fontSize: 12 }}>
                Green: {summary.violations.speed.green}<br />
                Yellow: {summary.violations.speed.yellow}<br />
                Red: {summary.violations.speed.red}
              </div>
            </Card>
          </Col>
          <Col span={4}>
            <Card><Statistic title="Personel Masuk" value={summary.entry.total} />
              <div style={{ fontSize: 12 }}>Ditolak: {summary.entry.rejected}</div>
            </Card>
          </Col>
          <Col span={4}>
            <Card><Statistic title="Snapshot CCTV" value={summary.cctv_snapshots} /></Card>
          </Col>
        </Row>
      )}
      <Card title="Dashboard Monitoring APD Gate Pass" bordered>
        {status && (
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img src={status.photo} alt="Pekerja" width={80} style={{ borderRadius: 8 }} />
            <div>
              <div>Nama: <b>{status.name}</b></div>
              <div>
                Status APD:{" "}
                <Tag color={status.apd === "lengkap" ? "green" : "red"}>
                  {status.apd.toUpperCase()}
                </Tag>
              </div>
              <div>Waktu: {status.time}</div>
            </div>
          </div>
        )}
        <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
          <Button type="primary" danger onClick={triggerViolation}>
            Trigger Pelanggaran
          </Button>
          <Button onClick={resetNotif}>Reset Notifikasi</Button>
        </div>
        {notif && (
          <div style={{ marginTop: 16, color: "red", fontWeight: "bold" }}>
            🚨 APD Tidak Lengkap! 🚨
          </div>
        )}
        <audio ref={audioRef} src="/alert.mp3" />
      </Card>
      <Card title="Log Pelanggaran" style={{ marginTop: 24 }}>
        <Table
          dataSource={logs}
          rowKey="time"
          columns={[
            { title: "Waktu", dataIndex: "time" },
            { title: "Nama", dataIndex: "name" },
            { title: "Status APD", dataIndex: "apd" },
            {
              title: "Snapshot",
              dataIndex: "cctv_image",
              render: (url) => url ? <img src={url} alt="snapshot" width={40} /> : "-",
            },
            {
              title: "Foto",
              dataIndex: "photo",
              render: (url) => <img src={url} alt="foto" width={40} />,
            },
          ]}
          pagination={false}
        />
      </Card>
    </div>
  );
}

export default App;
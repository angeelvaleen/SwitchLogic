import { useState, useEffect } from "react";

const C = {
  bg: "#050c18",
  surface: "#0b1628",
  surface2: "#101f36",
  surface3: "#162540",
  border: "#1a3356",
  borderHover: "#2a5080",
  cyan: "#00d4ff",
  green: "#00e87a",
  red: "#ff4455",
  yellow: "#ffb830",
  blue: "#4488ff",
  purple: "#9966ff",
  text: "#d8e8f5",
  muted: "#5a7a9a",
  dim: "#2a4560",
};

const BRANDS = [
  "Cisco",
  "Netgear",
  "TP-Link",
  "Ubiquiti (UniFi)",
  "Aruba",
  "D-Link",
  "QNAP",
  "Linksys",
  "Planet",
  "TRENDnet",
  "Zyxel",
  "Tenda",
  "Extreme Networks",
  "GrandStream",
  "Dell",
  "HP",
  "Juniper",
  "MikroTik",
  "Huawei",
  "Ruijie",
  "3Com",
];

const PST = {
  connected: {
    label: "Conectado",
    dot: C.green,
    bg: "rgba(0,232,122,0.10)",
    bd: "rgba(0,232,122,0.35)",
  },
  disconnected: {
    label: "Desconectado",
    dot: "#1e3a52",
    bg: "rgba(10,20,35,0.4)",
    bd: "rgba(20,50,80,0.3)",
  },
  uplink: {
    label: "Uplink",
    dot: C.cyan,
    bg: "rgba(0,212,255,0.10)",
    bd: "rgba(0,212,255,0.35)",
  },
  error: {
    label: "Error",
    dot: C.red,
    bg: "rgba(255,68,85,0.10)",
    bd: "rgba(255,68,85,0.35)",
  },
  disabled: {
    label: "Deshabilitado",
    dot: "#1a2e44",
    bg: "rgba(8,16,28,0.5)",
    bd: "rgba(15,30,50,0.3)",
  },
};

const SPEEDS = [
  "Auto",
  "10Mbps",
  "100Mbps",
  "1Gbps",
  "2.5Gbps",
  "5Gbps",
  "10Gbps",
  "25Gbps",
  "40Gbps",
  "100Gbps",
];

const USERS = [
  {
    username: "admin",
    password: "admin123",
    role: "admin",
    name: "Administrador",
  },
  {
    username: "tecnico",
    password: "tecnico123",
    role: "viewer",
    name: "Técnico",
  },
];

const genPorts = (n) =>
  Array.from({ length: n }, (_, i) => ({
    port: i + 1,
    device: "",
    mac: "",
    vlan: "1",
    speed: "Auto",
    status: "disconnected",
    notes: "",
  }));

const groupBy = (arr, key) =>
  arr.reduce((g, x) => {
    const k = x[key] || "Sin Grupo";
    g[k] = g[k] || [];
    g[k].push(x);
    return g;
  }, {});

const exportCSV = (sw) => {
  const q = (v) => `"${(v ?? "").toString().replace(/"/g, '""')}"`;
  const rows = [
    ["CONFIGURACIÓN DE SWITCH — " + sw.name],
    [""],
    ["Nombre", sw.name],
    ["Marca", sw.brand],
    ["Modelo", sw.model],
    ["Edificio", sw.building],
    ["Piso/Nivel", sw.floor || ""],
    ["Ubicación", sw.location],
    ["IP del Switch", sw.ip],
    ["Puertos", sw.ports],
    ["N° Serie", sw.serialNumber],
    ["No. Inventario", sw.inventoryNo],
    ["Usuario Web", sw.webUser],
    ["Fecha Config.", sw.configDate],
    ["Estado", sw.status],
    [""],
    ["CONFIGURACIÓN DE PUERTOS"],
    ["Puerto", "Dispositivo", "MAC", "VLAN", "Velocidad", "Estado", "Notas"],
    ...sw.portConfig.map((p) => [
      p.port,
      p.device,
      p.mac,
      p.vlan,
      p.speed,
      PST[p.status]?.label || p.status,
      p.notes,
    ]),
  ];
  const csv = "\uFEFF" + rows.map((r) => r.map(q).join(",")).join("\n");
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    ),
    download: `${sw.name}_config.csv`,
  });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

const SAMPLE_SWITCHES = [
  {
    id: "sw-001",
    name: "X-GrandStream-28-01",
    brand: "GrandStream",
    model: "GWN7813",
    building: "Edificio X",
    floor: "Planta Baja",
    location: "Laboratorio Industrial",
    ip: "192.168.4.249",
    ports: 28,
    serialNumber: "34705XC93D",
    inventoryNo: "703-2026 ITVH",
    webUser: "Administrador",
    webPassword: "admin123",
    configDate: "2026-03-26",
    status: "online",
    portConfig: (() => {
      const p = genPorts(28);
      [
        ["PC-Lab-01", "10", "1Gbps"],
        ["PC-Lab-02", "10", "1Gbps"],
        ["PC-Lab-03", "10", "1Gbps"],
        ["Impresora-HP", "10", "100Mbps"],
        ["AP-WiFi-Lab", "10", "1Gbps"],
        ["PC-Docente", "10", "1Gbps"],
      ].forEach(([d, v, s], i) => {
        p[i].device = d;
        p[i].vlan = v;
        p[i].speed = s;
        p[i].status = "connected";
      });
      p[27] = {
        ...p[27],
        device: "Core-Switch",
        vlan: "1",
        speed: "10Gbps",
        status: "uplink",
        notes: "Uplink principal",
      };
      return p;
    })(),
  },
  {
    id: "sw-002",
    name: "X-Cisco-52-01",
    brand: "Cisco",
    model: "SG350-52P",
    building: "Edificio X",
    floor: "Piso 2",
    location: "Sala de Servidores",
    ip: "192.168.4.250",
    ports: 52,
    serialNumber: "FCW2150L0KT",
    inventoryNo: "704-2026 ITVH",
    webUser: "admin",
    webPassword: "cisco123",
    configDate: "2026-03-26",
    status: "online",
    portConfig: (() => {
      const p = genPorts(52);
      for (let i = 0; i < 10; i++) {
        p[i].device = `Server-${String(i + 1).padStart(2, "0")}`;
        p[i].vlan = "20";
        p[i].speed = "1Gbps";
        p[i].status = "connected";
      }
      p[3].status = "error";
      p[3].notes = "NIC dañada";
      p[50] = {
        ...p[50],
        device: "Core-Router",
        vlan: "1",
        speed: "10Gbps",
        status: "uplink",
        notes: "Uplink WAN",
      };
      p[51] = {
        ...p[51],
        device: "Fibra-Óptica",
        vlan: "1",
        speed: "10Gbps",
        status: "uplink",
        notes: "Enlace ISP",
      };
      return p;
    })(),
  },
];

/* ─── BADGE ─── */
function Badge({ status }) {
  const s = PST[status] || PST.disconnected;
  return (
    <span
      style={{
        background: s.bg,
        border: `1px solid ${s.bd}`,
        color: s.dot,
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "11px",
        fontFamily: "monospace",
        fontWeight: "700",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

/* ─── LOGIN ─── */
function LoginPage({ onLogin }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const go = () => {
    const found = USERS.find((x) => x.username === u && x.password === p);
    if (found) onLogin(found);
    else setErr("Credenciales incorrectas");
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,212,255,0.06) 0%, transparent 60%)",
      }}
    >
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "12px",
          padding: "40px 36px",
          width: "340px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "12px",
              background: "rgba(0,212,255,0.08)",
              border: `1px solid rgba(0,212,255,0.2)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              fontSize: "24px",
            }}
          >
            🌐
          </div>
          <div
            style={{
              color: C.cyan,
              fontSize: "18px",
              fontWeight: "bold",
              letterSpacing: "0.12em",
            }}
          >
            NET CONFIG
          </div>
          <div
            style={{
              color: C.muted,
              fontSize: "11px",
              letterSpacing: "0.1em",
              marginTop: "4px",
            }}
          >
            GESTIÓN DE INFRAESTRUCTURA
          </div>
        </div>
        {[
          ["Usuario", u, setU, "text", "usuario"],
          ["Contraseña", p, setP, show ? "text" : "password", "••••••••"],
        ].map(([lbl, val, set, type, ph], i) => (
          <div key={lbl} style={{ marginBottom: "14px" }}>
            <div
              style={{
                color: C.muted,
                fontSize: "10px",
                letterSpacing: "0.08em",
                marginBottom: "5px",
                textTransform: "uppercase",
              }}
            >
              {lbl}
            </div>
            <div style={{ position: "relative" }}>
              <input
                value={val}
                type={type}
                placeholder={ph}
                onChange={(e) => {
                  set(e.target.value);
                  setErr("");
                }}
                onKeyDown={(e) => e.key === "Enter" && go()}
                style={{
                  width: "100%",
                  background: C.surface2,
                  border: `1px solid ${C.border}`,
                  borderRadius: "7px",
                  padding: `9px ${i === 1 ? "36px" : 12}px 9px 12px`,
                  color: C.text,
                  fontFamily: "monospace",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {i === 1 && (
                <button
                  onClick={() => setShow(!show)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: C.muted,
                    cursor: "pointer",
                    fontSize: "13px",
                    padding: 0,
                  }}
                >
                  {show ? "🙈" : "👁"}
                </button>
              )}
            </div>
          </div>
        ))}
        {err && (
          <div
            style={{
              color: C.red,
              fontSize: "12px",
              marginBottom: "10px",
              padding: "8px 10px",
              background: "rgba(255,68,85,0.08)",
              borderRadius: "5px",
              border: "1px solid rgba(255,68,85,0.2)",
            }}
          >
            {err}
          </div>
        )}
        <button
          onClick={go}
          style={{
            width: "100%",
            marginTop: "6px",
            background: C.cyan,
            color: "#000",
            border: "none",
            borderRadius: "7px",
            padding: "11px",
            fontFamily: "monospace",
            fontSize: "13px",
            fontWeight: "bold",
            cursor: "pointer",
            letterSpacing: "0.08em",
          }}
        >
          INICIAR SESIÓN
        </button>
        <div
          style={{
            marginTop: "20px",
            color: C.dim,
            fontSize: "10px",
            textAlign: "center",
            lineHeight: "1.8",
          }}
        >
          admin / admin123 &nbsp;·&nbsp; tecnico / tecnico123
        </div>
      </div>
    </div>
  );
}

/* ─── SIDEBAR ─── */
function Sidebar({ page, setPage, user, onLogout, detailSw }) {
  const navItems = [
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    ...(page === "detail" && detailSw
      ? [
          {
            id: "detail",
            icon: "◈",
            label:
              detailSw.name.length > 18
                ? detailSw.name.slice(0, 17) + "…"
                : detailSw.name,
          },
        ]
      : []),
  ];
  return (
    <div
      style={{
        width: "210px",
        background: C.surface,
        borderRight: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        flexShrink: 0,
      }}
    >
      <div
        style={{ padding: "18px 14px", borderBottom: `1px solid ${C.border}` }}
      >
        <div
          style={{
            color: C.cyan,
            fontSize: "15px",
            fontWeight: "bold",
            letterSpacing: "0.12em",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "18px" }}>🌐</span> NET CONFIG
        </div>
        <div
          style={{
            color: C.muted,
            fontSize: "9px",
            letterSpacing: "0.1em",
            marginTop: "3px",
          }}
        >
          SISTEMA DE SWITCHES
        </div>
      </div>
      <nav style={{ flex: 1, padding: "10px 8px", overflow: "auto" }}>
        <div
          style={{
            color: C.dim,
            fontSize: "9px",
            letterSpacing: "0.1em",
            padding: "8px 8px 4px",
            textTransform: "uppercase",
          }}
        >
          Navegación
        </div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 10px",
              borderRadius: "6px",
              border: `1px solid ${page === item.id ? "rgba(0,212,255,0.15)" : "transparent"}`,
              background:
                page === item.id ? "rgba(0,212,255,0.07)" : "transparent",
              color: page === item.id ? C.cyan : C.muted,
              cursor: "pointer",
              textAlign: "left",
              fontFamily: "monospace",
              fontSize: "12px",
              marginBottom: "2px",
              transition: "all 0.15s",
              borderLeft:
                page === item.id
                  ? `2px solid ${C.cyan}`
                  : "2px solid transparent",
            }}
          >
            <span style={{ fontSize: "14px", flexShrink: 0 }}>{item.icon}</span>
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </span>
          </button>
        ))}
      </nav>
      <div style={{ padding: "12px 10px", borderTop: `1px solid ${C.border}` }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            padding: "9px 10px",
            background: C.surface2,
            borderRadius: "7px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: "rgba(0,212,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.cyan,
              fontSize: "12px",
              fontWeight: "bold",
              flexShrink: 0,
            }}
          >
            {user.name[0]}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                color: C.text,
                fontSize: "12px",
                fontWeight: "bold",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.name}
            </div>
            <div
              style={{
                color: C.muted,
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {user.role}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            width: "100%",
            background: "rgba(255,68,85,0.07)",
            border: "1px solid rgba(255,68,85,0.18)",
            color: "#ff6677",
            borderRadius: "6px",
            padding: "7px",
            fontFamily: "monospace",
            fontSize: "11px",
            cursor: "pointer",
            letterSpacing: "0.05em",
          }}
        >
          ⬡ Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

/* ─── DASHBOARD ─── */
function DashboardPage({
  switches,
  search,
  setSearch,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  user,
}) {
  const filtered = switches.filter(
    (s) =>
      !search ||
      [s.name, s.brand, s.model, s.ip, s.building, s.location].some((v) =>
        v.toLowerCase().includes(search.toLowerCase()),
      ),
  );
  const buildings = groupBy(filtered, "building");
  const stats = [
    { label: "SWITCHES", value: switches.length, color: C.cyan },
    {
      label: "ONLINE",
      value: switches.filter((s) => s.status === "online").length,
      color: C.green,
    },
    {
      label: "OFFLINE",
      value: switches.filter((s) => s.status !== "online").length,
      color: C.red,
    },
    {
      label: "EDIFICIOS",
      value: Object.keys(groupBy(switches, "building")).length,
      color: C.yellow,
    },
    {
      label: "PUERTOS TOTALES",
      value: switches.reduce((a, s) => a + s.ports, 0),
      color: C.blue,
    },
  ];
  return (
    <div
      style={{ flex: 1, overflow: "auto", background: C.bg, padding: "22px" }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: "12px",
          marginBottom: "22px",
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "8px",
              padding: "16px",
              textAlign: "center",
              transition: "border-color 0.2s",
            }}
          >
            <div
              style={{
                fontSize: "26px",
                fontWeight: "bold",
                color: s.color,
                fontFamily: "monospace",
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: "9px",
                color: C.muted,
                letterSpacing: "0.1em",
                marginTop: "4px",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "7px",
            padding: "8px 12px",
          }}
        >
          <span style={{ color: C.muted, fontSize: "14px" }}>⊙</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar switch, IP, marca, edificio..."
            style={{
              flex: 1,
              background: "none",
              border: "none",
              color: C.text,
              fontFamily: "monospace",
              fontSize: "13px",
              outline: "none",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                background: "none",
                border: "none",
                color: C.muted,
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              ✕
            </button>
          )}
        </div>
        {user.role === "admin" && (
          <button
            onClick={onAdd}
            style={{
              background: C.cyan,
              color: "#000",
              border: "none",
              borderRadius: "7px",
              padding: "8px 16px",
              fontFamily: "monospace",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              letterSpacing: "0.05em",
              whiteSpace: "nowrap",
            }}
          >
            ＋ Agregar Switch
          </button>
        )}
      </div>

      {Object.entries(buildings).map(([building, list]) => (
        <div key={building} style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                color: C.cyan,
                fontFamily: "monospace",
                fontSize: "11px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: "bold",
              }}
            >
              🏛 {building}
            </span>
            <div style={{ flex: 1, height: "1px", background: C.border }} />
            <span
              style={{
                color: C.muted,
                fontSize: "10px",
                fontFamily: "monospace",
              }}
            >
              {list.length} switch{list.length !== 1 ? "es" : ""}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {list.map((sw) => (
              <SwitchCard
                key={sw.id}
                sw={sw}
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={onDelete}
                user={user}
              />
            ))}
          </div>
        </div>
      ))}
      {!filtered.length && (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            color: C.muted,
            fontFamily: "monospace",
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "12px", opacity: 0.4 }}>
            ⊘
          </div>
          No se encontraron switches
        </div>
      )}
    </div>
  );
}

/* ─── SWITCH CARD ─── */
function SwitchCard({ sw, onSelect, onEdit, onDelete, user }) {
  const [hov, setHov] = useState(false);
  const connected = sw.portConfig.filter(
    (p) => p.status === "connected",
  ).length;
  const uplinks = sw.portConfig.filter((p) => p.status === "uplink").length;
  const errors = sw.portConfig.filter((p) => p.status === "error").length;
  return (
    <div
      onClick={() => onSelect(sw)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? C.surface2 : C.surface,
        border: `1px solid ${hov ? C.borderHover : C.border}`,
        borderRadius: "8px",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        cursor: "pointer",
        transition: "all 0.18s",
      }}
    >
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "8px",
          background: "rgba(0,212,255,0.07)",
          border: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: "20px",
        }}
      >
        ⬡
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "3px",
          }}
        >
          <span
            style={{
              color: C.cyan,
              fontFamily: "monospace",
              fontSize: "13px",
              fontWeight: "bold",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {sw.name}
          </span>
          <span
            style={{
              flexShrink: 0,
              background:
                sw.status === "online"
                  ? "rgba(0,232,122,0.1)"
                  : "rgba(255,68,85,0.1)",
              color: sw.status === "online" ? C.green : C.red,
              border: `1px solid ${sw.status === "online" ? "rgba(0,232,122,0.3)" : "rgba(255,68,85,0.3)"}`,
              padding: "1px 7px",
              borderRadius: "3px",
              fontSize: "10px",
              fontFamily: "monospace",
              fontWeight: "bold",
            }}
          >
            ● {sw.status.toUpperCase()}
          </span>
        </div>
        <div
          style={{
            color: C.muted,
            fontSize: "11px",
            fontFamily: "monospace",
            marginBottom: "4px",
          }}
        >
          {sw.brand} {sw.model} · {sw.ip} · {sw.floor || sw.location}
        </div>
        <div style={{ display: "flex", gap: "14px" }}>
          <span
            style={{
              color: C.green,
              fontSize: "10px",
              fontFamily: "monospace",
            }}
          >
            ▲ {connected} online
          </span>
          {uplinks > 0 && (
            <span
              style={{
                color: C.cyan,
                fontSize: "10px",
                fontFamily: "monospace",
              }}
            >
              ↑ {uplinks} uplink
            </span>
          )}
          {errors > 0 && (
            <span
              style={{
                color: C.red,
                fontSize: "10px",
                fontFamily: "monospace",
              }}
            >
              ⚠ {errors} error
            </span>
          )}
          <span
            style={{
              color: C.muted,
              fontSize: "10px",
              fontFamily: "monospace",
            }}
          >
            {sw.ports}p · inv:{sw.inventoryNo}
          </span>
        </div>
      </div>
      {/* Mini port preview */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "2px",
          width: "80px",
          alignContent: "flex-start",
          flexShrink: 0,
        }}
      >
        {sw.portConfig.slice(0, 20).map((p) => (
          <div
            key={p.port}
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "1px",
              background: PST[p.status]?.dot || "#222",
              boxShadow:
                p.status === "connected"
                  ? `0 0 3px ${C.green}40`
                  : p.status === "uplink"
                    ? `0 0 3px ${C.cyan}40`
                    : p.status === "error"
                      ? `0 0 3px ${C.red}40`
                      : "none",
            }}
          />
        ))}
      </div>
      {user.role === "admin" && (
        <div
          style={{ display: "flex", gap: "5px", flexShrink: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(sw)}
            style={{
              background: "rgba(0,212,255,0.08)",
              border: "1px solid rgba(0,212,255,0.2)",
              color: C.cyan,
              borderRadius: "4px",
              padding: "4px 9px",
              cursor: "pointer",
              fontFamily: "monospace",
              fontSize: "10px",
              fontWeight: "bold",
            }}
          >
            EDITAR
          </button>
          <button
            onClick={() => {
              if (window.confirm(`¿Eliminar ${sw.name}?`)) onDelete(sw.id);
            }}
            style={{
              background: "rgba(255,68,85,0.08)",
              border: "1px solid rgba(255,68,85,0.2)",
              color: C.red,
              borderRadius: "4px",
              padding: "4px 9px",
              cursor: "pointer",
              fontFamily: "monospace",
              fontSize: "10px",
              fontWeight: "bold",
            }}
          >
            ✕
          </button>
        </div>
      )}
      <span style={{ color: C.dim, fontSize: "16px", flexShrink: 0 }}>›</span>
    </div>
  );
}

/* ─── SWITCH VISUAL PANEL ─── */
function SwitchPanel({ sw, ports, onPortClick }) {
  const [hov, setHov] = useState(null);
  const half = Math.ceil(ports.length / 2);
  const rows = [ports.slice(0, half), ports.slice(half)];
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        padding: "18px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <span
          style={{
            color: C.muted,
            fontSize: "10px",
            letterSpacing: "0.1em",
            fontFamily: "monospace",
          }}
        >
          PANEL DE PUERTOS — {sw.brand} {sw.model}
        </span>
        <div style={{ display: "flex", gap: "12px" }}>
          {Object.entries(PST).map(([k, v]) => (
            <span
              key={k}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                color: C.muted,
                fontSize: "9px",
                fontFamily: "monospace",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "1px",
                  background: v.dot,
                  display: "inline-block",
                }}
              />
              {v.label}
            </span>
          ))}
        </div>
      </div>
      {/* Switch chassis */}
      <div
        style={{
          background: "#050e1c",
          border: "2px solid #0f2035",
          borderRadius: "8px",
          padding: "12px 16px",
          boxShadow:
            "inset 0 2px 8px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <span
            style={{
              color: C.cyan,
              fontFamily: "monospace",
              fontSize: "10px",
              fontWeight: "bold",
              letterSpacing: "0.15em",
            }}
          >
            {sw.brand.toUpperCase()} {sw.model}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                color: C.muted,
                fontFamily: "monospace",
                fontSize: "9px",
              }}
            >
              {sw.ip}
            </span>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: sw.status === "online" ? C.green : C.red,
                boxShadow: `0 0 6px ${sw.status === "online" ? C.green : C.red}`,
              }}
            />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {rows.map((row, ri) => (
            <div
              key={ri}
              style={{ display: "flex", gap: "2px", flexWrap: "wrap" }}
            >
              {row.map((p) => {
                const s = PST[p.status] || PST.disconnected;
                const isH = hov?.port === p.port;
                return (
                  <div
                    key={p.port}
                    onMouseEnter={() => setHov(p)}
                    onMouseLeave={() => setHov(null)}
                    onClick={() => onPortClick && onPortClick(p)}
                    title={`P${p.port}${p.device ? " – " + p.device : ""}`}
                    style={{
                      width: "22px",
                      height: "34px",
                      borderRadius: "3px",
                      background: isH ? "#0d2240" : "#060f1c",
                      border: `1px solid ${isH ? s.bd : "#0f2035"}`,
                      cursor: onPortClick ? "pointer" : "default",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "3px 2px",
                      transition: "all 0.12s",
                      boxShadow: isH ? `0 0 8px ${s.dot}30` : "none",
                    }}
                  >
                    <span
                      style={{
                        color: "#1a3558",
                        fontSize: "6px",
                        lineHeight: 1,
                        fontFamily: "monospace",
                      }}
                    >
                      {p.port}
                    </span>
                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "1px",
                        background: s.dot,
                        boxShadow:
                          p.status !== "disconnected" && p.status !== "disabled"
                            ? `0 0 4px ${s.dot}`
                            : "none",
                      }}
                    />
                    <div
                      style={{
                        width: "7px",
                        height: "3px",
                        borderRadius: "1px",
                        background: "#0a1e32",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {/* Tooltip */}
      {hov && (
        <div
          style={{
            marginTop: "10px",
            background: C.surface2,
            border: `1px solid ${C.border}`,
            borderRadius: "6px",
            padding: "9px 14px",
            fontFamily: "monospace",
            fontSize: "11px",
            display: "flex",
            flexWrap: "wrap",
            gap: "14px",
          }}
        >
          <span>
            <span style={{ color: C.muted }}>Puerto: </span>
            <span style={{ color: C.cyan, fontWeight: "bold" }}>
              {hov.port}
            </span>
          </span>
          <span>
            <span style={{ color: C.muted }}>Dispositivo: </span>
            <span style={{ color: C.text }}>{hov.device || "—"}</span>
          </span>
          <span>
            <span style={{ color: C.muted }}>VLAN: </span>
            <span style={{ color: C.text }}>{hov.vlan || "—"}</span>
          </span>
          <span>
            <span style={{ color: C.muted }}>Velocidad: </span>
            <span style={{ color: C.text }}>{hov.speed || "—"}</span>
          </span>
          <span>
            <span style={{ color: C.muted }}>Estado: </span>
            <Badge status={hov.status} />
          </span>
          {hov.notes && (
            <span>
              <span style={{ color: C.muted }}>Notas: </span>
              <span style={{ color: C.text }}>{hov.notes}</span>
            </span>
          )}
          {hov.mac && (
            <span>
              <span style={{ color: C.muted }}>MAC: </span>
              <span style={{ color: C.text }}>{hov.mac}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── SWITCH DETAIL ─── */
function SwitchDetailPage({ sw, user, onBack, onExport, onSavePortConfig }) {
  const [ports, setPorts] = useState(sw.portConfig);
  const [editPort, setEditPort] = useState(null);
  const [search, setSearch] = useState("");
  const [filterSt, setFilterSt] = useState("all");
  const [saved, setSaved] = useState(false);

  useEffect(() => setPorts(sw.portConfig), [sw.id]);

  const handleSave = () => {
    onSavePortConfig(ports);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const filteredPorts = ports.filter((p) => {
    const ms =
      !search ||
      [String(p.port), p.device, p.vlan, p.mac, p.notes].some((v) =>
        v.toLowerCase().includes(search.toLowerCase()),
      );
    const mf = filterSt === "all" || p.status === filterSt;
    return ms && mf;
  });

  const connected = ports.filter((p) => p.status === "connected").length;
  const uplinks = ports.filter((p) => p.status === "uplink").length;
  const errors = ports.filter((p) => p.status === "error").length;
  const free = ports.length - connected - uplinks - errors;

  return (
    <div
      style={{
        flex: 1,
        overflow: "auto",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: C.surface,
          borderBottom: `1px solid ${C.border}`,
          padding: "14px 22px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "rgba(0,212,255,0.08)",
            border: "1px solid rgba(0,212,255,0.2)",
            color: C.cyan,
            borderRadius: "6px",
            padding: "6px 12px",
            cursor: "pointer",
            fontFamily: "monospace",
            fontSize: "11px",
            fontWeight: "bold",
          }}
        >
          ‹ Volver
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                color: C.cyan,
                fontFamily: "monospace",
                fontSize: "15px",
                fontWeight: "bold",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {sw.name}
            </span>
            <span
              style={{
                flexShrink: 0,
                background:
                  sw.status === "online"
                    ? "rgba(0,232,122,0.08)"
                    : "rgba(255,68,85,0.08)",
                color: sw.status === "online" ? C.green : C.red,
                border: `1px solid ${sw.status === "online" ? "rgba(0,232,122,0.25)" : "rgba(255,68,85,0.25)"}`,
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "10px",
                fontFamily: "monospace",
                fontWeight: "bold",
              }}
            >
              ● {sw.status.toUpperCase()}
            </span>
          </div>
          <div
            style={{
              color: C.muted,
              fontSize: "11px",
              fontFamily: "monospace",
            }}
          >
            {sw.building} · {sw.location}
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
          <button
            onClick={() => onExport(sw)}
            style={{
              background: "rgba(0,232,122,0.08)",
              border: "1px solid rgba(0,232,122,0.25)",
              color: C.green,
              borderRadius: "6px",
              padding: "7px 14px",
              cursor: "pointer",
              fontFamily: "monospace",
              fontSize: "11px",
              fontWeight: "bold",
            }}
          >
            ↓ CSV
          </button>
          {user.role === "admin" && (
            <button
              onClick={handleSave}
              style={{
                background: saved ? "rgba(0,232,122,0.15)" : C.cyan,
                color: saved ? C.green : "#000",
                border: saved ? `1px solid rgba(0,232,122,0.4)` : "none",
                borderRadius: "6px",
                padding: "7px 16px",
                cursor: "pointer",
                fontFamily: "monospace",
                fontSize: "11px",
                fontWeight: "bold",
                transition: "all 0.3s",
              }}
            >
              {saved ? "✓ Guardado" : "Guardar Cambios"}
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          padding: "20px 22px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Info + Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 260px",
            gap: "14px",
          }}
        >
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <div
              style={{
                color: C.muted,
                fontSize: "9px",
                letterSpacing: "0.12em",
                fontFamily: "monospace",
                marginBottom: "12px",
              }}
            >
              INFORMACIÓN DEL SWITCH
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "10px 16px",
              }}
            >
              {[
                ["MARCA", sw.brand],
                ["MODELO", sw.model],
                ["PUERTOS", sw.ports],
                ["IP DEL SWITCH", sw.ip, C.cyan],
                ["N° SERIE", sw.serialNumber],
                ["NO. INVENTARIO", sw.inventoryNo],
                ["USUARIO WEB", sw.webUser],
                ["FECHA CONFIG.", sw.configDate],
                ["UBICACIÓN", sw.location],
              ].map(([lbl, val, col]) => (
                <div key={lbl}>
                  <div
                    style={{
                      color: C.muted,
                      fontSize: "9px",
                      fontFamily: "monospace",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {lbl}
                  </div>
                  <div
                    style={{
                      color: col || C.text,
                      fontSize: "12px",
                      fontFamily: "monospace",
                      fontWeight: "600",
                      marginTop: "1px",
                    }}
                  >
                    {val || "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              ["CONECTADOS", connected, C.green],
              [" UPLINKS", uplinks, C.cyan],
              ["LIBRES", free, C.muted],
              ["ERRORES", errors, C.red],
            ].map(([lbl, val, col]) => (
              <div
                key={lbl}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: "7px",
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: C.muted,
                      fontSize: "9px",
                      fontFamily: "monospace",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {lbl}
                  </div>
                  <div
                    style={{
                      color: col,
                      fontSize: "20px",
                      fontWeight: "bold",
                      fontFamily: "monospace",
                      lineHeight: 1.2,
                    }}
                  >
                    {val}
                  </div>
                </div>
                <div
                  style={{
                    width: "50px",
                    height: "3px",
                    background: C.surface3,
                    borderRadius: "2px",
                  }}
                >
                  <div
                    style={{
                      width: `${sw.ports > 0 ? (val / sw.ports) * 100 : 0}%`,
                      height: "100%",
                      background: col,
                      borderRadius: "2px",
                      transition: "width 0.4s",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Panel */}
        <SwitchPanel
          sw={sw}
          ports={ports}
          onPortClick={user.role === "admin" ? setEditPort : null}
        />

        {/* Port Table */}
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                color: C.text,
                fontFamily: "monospace",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              CONFIGURACIÓN DE PUERTOS
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: C.surface2,
                border: `1px solid ${C.border}`,
                borderRadius: "5px",
                padding: "5px 9px",
                maxWidth: "220px",
              }}
            >
              <span style={{ color: C.muted, fontSize: "11px" }}>⊙</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                style={{
                  background: "none",
                  border: "none",
                  color: C.text,
                  fontFamily: "monospace",
                  fontSize: "11px",
                  outline: "none",
                  width: "100%",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {[
                ["all", "Todo"],
                ["connected", "Conectado"],
                ["disconnected", "Libre"],
                ["uplink", "Uplink"],
                ["error", "Error"],
              ].map(([k, lbl]) => (
                <button
                  key={k}
                  onClick={() => setFilterSt(k)}
                  style={{
                    padding: "3px 8px",
                    borderRadius: "4px",
                    border: `1px solid ${filterSt === k ? C.cyan : C.border}`,
                    background:
                      filterSt === k ? "rgba(0,212,255,0.1)" : "transparent",
                    color: filterSt === k ? C.cyan : C.muted,
                    fontFamily: "monospace",
                    fontSize: "9px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    letterSpacing: "0.04em",
                  }}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>
          <div style={{ overflow: "auto", maxHeight: "380px" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: "monospace",
                fontSize: "11px",
              }}
            >
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  background: C.surface2,
                  zIndex: 1,
                }}
              >
                <tr>
                  {[
                    "#",
                    "DISPOSITIVO",
                    "MAC",
                    "VLAN",
                    "VELOCIDAD",
                    "ESTADO",
                    "NOTAS",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "7px 12px",
                        textAlign: "left",
                        color: C.muted,
                        fontSize: "9px",
                        letterSpacing: "0.08em",
                        borderBottom: `1px solid ${C.border}`,
                        whiteSpace: "nowrap",
                        fontWeight: "normal",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPorts.map((p, i) => (
                  <tr
                    key={p.port}
                    style={{
                      borderBottom: `1px solid rgba(26,51,86,0.5)`,
                      background: i % 2 ? "rgba(11,22,40,0.3)" : "transparent",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(0,212,255,0.03)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        i % 2 ? "rgba(11,22,40,0.3)" : "transparent")
                    }
                  >
                    <td
                      style={{
                        padding: "7px 12px",
                        color: C.cyan,
                        fontWeight: "bold",
                      }}
                    >
                      {p.port}
                    </td>
                    <td
                      style={{
                        padding: "7px 12px",
                        color: p.device ? C.text : C.dim,
                      }}
                    >
                      {p.device || "—"}
                    </td>
                    <td
                      style={{
                        padding: "7px 12px",
                        color: p.mac ? C.text : C.dim,
                        fontSize: "10px",
                      }}
                    >
                      {p.mac || "—"}
                    </td>
                    <td
                      style={{
                        padding: "7px 12px",
                        color: p.vlan ? C.text : C.dim,
                      }}
                    >
                      {p.vlan || "—"}
                    </td>
                    <td style={{ padding: "7px 12px", color: C.muted }}>
                      {p.speed || "—"}
                    </td>
                    <td style={{ padding: "7px 12px" }}>
                      <Badge status={p.status} />
                    </td>
                    <td
                      style={{
                        padding: "7px 12px",
                        color: C.muted,
                        maxWidth: "140px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.notes || "—"}
                    </td>
                    <td style={{ padding: "7px 12px" }}>
                      {user.role === "admin" && (
                        <button
                          onClick={() => setEditPort(p)}
                          style={{
                            background: "rgba(0,212,255,0.07)",
                            border: "1px solid rgba(0,212,255,0.18)",
                            color: C.cyan,
                            borderRadius: "3px",
                            padding: "2px 8px",
                            cursor: "pointer",
                            fontFamily: "monospace",
                            fontSize: "9px",
                            fontWeight: "bold",
                          }}
                        >
                          EDITAR
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editPort && (
        <PortEditModal
          port={editPort}
          onSave={(updated) => {
            const np = [...ports];
            const idx = np.findIndex((p) => p.port === updated.port);
            if (idx >= 0) np[idx] = updated;
            setPorts(np);
            setEditPort(null);
          }}
          onClose={() => setEditPort(null)}
        />
      )}
    </div>
  );
}

/* ─── PORT EDIT MODAL ─── */
function PortEditModal({ port, onSave, onClose }) {
  const [f, setF] = useState({ ...port });
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  return (
    <Modal title={`EDITAR PUERTO ${port.port}`} onClose={onClose} width="380px">
      {[
        ["DISPOSITIVO", "device", "text", "ej: PC-Lab-01"],
        ["DIRECCIÓN MAC", "mac", "text", "ej: AA:BB:CC:DD:EE:FF"],
        ["VLAN", "vlan", "text", "ej: 10"],
        ["NOTAS", "notes", "text", "ej: Uplink al core"],
      ].map(([lbl, k, t, ph]) => (
        <FormField key={k} label={lbl}>
          <input
            value={f[k] || ""}
            onChange={(e) => set(k, e.target.value)}
            type={t}
            placeholder={ph}
            style={{
              width: "100%",
              background: C.surface2,
              border: `1px solid ${C.border}`,
              borderRadius: "6px",
              padding: "8px 10px",
              color: C.text,
              fontFamily: "monospace",
              fontSize: "12px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </FormField>
      ))}
      <FormField label="VELOCIDAD">
        <select
          value={f.speed || "Auto"}
          onChange={(e) => set("speed", e.target.value)}
          style={{
            width: "100%",
            background: C.surface2,
            border: `1px solid ${C.border}`,
            borderRadius: "6px",
            padding: "8px 10px",
            color: C.text,
            fontFamily: "monospace",
            fontSize: "12px",
            outline: "none",
          }}
        >
          {SPEEDS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="ESTADO">
        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
          {Object.entries(PST).map(([k, v]) => (
            <button
              key={k}
              onClick={() => set("status", k)}
              style={{
                padding: "5px 10px",
                borderRadius: "4px",
                border: `1px solid ${f.status === k ? v.dot : C.border}`,
                background: f.status === k ? v.bg : "transparent",
                color: f.status === k ? v.dot : C.muted,
                fontFamily: "monospace",
                fontSize: "10px",
                cursor: "pointer",
                transition: "all 0.12s",
                fontWeight: "bold",
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </FormField>
      <div
        style={{
          display: "flex",
          gap: "8px",
          justifyContent: "flex-end",
          marginTop: "8px",
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: `1px solid ${C.border}`,
            color: C.muted,
            borderRadius: "6px",
            padding: "8px 16px",
            cursor: "pointer",
            fontFamily: "monospace",
            fontSize: "12px",
          }}
        >
          Cancelar
        </button>
        <button
          onClick={() => onSave(f)}
          style={{
            background: C.cyan,
            color: "#000",
            border: "none",
            borderRadius: "6px",
            padding: "8px 18px",
            cursor: "pointer",
            fontFamily: "monospace",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          Guardar
        </button>
      </div>
    </Modal>
  );
}

/* ─── ADD/EDIT SWITCH MODAL ─── */
function AddEditSwitchModal({ sw, onSave, onClose }) {
  const blank = {
    name: "",
    brand: "Cisco",
    model: "",
    building: "",
    floor: "",
    location: "",
    ip: "",
    ports: 24,
    serialNumber: "",
    inventoryNo: "",
    webUser: "admin",
    webPassword: "",
    configDate: new Date().toISOString().slice(0, 10),
    status: "online",
  };
  const [f, setF] = useState(sw ? { ...sw } : blank);
  const [errs, setErrs] = useState({});
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  const validate = () => {
    const e = {};
    if (!f.name.trim()) e.name = "Requerido";
    if (!f.ip.trim()) e.ip = "Requerido";
    if (!f.building.trim()) e.building = "Requerido";
    setErrs(e);
    return !Object.keys(e).length;
  };

  const handleSave = () => {
    if (!validate()) return;
    const data = { ...f, ports: Number(f.ports) };
    if (!sw) {
      data.portConfig = genPorts(data.ports);
    } else {
      const n = Number(data.ports);
      if (n !== sw.ports) {
        const np = genPorts(n);
        sw.portConfig.slice(0, n).forEach((p, i) => {
          np[i] = { ...p };
        });
        data.portConfig = np;
      } else {
        data.portConfig = sw.portConfig;
      }
    }
    onSave(data);
  };

  const FF = ({ label, k, type = "text", options, req }) => (
    <FormField label={label + (req ? " *" : "")}>
      {options ? (
        <select
          value={f[k] || ""}
          onChange={(e) => set(k, e.target.value)}
          style={{
            width: "100%",
            background: C.surface2,
            border: `1px solid ${errs[k] ? C.red : C.border}`,
            borderRadius: "5px",
            padding: "7px 8px",
            color: C.text,
            fontFamily: "monospace",
            fontSize: "12px",
            outline: "none",
          }}
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          value={f[k] || ""}
          onChange={(e) => set(k, e.target.value)}
          type={type}
          style={{
            width: "100%",
            background: C.surface2,
            border: `1px solid ${errs[k] ? C.red : C.border}`,
            borderRadius: "5px",
            padding: "7px 8px",
            color: C.text,
            fontFamily: "monospace",
            fontSize: "12px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      )}
      {errs[k] && (
        <span style={{ color: C.red, fontSize: "10px" }}>{errs[k]}</span>
      )}
    </FormField>
  );

  return (
    <Modal
      title={sw ? "EDITAR SWITCH" : "AGREGAR NUEVO SWITCH"}
      onClose={onClose}
      width="540px"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0 12px",
        }}
      >
        <div style={{ gridColumn: "1/-1" }}>
          <FF label="Nombre del Switch" k="name" req />
        </div>
        <FF label="Marca" k="brand" options={BRANDS} />
        <FF label="Modelo" k="model" />
        <FF label="Edificio" k="building" req />
        <FF label="Piso / Nivel" k="floor" />
        <FF label="Ubicación / Sala" k="location" />
        <FF label="IP del Switch" k="ip" req />
        <FF label="Número de Puertos" k="ports" type="number" />
        <FF label="N° Serie" k="serialNumber" />
        <FF label="No. Inventario" k="inventoryNo" />
        <FF label="Usuario Web" k="webUser" />
        <FF label="Contraseña Web" k="webPassword" type="password" />
        <FF label="Fecha Config." k="configDate" type="date" />
        <FF
          label="Estado"
          k="status"
          options={["online", "offline", "maintenance"]}
        />
      </div>
      <div
        style={{
          display: "flex",
          gap: "8px",
          justifyContent: "flex-end",
          marginTop: "12px",
          paddingTop: "12px",
          borderTop: `1px solid ${C.border}`,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: `1px solid ${C.border}`,
            color: C.muted,
            borderRadius: "6px",
            padding: "8px 16px",
            cursor: "pointer",
            fontFamily: "monospace",
            fontSize: "12px",
          }}
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          style={{
            background: C.cyan,
            color: "#000",
            border: "none",
            borderRadius: "6px",
            padding: "8px 22px",
            cursor: "pointer",
            fontFamily: "monospace",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          {sw ? "Actualizar" : "Agregar"}
        </button>
      </div>
    </Modal>
  );
}

/* ─── SHARED: MODAL + FORM FIELD ─── */
function Modal({ title, children, onClose, width = "400px" }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
      }}
    >
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "10px",
          width,
          maxWidth: "95vw",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            background: C.surface,
            zIndex: 1,
          }}
        >
          <span
            style={{
              color: C.cyan,
              fontFamily: "monospace",
              fontSize: "13px",
              fontWeight: "bold",
              letterSpacing: "0.08em",
            }}
          >
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: C.muted,
              fontSize: "18px",
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: "18px 20px" }}>{children}</div>
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: "11px" }}>
      <div
        style={{
          color: C.muted,
          fontSize: "9px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontFamily: "monospace",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

/* ─── APP ROOT ─── */
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [switches, setSwitches] = useState(SAMPLE_SWITCHES);
  const [selSw, setSelSw] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editSw, setEditSw] = useState(null);
  const [search, setSearch] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("netcfg_switches_v1");
        if (r?.value) setSwitches(JSON.parse(r.value));
      } catch {}
      setReady(true);
    })();
  }, []);

  const persist = async (sw) => {
    try {
      await window.storage.set("netcfg_switches_v1", JSON.stringify(sw));
    } catch {}
  };

  const mutate = (updated) => {
    setSwitches(updated);
    persist(updated);
  };

  if (!ready)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: C.cyan,
          fontFamily: "monospace",
          letterSpacing: "0.1em",
        }}
      >
        CARGANDO...
      </div>
    );

  if (!user) return <LoginPage onLogin={setUser} />;

  const currentSw = selSw ? switches.find((s) => s.id === selSw.id) : null;

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: C.bg,
        overflow: "hidden",
        fontFamily: "monospace",
      }}
    >
      <Sidebar
        page={page}
        setPage={setPage}
        user={user}
        onLogout={() => setUser(null)}
        detailSw={currentSw}
      />

      {page === "dashboard" && (
        <DashboardPage
          switches={switches}
          search={search}
          setSearch={setSearch}
          user={user}
          onSelect={(sw) => {
            setSelSw(sw);
            setPage("detail");
          }}
          onAdd={() => {
            setEditSw(null);
            setShowAdd(true);
          }}
          onEdit={(sw) => {
            setEditSw(sw);
            setShowAdd(true);
          }}
          onDelete={(id) => mutate(switches.filter((s) => s.id !== id))}
        />
      )}

      {page === "detail" && currentSw && (
        <SwitchDetailPage
          sw={currentSw}
          user={user}
          onBack={() => setPage("dashboard")}
          onExport={exportCSV}
          onSavePortConfig={(pc) =>
            mutate(
              switches.map((s) =>
                s.id === currentSw.id ? { ...s, portConfig: pc } : s,
              ),
            )
          }
        />
      )}

      {showAdd && (
        <AddEditSwitchModal
          sw={editSw}
          onSave={(data) => {
            const updated = editSw
              ? switches.map((s) =>
                  s.id === editSw.id ? { ...data, id: editSw.id } : s,
                )
              : [...switches, { ...data, id: `sw-${Date.now()}` }];
            mutate(updated);
            setShowAdd(false);
            setEditSw(null);
          }}
          onClose={() => {
            setShowAdd(false);
            setEditSw(null);
          }}
        />
      )}
    </div>
  );
}

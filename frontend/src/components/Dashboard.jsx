import { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, Activity, Shield, Zap, FileText, ArrowRight, Clock, TrendingUp, CheckCircle2, AlertTriangle, Layers, Folder, History, Hash } from 'lucide-react';
import { format } from 'date-fns';
import API_BASE from '../config';

// ---------- Matrix Rain Canvas (reused) ----------
function MatrixRain() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();

    const chars = '01アイウエオカキクケコSIGNALCRYPTSTEGANO';
    const fontSize = 13;
    const cols = Math.floor(canvas.width / fontSize);
    const drops = Array(cols).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(2, 12, 2, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00ff41';
      ctx.font = `${fontSize}px Share Tech Mono`;
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    const interval = setInterval(draw, 55);
    window.addEventListener('resize', resizeCanvas);
    return () => { clearInterval(interval); window.removeEventListener('resize', resizeCanvas); };
  }, []);
  return <canvas ref={canvasRef} id="matrix-canvas" style={{ position: 'fixed', top: 0, left: 0, zIndex: 0, opacity: 0.08, pointerEvents: 'none' }} />;
}

// ---------- Card Components ----------
const Card = ({ children, className = "", title, icon: Icon, glowColor = "var(--green-glow)", showGlow = true, onClick }) => (
  <div 
    className={`neon-border corner-deco flex flex-col h-full relative group transition-all duration-300 cursor-pointer ${className} ${onClick ? 'hover:scale-[1.02]' : ''}`}
    style={{ background: 'rgba(5,15,5,0.85)', backdropFilter: 'blur(8px)' }}
    onClick={onClick}
  >
    {showGlow && (
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-sm"
        style={{ background: `radial-gradient(circle at 50% 0%, ${glowColor} 0%, transparent 70%)` }} />
    )}
    {title && (
      <div className="flex items-center justify-between px-4 py-3 border-b border-green-900/50 bg-black/40 relative z-10">
        <div className="flex items-center gap-2 text-xs text-green-600 font-mono tracking-widest uppercase">
          {Icon && <Icon size={14} className="text-green-500" />}
          {title}
        </div>
        <div className="flex gap-1.5 opacity-50 hover:opacity-100 transition-opacity">
          <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#ff3b30]" />
          <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#ffcc00]" />
          <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#28cd41]" />
        </div>
      </div>
    )}
    <div className="p-6 md:p-8 flex-1 flex flex-col relative z-10">
      {children}
    </div>
  </div>
);

const StatCard = ({ title, value, icon: Icon, color = 'green', trend, subtitle }) => {
  const colorMap = {
    green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', glow: 'rgba(0,255,65,0.15)' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', glow: 'rgba(0,229,255,0.15)' },
    yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', glow: 'rgba(255,204,0,0.15)' },
  };
  
  const colors = colorMap[color];

  return (
    <div 
      className={`relative p-5 border transition-all duration-300 group hover:scale-105`}
      style={{ 
        background: 'rgba(0,0,0,0.6)', 
        borderColor: colors.border.replace('/30', '/50'),
        backdropFilter: 'blur(8px)'
      }}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
        style={{ background: `radial-gradient(circle at 50% 0%, ${colors.glow} 0%, transparent 70%)` }} 
      />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <div className={`p-2.5 rounded-lg ${colors.bg} ${colors.border} border`}>
            <Icon size={24} className={colors.text} />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 px-2 py-1 border border-green-500/20">
              <TrendingUp size={12} />
              <span>{trend}</span>
            </div>
          )}
        </div>
        
        <div className="mb-1">
          <h3 className="text-3xl font-black font-orbitron tracking-tight" style={{ color: colors.text.replace('400', '300') }}>
            {value}
          </h3>
        </div>
        
        <p className="text-[10px] text-green-600 font-mono tracking-widest uppercase">
          {title}
        </p>
        
        {subtitle && (
          <p className="text-[10px] text-green-700/60 mt-2 font-mono">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

const QuickAction = ({ icon: Icon, title, description, color = 'green', onClick }) => {
  const colorMap = {
    green: { bg: 'bg-green-500', border: 'border-green-500', hover: 'hover:bg-green-500', text: 'text-green-400' },
    cyan: { bg: 'bg-cyan-500', border: 'border-cyan-500', hover: 'hover:bg-cyan-500', text: 'text-cyan-400' },
    yellow: { bg: 'bg-yellow-500', border: 'border-yellow-500', hover: 'hover:bg-yellow-500', text: 'text-yellow-400' },
  };
  
  const colors = colorMap[color];

  return (
    <button
      onClick={onClick}
      className={`relative p-5 border border-l-4 transition-all duration-300 text-left group hover:scale-[1.02] hover:shadow-lg`}
      style={{ 
        background: 'rgba(0,0,0,0.6)', 
        borderColor: colors.border.replace('500', '900/50'),
        borderLeftColor: colors.border.replace('500', '500'),
        backdropFilter: 'blur(8px)'
      }}
    >
      <div className={`absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${colors.hover} ${colors.text} bg-black/40 rounded-full p-1.5`}>
        <ArrowRight size={14} />
      </div>
      
      <div className="flex items-start gap-4 mb-3">
        <div className={`p-2.5 rounded-lg ${colors.bg} ${colors.border} border`}>
          <Icon size={20} className={colors.text} />
        </div>
        <div className="flex-1">
          <h4 className={`text-sm font-bold font-orbitron tracking-widest uppercase mb-1 ${colors.text}`}>
            {title}
          </h4>
          <p className="text-[10px] text-green-600 font-mono leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
};

const TimelineItem = ({ operation, onClick }) => {
  const typeColors = {
    'ENCODE': 'border-green-700 text-green-500 bg-green-500/10',
    'DECODE': 'border-cyan-700 text-cyan-500 bg-cyan-500/10',
    'ANALYZE': 'border-yellow-700 text-yellow-500 bg-yellow-500/10',
    'SANITIZE': 'border-red-700 text-red-500 bg-red-500/10',
  };

  const statusIcons = {
    'SUCCESS': <CheckCircle2 size={14} className="text-green-400" />,
    'FAILED': <AlertTriangle size={14} className="text-red-500" />,
  };

  return (
    <div 
      onClick={onClick}
      className="relative pl-8 pb-6 last:pb-0 cursor-pointer group hover:bg-green-900/10 transition-colors rounded-lg py-2 pr-2"
    >
      {/* Timeline line */}
      <div className="absolute left-2 top-2 bottom-0 w-0.5 bg-green-900/30 last:hidden" />
      
      {/* Timeline dot */}
      <div className={`absolute left-[3px] top-3 w-3.5 h-3.5 rounded-full border-2 ${operation.status === 'SUCCESS' ? 'bg-green-500 border-green-900' : 'bg-red-500 border-red-900'}`} />
      
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 border ${typeColors[operation.type] || typeColors['ENCODE']}`}>
            {operation.type}
          </span>
          <span className="text-[10px] text-green-600 font-mono">
            {format(new Date(operation.timestamp), 'MMM dd, HH:mm:ss')}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-xs text-green-400/80 font-mono truncate max-w-[280px]">
            {operation.details}
          </p>
          <div className={`flex items-center gap-1 px-2 py-1 rounded ${operation.status === 'SUCCESS' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            {statusIcons[operation.status]}
            <span className={`text-[10px] font-bold ${operation.status === 'SUCCESS' ? 'text-green-400' : 'text-red-500'}`}>
              {operation.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Main Dashboard Component ----------
export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    totalOperations: 0,
    successRate: 100,
    imagesProcessed: 0,
    storageUsed: 0,
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemStatus, setSystemStatus] = useState('online'); // online, degraded, offline
  
  // Load data on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('stegosphere_history');
      if (saved) {
        const history = JSON.parse(saved);
        const successful = history.filter(op => op.status === 'SUCCESS').length;
        const total = history.length;
        const successRate = total > 0 ? Math.round((successful / total) * 100) : 100;
        
        setStats({
          totalOperations: total,
          successRate: successRate,
          imagesProcessed: successful,
          storageUsed: Math.round(total * 0.5), // Mock calculation
        });
        
        setRecentActivity(history.slice(0, 5));
      }
    } catch (e) {
      console.error("Could not load dashboard data");
    }

    // Check backend health
    fetch(`${API_BASE}/api/health`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => setSystemStatus(res.ok ? 'online' : 'degraded'))
      .catch(() => setSystemStatus('offline'));
  }, []);

  const getStatusColor = () => {
    switch (systemStatus) {
      case 'online': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'offline': return 'text-red-500';
      default: return 'text-green-700';
    }
  };

  const getStatusDot = () => {
    switch (systemStatus) {
      case 'online': return 'bg-green-500 shadow-[0_0_8px_rgba(0,255,65,0.5)]';
      case 'degraded': return 'bg-yellow-500 shadow-[0_0_8px_rgba(255,204,0,0.5)]';
      case 'offline': return 'bg-red-500 shadow-[0_0_8px_rgba(255,0,0,0.5)]';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="min-h-screen hex-bg relative pb-20 font-mono" style={{ zIndex: 1, backgroundColor: 'var(--bg)' }}>
      <MatrixRain />

      {/* Heavy noise vignette */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(2,12,2,0.95) 100%)', pointerEvents: 'none', zIndex: 1 }} />

      <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-8 xl:px-10 py-10 selection:bg-green-500/30 selection:text-green-300">

        {/* ---- HEADER ---- */}
        <div className="flex justify-between items-start mb-10 border-b border-green-900/50 pb-6">
          <div className="flex gap-4">
            <div className="hidden sm:block">
              <div className="w-16 h-16 border border-green-500/50 flex items-center justify-center bg-green-500/5 relative overflow-hidden">
                <Activity size={28} className="text-green-500 relative z-10" />
                <div className="absolute inset-0 bg-green-500/10 animate-pulse" />
              </div>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.5em] text-green-700/80 mb-1 uppercase drop-shadow-sm">// command_center</p>
              <h1
                className="glitch text-4xl sm:text-5xl font-black uppercase leading-none"
                data-text="DASHBOARD"
                style={{ fontFamily: 'Orbitron, monospace', color: '#00ff41', textShadow: '0 0 20px rgba(0,255,65,0.4), 0 0 40px rgba(0,255,65,0.2)' }}
              >
                DASHBOARD
              </h1>
              <p className="text-green-600/80 tracking-widest text-xs mt-1 font-mono">
                [ STEGOSPHERE V3 - OPERATIONAL OVERVIEW ]
              </p>
            </div>
          </div>

          {/* System Status */}
          <div className="hidden sm:flex flex-col items-end gap-2">
            <div className={`flex items-center gap-2 bg-black/40 border px-3 py-1.5 text-xs font-mono tracking-widest ${systemStatus === 'online' ? 'border-green-500/50' : systemStatus === 'degraded' ? 'border-yellow-500/50' : 'border-red-500/50'}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${getStatusDot()}`} />
              <span className={getStatusColor()}>SYSTEM: {systemStatus.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 border border-green-900/50 px-3 py-1.5 text-[10px] text-green-600">
              <Shield size={10} />
              API_LINK: ESTABLISHED
            </div>
          </div>
        </div>

        {/* ---- STATS CARDS ---- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Operations"
            value={stats.totalOperations}
            icon={Activity}
            color="green"
            trend="+12%"
            subtitle={`${stats.imagesProcessed} successful`}
          />
          <StatCard
            title="Success Rate"
            value={`${stats.successRate}%`}
            icon={CheckCircle2}
            color="cyan"
            subtitle="Last 30 days"
          />
          <StatCard
            title="Images Processed"
            value={stats.imagesProcessed}
            icon={FileText}
            color="yellow"
            trend="+8%"
          />
          <StatCard
            title="Storage Used"
            value={`${stats.storageUsed} MB`}
            icon={Folder}
            color="green"
            subtitle="Local cache"
          />
        </div>

        {/* ---- MAIN CONTENT GRID ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Quick Actions - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xs text-green-500 font-mono tracking-widest uppercase mb-4 flex items-center gap-2">
              <Zap size={14} />
              Quick Actions
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <QuickAction
                icon={Lock}
                title="Quick Encode"
                description="Rapid payload injection with carrier image"
                color="green"
                onClick={() => onNavigate('encode')}
              />
              <QuickAction
                icon={Unlock}
                title="Quick Decode"
                description="Extract hidden messages from artifacts"
                color="cyan"
                onClick={() => onNavigate('decode')}
              />
              <QuickAction
                icon={Layers}
                title="Analyze Images"
                description="Run structural analysis on images"
                color="yellow"
                onClick={() => onNavigate('analyze')}
              />
              <QuickAction
                icon={Hash}
                title="Learn Algorithms"
                description="View technical documentation"
                color="cyan"
                onClick={() => window.location.href = '/StegoSphere/algorithms'}
              />
            </div>

            {/* Activity Timeline */}
            <div className="mt-8">
              <h2 className="text-xs text-green-500 font-mono tracking-widest uppercase mb-4 flex items-center gap-2">
                <Clock size={14} />
                Recent Activity
              </h2>
              
              <Card showGlow={false} className="!border-green-900/30 bg-black/60 min-h-[300px]">
                {recentActivity.length === 0 ? (
                  <div className="h-full flex items-center justify-center opacity-40 text-sm">
                    <div className="text-center">
                      <Activity size={32} className="text-green-700 mx-auto mb-3" />
                      <p className="text-green-700/60 font-mono text-xs tracking-widest">NO OPERATIONS RECORDED</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    {recentActivity.map(op => (
                      <TimelineItem key={op.id} operation={op} />
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* System Specs Panel */}
          <div className="space-y-6">
            <h2 className="text-xs text-green-500 font-mono tracking-widest uppercase mb-4 flex items-center gap-2">
              <Shield size={14} />
              System Configuration
            </h2>
            
            <Card title="PROTOCOL_SPECS" icon={Activity} showGlow={false} className="!border-green-900/30 bg-black/60">
              <div className="space-y-3 text-[10px]">
                <div className="flex justify-between border-b border-green-900/30 pb-2">
                  <span className="text-green-700">PROTOCOL:</span>
                  <span className="text-green-500 font-bold">LSB_V2</span>
                </div>
                <div className="flex justify-between border-b border-green-900/30 pb-2">
                  <span className="text-green-700">CIPHER:</span>
                  <span className="text-green-500 font-bold">AES-256-GCM</span>
                </div>
                <div className="flex justify-between border-b border-green-900/30 pb-2">
                  <span className="text-green-700">KDF_ITERATIONS:</span>
                  <span className="text-cyan-500 font-bold">100,000</span>
                </div>
                <div className="flex justify-between border-b border-green-900/30 pb-2">
                  <span className="text-green-700">HASH_ALGORITHM:</span>
                  <span className="text-green-500 font-bold">SHA-256</span>
                </div>
                <div className="flex justify-between border-b border-green-900/30 pb-2">
                  <span className="text-green-700">AUTH_MODE:</span>
                  <span className="text-green-500 font-bold">AEAD</span>
                </div>
                <div className="flex justify-between border-b border-green-900/30 pb-2">
                  <span className="text-green-700">MAX_FILE_SIZE:</span>
                  <span className="text-yellow-500 font-bold">15.0 MB</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-green-700">ENGINE_VERSION:</span>
                  <span className="text-green-500 font-bold">v3.0.0</span>
                </div>
              </div>
            </Card>

            {/* Quick Tips */}
            <Card title="QUICK_TIPS" icon={Zap} showGlow={false} className="!border-cyan-900/30 bg-black/60">
              <div className="space-y-3 text-[10px] text-green-600 font-mono">
                <div className="flex items-start gap-2">
                  <span className="text-green-400">▸</span>
                  <span>Use strong passwords for maximum security</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400">▸</span>
                  <span>PNG format recommended for lossless encoding</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400">▸</span>
                  <span>Check capacity before embedding large payloads</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400">▸</span>
                  <span>Sanitize images to verify no hidden data</span>
                </div>
              </div>
            </Card>
          </div>

        </div>

        {/* ---- FOOTER ---- */}
        <footer className="text-center mt-16 pt-6 border-t border-green-900/30">
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-[10px] font-mono opacity-50 mb-4">
            <span className="flex items-center gap-1.5"><Shield size={10} className="text-green-500" /> PROTOCOL: SECURE</span>
            <span className="hidden sm:inline-block text-green-900">|</span>
            <span className="flex items-center gap-1.5"><Lock size={10} className="text-green-500" /> CIPHER: AES-GCM-256</span>
            <span className="hidden sm:inline-block text-green-900">|</span>
            <span className="flex items-center gap-1.5"><Hash size={10} className="text-green-500" /> KDF: PBKDF2-SHA256</span>
            <span className="hidden sm:inline-block text-green-900">|</span>
            <span className="flex items-center gap-1.5"><Zap size={10} className="text-green-500" /> ENGINE: FASTAPI_V3</span>
          </div>
          <p className="text-[10px] text-green-700/40 font-mono tracking-widest uppercase">// StegoSphere_v3 — Signals hidden in plain sight [ {(new Date()).getFullYear()} ]</p>
        </footer>
      </div>
    </div>
  );
}
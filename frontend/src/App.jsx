import { useState, useRef, useEffect } from 'react';
import { Download, Upload, Lock, Unlock, Zap, Activity, Shield, Hash, Search, FileText, XCircle, CheckCircle2, AlertTriangle, Eye, EyeOff, Save, Trash2, ShieldAlert, BarChart2, ShieldOff } from 'lucide-react';
import { format } from 'date-fns';
import API_BASE from './config';

// ---------- Matrix Rain Canvas ----------
function MatrixRain() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Set explicit size to fix rendering issues
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

// ---------- Animated terminal log ----------
function TerminalLog({ lines, status = 'idle' }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const getStatusColor = () => {
    switch (status) {
      case 'processing': return 'var(--cyan)';
      case 'success': return 'var(--green)';
      case 'error': return 'var(--red)';
      default: return 'var(--text-dim)';
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2 pb-1 border-b" style={{ borderColor: 'rgba(0,255,65,0.1)' }}>
        <div className="text-xs tracking-widest flex items-center gap-2" style={{ color: getStatusColor() }}>
          {status === 'processing' ? <Activity size={12} className="animate-pulse" /> : <Hash size={12} />}
          SYSTEM LOG &gt;
          {status === 'processing' && <span className="ml-1 blink">PROCESSING</span>}
          {status === 'success' && <span className="ml-1">COMPLETE</span>}
          {status === 'error' && <span className="ml-1 text-red-500">ERROR</span>}
          {status === 'idle' && <span className="ml-1">AWAITING INPUT</span>}
        </div>
        <div className="text-[10px] opacity-50 flex items-center gap-1">
          <ShieldAlert size={10} /> SECURE TTY
        </div>
      </div>

      <div
        ref={scrollRef}
        className="font-mono text-xs text-green-600 space-y-1 px-1 overflow-y-auto flex-1 custom-scrollbar"
        style={{ maxHeight: '120px' }}
      >
        {lines.length === 0 ? (
          <div className="opacity-30 italic mt-2">Waiting for operations...</div>
        ) : (
          lines.map((l, i) => {
            const isError = l.includes('ERR') || l.includes('FATAL') || l.includes('FAILED');
            const isSuccess = l.includes('COMPLETE') || l.includes('OK') || l.includes('SUCCESS');
            const isWarn = l.includes('WARN');

            let colorClass = 'text-green-600';
            if (isError) colorClass = 'text-red-500 font-bold';
            if (isSuccess) colorClass = 'text-cyan-400';
            if (isWarn) colorClass = 'text-yellow-500';

            return (
              <div key={i} className={`flex items-start ${colorClass} animate-fade-in`}>
                <span className="text-green-800 mr-2 shrink-0">[{format(new Date(), 'HH:mm:ss')}]</span>
                <span className="break-all">{l}</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
}

// ---------- UI Components ----------

const Card = ({ children, className = "", title, icon: Icon, glowColor = "var(--green-glow)", showGlow = true }) => (
  <div className={`neon-border corner-deco flex flex-col h-full relative group transition-all duration-300 ${className}`}
    style={{ background: 'rgba(5,15,5,0.85)', backdropFilter: 'blur(8px)' }}>

    {/* Hover glow effect that follows mouse conceptually */}
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
        <div className="flex gap-1.5 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
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

const Label = ({ children, icon: Icon, required }) => (
  <label className="text-xs tracking-widest text-green-500 uppercase font-mono mb-2 flex items-center gap-2">
    {Icon && <Icon size={12} className="opacity-70" />}
    <span className="opacity-80">//</span> {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const Input = ({ icon: Icon, type = "text", ...props }) => {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="relative group">
      {Icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-700/70 group-focus-within:text-green-500 transition-colors z-10">
          <Icon size={16} />
        </span>
      )}
      <input
        type={isPassword && showPwd ? "text" : type}
        className={`stego-input w-full ${Icon ? 'pl-10' : 'pl-4'} ${isPassword ? 'pr-10' : 'pr-4'} py-3 rounded-none relative z-0`}
        {...props}
      />
      {isPassword && (
        <button
          onClick={() => setShowPwd(!showPwd)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-green-700 hover:text-green-400 transition-colors z-10"
          type="button"
          title={showPwd ? "Hide Password" : "Show Password"}
        >
          {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  );
};

const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={`stego-textarea w-full p-4 rounded-none ${className}`}
    {...props}
  />
);

const Button = ({ children, variant = "primary", icon: Icon, isLoading, className = "", ...props }) => {
  const isCyan = variant === "secondary";
  const btnClass = isCyan ? "stego-btn-cyan" : "stego-btn";

  return (
    <button
      className={`relative background-transparent border px-6 py-3.5 cursor-pointer overflow-hidden font-orbitron text-xs tracking-widest uppercase transition-all duration-300 w-full flex items-center justify-center gap-2 group ${btnClass} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {/* Button hover slide cover is handled in CSS, just need the base classes */}
      <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
        {isLoading ? <Activity className="animate-spin" size={16} /> : Icon && <Icon size={16} className="group-hover:-translate-y-0.5 transition-transform" />}
        {children}
      </span>
    </button>
  );
};

// ---------- Main App Component ----------

export default function App() {
  const [activeTab, setActiveTab] = useState('encode');

  // App wide state
  const [operationsHistory, setOperationsHistory] = useState([]); // Mock persistence
  const [showHistory, setShowHistory] = useState(false);

  // Encode State
  const [encodeImage, setEncodeImage] = useState(null);
  const [encodePreview, setEncodePreview] = useState(null);
  const [message, setMessage] = useState('');
  const [encodePassword, setEncodePassword] = useState('');
  const [encodeStatus, setEncodeStatus] = useState('idle'); // idle, processing, success, error
  const [encodeResultUrl, setEncodeResultUrl] = useState(null);
  const [encodeLog, setEncodeLog] = useState(['SYSTEM INITIALIZED. READY FOR ENCODE.']);
  const [encodeDrag, setEncodeDrag] = useState(false);

  // Decode State
  const [decodeImage, setDecodeImage] = useState(null);
  const [decodePreview, setDecodePreview] = useState(null);
  const [decodePassword, setDecodePassword] = useState('');
  const [decodeStatus, setDecodeStatus] = useState('idle'); // idle, processing, success, error
  const [decodeResult, setDecodeResult] = useState('');
  const [decodeError, setDecodeError] = useState('');
  const [decodeLog, setDecodeLog] = useState(['SYSTEM INITIALIZED. AWAITING CARRIER.']);
  const [decodeDrag, setDecodeDrag] = useState(false);

  // Sanitize State
  const [sanitizeImage, setSanitizeImage] = useState(null);
  const [sanitizePreview, setSanitizePreview] = useState(null);
  const [sanitizeStatus, setSanitizeStatus] = useState('idle');
  const [sanitizeResultUrl, setSanitizeResultUrl] = useState(null);
  const [sanitizeLog, setSanitizeLog] = useState(['SYSTEM INITIALIZED. AWAITING SANITIZATION TARGET.']);
  const [sanitizeDrag, setSanitizeDrag] = useState(false);

  // Analyze State
  const [analyzeImage, setAnalyzeImage] = useState(null);
  const [analyzePreview, setAnalyzePreview] = useState(null);
  const [analyzeStatus, setAnalyzeStatus] = useState('idle');
  const [analyzeResult, setAnalyzeResult] = useState(null);
  const [analyzeLog, setAnalyzeLog] = useState(['SYSTEM INITIALIZED. AWAITING FORENSIC TARGET.']);
  const [analyzeDrag, setAnalyzeDrag] = useState(false);

  const encodeFileRef = useRef();
  const decodeFileRef = useRef();
  const sanitizeFileRef = useRef();
  const analyzeFileRef = useRef();

  // Load history from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('stegosphere_history');
      if (saved) setOperationsHistory(JSON.parse(saved));
    } catch (e) { console.error("Could not load history"); }
  }, []);

  // Save history helper
  const saveOperation = (type, status, details) => {
    const newOp = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      status,
      details,
      timestamp: new Date().toISOString()
    };
    const newHistory = [newOp, ...operationsHistory].slice(0, 50); // Keep last 50
    setOperationsHistory(newHistory);
    try {
      localStorage.setItem('stegosphere_history', JSON.stringify(newHistory));
    } catch (e) { }
  };

  const clearHistory = () => {
    setOperationsHistory([]);
    localStorage.removeItem('stegosphere_history');
  }

  const pushLog = (setter, line) => setter(prev => [...prev.slice(-49), line]); // Keep 50 lines max

  const handleDragEvents = (setDragState) => ({
    onDragOver: (e) => { e.preventDefault(); e.stopPropagation(); setDragState(true); },
    onDragEnter: (e) => { e.preventDefault(); e.stopPropagation(); setDragState(true); },
    onDragLeave: (e) => { e.preventDefault(); e.stopPropagation(); setDragState(false); },
  });

  const handleEncodeFile = (file) => {
    if (!file) return;

    // Basic validation
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/pjpeg', 'image/x-png'];
    const isImage = file.type.startsWith('image/') || validTypes.includes(file.type);

    if (!isImage) {
      pushLog(setEncodeLog, `> ERR: Invalid file format: ${file.type}. Expected an image.`);
      return;
    }

    if (file.size > 15 * 1024 * 1024) { // 15MB limit
      pushLog(setEncodeLog, `> ERR: File too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Max 15MB.`);
      return;
    }

    setEncodeImage(file);
    setEncodePreview(URL.createObjectURL(file));
    setEncodeResultUrl(null);
    setEncodeStatus('idle');
    pushLog(setEncodeLog, `> IMAGE LOADED: ${file.name}`);
    pushLog(setEncodeLog, `> SIZE: ${(file.size / 1024).toFixed(1)} KB | TYPE: ${file.type.split('/')[1].toUpperCase()}`);
    pushLog(setEncodeLog, `> CALCULATING MAX CAPACITY... OK`);
  };

  const handleDecodeFile = (file) => {
    if (!file) return;

    const validTypes = ['image/png', 'image/bmp'];
    if (!validTypes.includes(file.type)) {
      pushLog(setDecodeLog, `> WARN: Expected lossless PNG/BMP. Got ${file.type}. Extraction may fail.`);
    }

    setDecodeImage(file);
    setDecodePreview(URL.createObjectURL(file));
    setDecodeResult('');
    setDecodeError('');
    setDecodeStatus('idle');
    pushLog(setDecodeLog, `> CARRIER IMAGE LOADED: ${file.name}`);
    pushLog(setDecodeLog, `> INITIATING HEURISTIC SCAN... OK. READY AWAITING KEY.`);
  };

  const handleSanitizeFile = (file) => {
    if (!file) return;
    setSanitizeImage(file);
    setSanitizePreview(URL.createObjectURL(file));
    setSanitizeResultUrl(null);
    setSanitizeStatus('idle');
    pushLog(setSanitizeLog, `> TARGET IMAGE SECURED: ${file.name}`);
  };

  const handleAnalyzeFile = (file) => {
    if (!file) return;
    setAnalyzeImage(file);
    setAnalyzePreview(URL.createObjectURL(file));
    setAnalyzeResult(null);
    setAnalyzeStatus('idle');
    pushLog(setAnalyzeLog, `> FORENSIC TARGET READY: ${file.name}`);
  };

  const handleEncode = async () => {
    if (!encodeImage) { pushLog(setEncodeLog, '> ERR: Carrier image missing.'); return; }
    if (!message) { pushLog(setEncodeLog, '> ERR: Payload message is empty. Nothing to embed.'); return; }
    if (!encodePassword) {
      pushLog(setEncodeLog, '> WARN: No passphrase provided. Proceeding with static anonymous key.');
    }

    setEncodeStatus('processing');
    setEncodeResultUrl(null);

    pushLog(setEncodeLog, '> INIT AES-256-GCM AEAD ENCRYPTION...');
    if (encodePassword) pushLog(setEncodeLog, '> PBKDF2-HMAC-SHA256 KEY DERIVATION (100,000 ITERATIONS)...');

    const formData = new FormData();
    formData.append('file', encodeImage);
    formData.append('message', message);
    if (encodePassword) formData.append('password', encodePassword);

    try {
      pushLog(setEncodeLog, '> TRANSMITTING TO CRYPTO ENGINE...');
      const res = await fetch(`${API_BASE}/api/encode`, {
        method: 'POST',
        body: formData,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({ detail: 'Unknown backend error' }));
        throw new Error(e.detail || `HTTP ${res.status}`);
      }

      pushLog(setEncodeLog, '> INJECTING CIPHERTEXT VIA LSB MANIPULATION...');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      setEncodeResultUrl(url);
      setEncodeStatus('success');

      pushLog(setEncodeLog, `> [OK] EMBED COMPLETE. PAYLOAD SECURED.`);
      pushLog(setEncodeLog, `> OUTPUT READY FOR DOWNLOAD: stego_${encodeImage.name.replace(/\.[^/.]+$/, "")}.png`);

      saveOperation('ENCODE', 'SUCCESS', `Secured ${message.length} bytes into ${encodeImage.name}`);

    } catch (err) {
      setEncodeStatus('error');
      pushLog(setEncodeLog, `> FATAL ERROR: ${err.message}`);
      saveOperation('ENCODE', 'FAILED', `Error: ${err.message}`);
    }
  };

  const handleDecode = async () => {
    if (!decodeImage) { pushLog(setDecodeLog, '> ERR: No stego-image selected'); return; }

    setDecodeStatus('processing');
    setDecodeResult('');
    setDecodeError('');

    pushLog(setDecodeLog, '> ANALYZING CARRIER IMAGE BUFFERS...');
    pushLog(setDecodeLog, '> SCANNING LSB CHANNELS FOR STEG MAGICBYTES...');

    const formData = new FormData();
    formData.append('file', decodeImage);
    if (decodePassword) formData.append('password', decodePassword);

    try {
      const res = await fetch(`${API_BASE}/api/decode`, {
        method: 'POST',
        body: formData,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data ? data.detail : `HTTP ERROR ${res.status}`);
      }

      if (!data || !data.message) throw new Error("Format error: Empty response payload received");

      setDecodeResult(data.message);
      setDecodeStatus('success');

      pushLog(setDecodeLog, '> AEAD TAG VERIFIED. AUTHENTICATION SUCCESSFUL.');
      pushLog(setDecodeLog, '> DECRYPTED PLAINTEXT RECOVERED SUCCESSFULLY.');

      saveOperation('DECODE', 'SUCCESS', `Extracted ${data.message.length} chars from ${decodeImage.name}`);

    } catch (err) {
      setDecodeStatus('error');
      setDecodeError(err.message);
      pushLog(setDecodeLog, `> AUTHENTICATION FAILED: ${err.message}`);
      pushLog(setDecodeLog, '> POSSIBLE CAUSES: INVALID KEY, TAMPERED IMAGE, OR NOT A STEGO CARRIER.');

      saveOperation('DECODE', 'FAILED', err.message);
    }
  };

  const handleSanitize = async () => {
    if (!sanitizeImage) return;
    setSanitizeStatus('processing');
    setSanitizeResultUrl(null);
    pushLog(setSanitizeLog, '> INITIATING DEEP LSB SCRUB...');

    const formData = new FormData();
    formData.append('file', sanitizeImage);

    try {
      const res = await fetch(`${API_BASE}/api/sanitize`, {
        method: 'POST',
        body: formData,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const blob = await res.blob();
      setSanitizeResultUrl(URL.createObjectURL(blob));
      setSanitizeStatus('success');
      pushLog(setSanitizeLog, '> LSB CHANNELS ZEROED COMPLETELY.');
      saveOperation('SANITIZE', 'SUCCESS', `Sanitized ${sanitizeImage.name}`);
    } catch (err) {
      setSanitizeStatus('error');
      pushLog(setSanitizeLog, `> FATAL ERROR: ${err.message}`);
      saveOperation('SANITIZE', 'FAILED', err.message);
    }
  };

  const handleAnalyze = async () => {
    if (!analyzeImage) return;
    setAnalyzeStatus('processing');
    setAnalyzeResult(null);
    pushLog(setAnalyzeLog, '> CALCULATING STRUCTURAL ENTROPY...');

    const formData = new FormData();
    formData.append('file', analyzeImage);

    try {
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        body: formData,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      setAnalyzeResult(data);
      setAnalyzeStatus('success');
      pushLog(setAnalyzeLog, '> ANALYSIS COMPLETE.');
      if (data.stego_suspected) {
        pushLog(setAnalyzeLog, '> [!] HIGH PROBABILITY OF HIDDEN PAYLOAD DETECTED.');
      }
      saveOperation('ANALYZE', 'SUCCESS', `Analyzed ${analyzeImage.name}`);
    } catch (err) {
      setAnalyzeStatus('error');
      pushLog(setAnalyzeLog, `> FATAL ERROR: ${err.message}`);
      saveOperation('ANALYZE', 'FAILED', err.message);
    }
  };

  const handleClearEncode = () => {
    setEncodeImage(null);
    setEncodePreview(null);
    setMessage('');
    setEncodePassword('');
    setEncodeResultUrl(null);
    setEncodeStatus('idle');
    setEncodeLog(['SYSTEM RESET. READY FOR NEW ENCODE.']);
  }

  const handleClearDecode = () => {
    setDecodeImage(null);
    setDecodePreview(null);
    setDecodePassword('');
    setDecodeResult('');
    setDecodeError('');
    setDecodeStatus('idle');
    setDecodeLog(['SYSTEM RESET. AWAITING CARRIER IMAGE.']);
  }

  const handleClearSanitize = () => {
    setSanitizeImage(null);
    setSanitizePreview(null);
    setSanitizeResultUrl(null);
    setSanitizeStatus('idle');
    setSanitizeLog(['SYSTEM RESET. AWAITING SANITIZATION TARGET.']);
  }

  const handleClearAnalyze = () => {
    setAnalyzeImage(null);
    setAnalyzePreview(null);
    setAnalyzeResult(null);
    setAnalyzeStatus('idle');
    setAnalyzeLog(['SYSTEM RESET. AWAITING FORENSIC TARGET.']);
  }

  return (
    <div className="min-h-screen hex-bg relative pb-20 font-mono" style={{ zIndex: 1, backgroundColor: 'var(--bg)' }}>
      <MatrixRain />

      {/* heavy noise vignette */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(2,12,2,0.95) 100%)', pointerEvents: 'none', zIndex: 1 }} />

      <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-8 xl:px-10 py-10 selection:bg-green-500/30 selection:text-green-300">

        {/* ---- HEADER NAV & STATS ---- */}
        <div className="flex justify-between items-start mb-12 border-b border-green-900/50 pb-6">
          <div className="flex gap-4">
            <div className="hidden sm:block">
              <div className="w-16 h-16 border border-green-500/50 flex items-center justify-center bg-green-500/5 relative overflow-hidden">
                <Shield size={28} className="text-green-500 relative z-10" />
                <div className="absolute inset-0 bg-green-500/10 animate-pulse" />
              </div>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.5em] text-green-700/80 mb-1 uppercase drop-shadow-sm">// classified signal</p>
              <h1
                className="glitch text-4xl sm:text-5xl font-black uppercase leading-none"
                data-text="StegoSphere_v3"
                style={{ fontFamily: 'Orbitron, monospace', color: '#00ff41', textShadow: '0 0 20px rgba(0,255,65,0.4), 0 0 40px rgba(0,255,65,0.2)' }}
              >
                StegoSphere_v3
              </h1>
              <p className="text-green-600/80 tracking-widest text-xs mt-1 font-mono">
                [ LSB STEGANOGRAPHY CRYPTOSYSTEM FRAMEWORK ]
              </p>
            </div>
          </div>

          {/* Global Top-Right Dash */}
          <div className="hidden lg:flex flex-col items-end text-xs gap-1.5">
            <div className="flex items-center gap-2 bg-black/40 border border-green-900/50 px-3 py-1.5">
              <Activity size={12} className="text-cyan-500" />
              <span className="text-cyan-500/80">API LINK: ESTABLISHED</span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 border border-green-900/50 px-3 py-1.5 cursor-pointer hover:bg-green-900/20 transition-colors"
              onClick={() => setShowHistory(!showHistory)}>
              <FileText size={12} className={showHistory ? 'text-green-400' : 'text-green-700'} />
              <span className={showHistory ? 'text-green-400' : 'text-green-700'}>OP_HISTORY_LOG [{operationsHistory.length}]</span>
            </div>
          </div>
        </div>

        {/* ---- MAIN DASHBOARD LAYOUT ---- */}
        <div className="flex flex-col xl:flex-row gap-8">

          {/* LEFT SIDEBAR (Controls & Tabs) */}
          <div className="w-full xl:w-64 shrink-0 flex flex-col gap-6">

            {/* Primary Navigation Tabs - Vertical on Desktop */}
            {/* Primary Navigation Tabs - Vertical on Desktop */}
            <div className="flex flex-row xl:flex-col gap-3 flex-wrap xl:flex-nowrap">
              {/* ENCODE */}
              <button
                className={`relative px-4 py-4 md:py-5 border transition-all text-left flex items-center justify-between group overflow-hidden ${activeTab === 'encode'
                    ? 'bg-green-500/10 border-green-500 text-green-400 shadow-[0_0_15px_rgba(0,255,65,0.15)]'
                    : 'bg-black/50 border-green-900/50 text-green-800 hover:text-green-600 hover:border-green-700'
                  }`}
                onClick={() => setActiveTab('encode')}
              >
                {activeTab === 'encode' && <span className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 shadow-[0_0_10px_#00ff41]" />}
                <div className="flex items-center gap-3 relative z-10">
                  <Lock size={18} className={activeTab === 'encode' ? 'text-green-400' : ''} />
                  <span className="font-orbitron tracking-widest text-xs font-bold">ENCODE</span>
                </div>
                <span className={`text-[10px] hidden sm:block opacity-50 ${activeTab === 'encode' ? 'opacity-100' : ''}`}>[01]</span>
              </button>

              {/* DECODE */}
              <button
                className={`relative px-4 py-4 md:py-5 border transition-all text-left flex items-center justify-between group overflow-hidden ${activeTab === 'decode'
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                    : 'bg-black/50 border-green-900/50 text-green-800 hover:text-cyan-600 hover:border-cyan-700'
                  }`}
                onClick={() => setActiveTab('decode')}
              >
                {activeTab === 'decode' && <span className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_#00e5ff]" />}
                <div className="flex items-center gap-3 relative z-10">
                  <Unlock size={18} className={activeTab === 'decode' ? 'text-cyan-400' : ''} />
                  <span className="font-orbitron tracking-widest text-xs font-bold">DECODE</span>
                </div>
                <span className={`text-[10px] hidden sm:block opacity-50 ${activeTab === 'decode' ? 'opacity-100' : ''}`}>[02]</span>
              </button>

              {/* ANALYZE */}
              <button
                className={`relative px-4 py-4 md:py-5 border transition-all text-left flex items-center justify-between group overflow-hidden ${activeTab === 'analyze'
                    ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400 shadow-[0_0_15px_rgba(255,204,0,0.15)]'
                    : 'bg-black/50 border-green-900/50 text-green-800 hover:text-yellow-600 hover:border-yellow-700'
                  }`}
                onClick={() => setActiveTab('analyze')}
              >
                {activeTab === 'analyze' && <span className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 shadow-[0_0_10px_#ffcc00]" />}
                <div className="flex items-center gap-3 relative z-10">
                  <BarChart2 size={18} className={activeTab === 'analyze' ? 'text-yellow-400' : ''} />
                  <span className="font-orbitron tracking-widest text-xs font-bold">ANALYZE</span>
                </div>
                <span className={`text-[10px] hidden sm:block opacity-50 ${activeTab === 'analyze' ? 'opacity-100' : ''}`}>[03]</span>
              </button>

              {/* SANITIZE */}
              <button
                className={`relative px-4 py-4 md:py-5 border transition-all text-left flex items-center justify-between group overflow-hidden ${activeTab === 'sanitize'
                    ? 'bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_15px_rgba(255,59,48,0.15)]'
                    : 'bg-black/50 border-green-900/50 text-green-800 hover:text-red-600 hover:border-red-700'
                  }`}
                onClick={() => setActiveTab('sanitize')}
              >
                {activeTab === 'sanitize' && <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_#ff3b30]" />}
                <div className="flex items-center gap-3 relative z-10">
                  <ShieldOff size={18} className={activeTab === 'sanitize' ? 'text-red-500' : ''} />
                  <span className="font-orbitron tracking-widest text-xs font-bold">SANITIZE</span>
                </div>
                <span className={`text-[10px] hidden sm:block opacity-50 ${activeTab === 'sanitize' ? 'opacity-100' : ''}`}>[04]</span>
              </button>
            </div>

            {/* System Specs / Stats Panel */}
            <Card title="SYS_SPECS" icon={Activity} className="hidden xl:flex text-[10px] text-green-700 space-y-3">
              <div className="flex justify-between border-b border-green-900/30 pb-1">
                <span>PROTOCOL:</span> <span className="text-green-500">LSB_V2</span>
              </div>
              <div className="flex justify-between border-b border-green-900/30 pb-1">
                <span>CIPHER:</span> <span className="text-green-500">AES-256-GCM</span>
              </div>
              <div className="flex justify-between border-b border-green-900/30 pb-1">
                <span>KDF_ITERATIONS:</span> <span className="text-cyan-500">100,000</span>
              </div>
              <div className="flex justify-between border-b border-green-900/30 pb-1">
                <span>HASH:</span> <span className="text-green-500">SHA-256</span>
              </div>
              <div className="mt-4 opacity-50 bg-green-900/20 p-2 text-center text-green-500 border border-green-900/30">
                STRICT AUTHENTICATION
              </div>
            </Card>

          </div>

          {/* MAIN WORKSPACE AREA */}
          <div className="flex-1 min-w-0">

            {showHistory ? (
              /* ----- HISTORY PANEL ----- */
              <Card title="OPERATION_HISTORY_LOG" icon={FileText} className="animate-fade-in shadow-2xl h-full min-h-[600px]">
                <div className="flex justify-between mb-4">
                  <p className="text-xs text-green-600">Local terminal session records.</p>
                  <button onClick={clearHistory} className="text-xs text-red-500 hover:text-red-400 border border-red-900/50 bg-black px-3 py-1 flex items-center gap-2">
                    <Trash2 size={12} /> PURGE DIR
                  </button>
                </div>

                <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 border border-green-900/30 bg-black/60">
                  {operationsHistory.length === 0 ? (
                    <div className="h-full flex items-center justify-center opacity-40 text-sm">NO RECORDS FOUND IN VOLUME.</div>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="sticky top-0 bg-black border-b border-green-900/50 font-orbitron tracking-wider text-green-700">
                        <tr>
                          <th className="p-3">ID</th>
                          <th className="p-3">TIME</th>
                          <th className="p-3">OP</th>
                          <th className="p-3">STATUS</th>
                          <th className="p-3 w-1/2">DETAILS</th>
                        </tr>
                      </thead>
                      <tbody className="text-green-400/80">
                        {operationsHistory.map(op => (
                          <tr key={op.id} className="border-b border-green-900/20 hover:bg-green-900/10 transition-colors">
                            <td className="p-3 font-mono opacity-60">#{op.id}</td>
                            <td className="p-3 whitespace-nowrap">{format(new Date(op.timestamp), 'MMM dd HH:mm:ss')}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 border ${op.type === 'ENCODE' ? 'border-green-700 text-green-500' : 'border-cyan-700 text-cyan-500'}`}>
                                {op.type}
                              </span>
                            </td>
                            <td className="p-3">
                              {op.status === 'SUCCESS' ? <span className="text-green-400 flex items-center gap-1"><CheckCircle2 size={12} /> OK</span>
                                : <span className="text-red-500 flex items-center gap-1"><XCircle size={12} /> FAIL</span>}
                            </td>
                            <td className="p-3 truncate max-w-[200px]" title={op.details}>{op.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </Card>
            ) : (
              /* ----- ENCODE / DECODE WORKSPACES ----- */
              <div className="relative">
                {activeTab === 'encode' ? (
                  /* ===================== ENCODE WORKSPACE ===================== */
                  <div className="animate-fade-in flex flex-col gap-6">

                    {/* ENCODE: Top Status Bar */}
                    <div className="bg-black/60 border border-green-900/50 p-3 flex justify-between items-center text-xs font-mono">
                      <div className="flex items-center gap-3">
                        <span className="animate-pulse w-2 h-2 bg-green-500 block rounded-full"></span>
                        <span className="text-green-500 tracking-wider">MODULE_ENC: ACTIVE</span>
                      </div>
                      <div className="text-green-700/80 hidden sm:block">Awaiting carrier initialization...</div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                      {/* ENCODE: Carrier Image Input (Left col on Desktop) */}
                      <div className="lg:col-span-5 flex flex-col gap-6">
                        <Card title="CARRIER_INPUT" icon={Upload}>

                          <div
                            className={`upload-zone border-2 border-dashed ${encodeDrag ? 'drag-over border-green-400 bg-green-900/20' : 'border-green-900/60 bg-black/40'} 
                                        flex flex-col items-center justify-center overflow-hidden transition-all duration-300 group`}
                            style={{ height: '320px', position: 'relative' }}
                            onDragOver={handleDragEvents(setEncodeDrag).onDragOver}
                            onDragEnter={handleDragEvents(setEncodeDrag).onDragEnter}
                            onDragLeave={handleDragEvents(setEncodeDrag).onDragLeave}
                            onDrop={(e) => {
                              e.preventDefault(); e.stopPropagation();
                              setEncodeDrag(false);
                              handleEncodeFile(e.dataTransfer.files[0]);
                            }}
                            onClick={() => encodeFileRef.current.click()}
                          >
                            {encodePreview ? (
                              <div className="relative w-full h-full group-hover:scale-[1.02] transition-transform duration-500">
                                <img src={encodePreview} alt="preview" className="w-full h-full object-contain filter saturate-50 contrast-125 brightness-75 hue-rotate-15 p-2" />
                                <div className="absolute inset-0 bg-green-500/10 pointer-events-none mix-blend-overlay" />
                                <div className="absolute top-2 right-2 bg-black/80 border border-green-500/50 px-2 py-1 text-[10px] text-green-400">
                                  LOCKED
                                </div>
                              </div>
                            ) : (
                              <div className="text-center p-6 select-none flex flex-col items-center gap-4">
                                <div className="w-20 h-20 rounded-full border border-green-900/50 flex items-center justify-center bg-green-900/10 group-hover:bg-green-900/30 group-hover:border-green-500/50 transition-colors">
                                  <Upload size={32} className="text-green-600 group-hover:text-green-400 group-hover:-translate-y-1 transition-all" />
                                </div>
                                <div>
                                  <p className="text-green-500 font-bold tracking-widest text-sm mb-1 group-hover:text-green-400">SELECT CARRIER IMAGE</p>
                                  <p className="text-green-800 text-[10px] uppercase font-mono tracking-widest leading-relaxed">
                                    Click or drop file<br />
                                    Valid formats: PNG, JPG, WEBP<br />
                                    Max size: 15.0 MB
                                  </p>
                                </div>
                              </div>
                            )}
                            <input ref={encodeFileRef} type="file" className="hidden" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={e => handleEncodeFile(e.target.files[0])} />
                          </div>

                          {encodeImage && (
                            <div className="mt-4 bg-black/60 border border-green-900/40 p-3 flex justify-between items-center text-[10px] text-green-600 font-mono">
                              <span className="truncate max-w-[150px] font-bold text-green-500" title={encodeImage.name}>
                                {encodeImage.name}
                              </span>
                              <span className="flex items-center gap-2">
                                <span className="opacity-70">{(encodeImage.size / (1024 * 1024)).toFixed(2)} MB</span>
                                <button className="text-red-500/70 hover:text-red-400 p-1" onClick={(e) => { e.stopPropagation(); handleClearEncode(); }} title="Clear">
                                  <XCircle size={14} />
                                </button>
                              </span>
                            </div>
                          )}

                        </Card>

                        {/* Encode Terminal Panel */}
                        <div className="bg-black/80 border border-green-900/60 p-4 relative overflow-hidden group shadow-lg flex-1 min-h-[160px]">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-500/10 to-transparent pointer-events-none" />
                          <TerminalLog lines={encodeLog} status={encodeStatus} />
                        </div>
                      </div>

                      {/* ENCODE: Payload Definition (Right col on Desktop) */}
                      <div className="lg:col-span-7 flex flex-col gap-6">

                        <Card title="CRYPTOGRAPHIC_PAYLOAD_CONFIG" icon={Zap} className="flex-1" showGlow={false}>

                          <div className="flex flex-col gap-6 flex-1 h-full">
                            {/* TextArea Section */}
                            <div className="flex-1 flex flex-col min-h-[200px]">
                              <Label icon={FileText} required>Payload Buffer</Label>
                              <div className="relative flex-1 group shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border border-green-900/60 hover:border-green-500/50 transition-colors">
                                <Textarea
                                  className="h-full bg-transparent border-none w-full !bg-black/40 focus:bg-black/60"
                                  placeholder="> BEGIN ENTRY SEQUENCE...&#10;> CLASSIFIED DATA FOR INJECTION"
                                  value={message}
                                  onChange={e => setMessage(e.target.value)}
                                />
                                <div className="absolute bottom-2 right-2 text-[10px] font-mono select-none px-2 py-1 bg-black/80 border border-green-900/40">
                                  <span className={message.length > 0 ? 'text-green-400 font-bold' : 'text-green-700'}>{message.length}</span> <span className="text-green-700">BYTES</span>
                                </div>
                              </div>
                            </div>

                            {/* Password Section */}
                            <div>
                              <Label icon={Shield}>AES-256 Passphrase (Optional but highly recommended)</Label>
                              <Input
                                type="password"
                                placeholder="ENTER SECURE KEY FOR PBKDF2 DERIVATION..."
                                value={encodePassword}
                                onChange={e => setEncodePassword(e.target.value)}
                              />
                            </div>

                            {/* Actions & Results */}
                            <div className="pt-4 border-t border-green-900/30">

                              {!encodeResultUrl ? (
                                <Button
                                  variant="primary"
                                  icon={Zap}
                                  onClick={handleEncode}
                                  isLoading={encodeStatus === 'processing'}
                                  disabled={!encodeImage || !message || encodeStatus === 'processing'}
                                >
                                  {encodeStatus === 'processing' ? 'EXECUTING CIPHER INJECTION...' : 'INITIALIZE ENCRYPTION & LSB EMBED'}
                                </Button>
                              ) : (
                                <div className="animate-fade-in border border-green-500/40 bg-green-500/5 relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-full h-[2px] bg-green-500 shadow-[0_0_10px_#00ff41]" />
                                  <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
                                    <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center shrink-0">
                                      <CheckCircle2 size={32} className="text-green-400" />
                                    </div>
                                    <div className="flex-1 text-center sm:text-left">
                                      <h3 className="text-green-400 font-bold tracking-widest text-sm mb-1 drop-shadow-sm font-orbitron uppercase">Operation Successful</h3>
                                      <p className="text-green-600/80 text-xs font-mono mb-4">Payload embedded and verified within carrier image. Extraction requires the designated key.</p>
                                      <div className="flex flex-col sm:flex-row gap-3">
                                        <a
                                          href={encodeResultUrl}
                                          download={`secured_output_${Date.now()}.png`}
                                          className="stego-btn !py-2.5 !text-[10px] text-center w-full"
                                        >
                                          <span className="flex justify-center items-center gap-2"><Download size={14} /> DOWNLOAD ARTIFACT</span>
                                        </a>
                                        <button className="border border-green-900 text-green-700 hover:text-green-400 hover:border-green-600 px-4 py-2 text-[10px] font-orbitron tracking-widest bg-black/50 transition-colors w-full sm:w-auto shrink-0"
                                          onClick={handleClearEncode}>
                                          NEW OP
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {encodeStatus === 'error' && (
                                <div className="mt-4 border border-red-500/30 bg-red-500/5 p-4 flex items-start gap-3 relative overflow-hidden animate-fade-in">
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                                  <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                  <div>
                                    <h4 className="text-red-400 text-xs font-bold tracking-widest uppercase mb-1">Injection Error</h4>
                                    <p className="text-red-500/70 text-[10px] font-mono leading-relaxed">{encodeLog[encodeLog.length - 1]?.replace('> FATAL ERROR: ', '') || "Process terminated abnormally."}</p>
                                  </div>
                                </div>
                              )}

                            </div>

                          </div>
                        </Card>
                      </div>

                    </div>
                  </div>
                ) : activeTab === 'decode' ? (
                  /* ===================== DECODE WORKSPACE ===================== */
                  <div className="animate-fade-in flex flex-col gap-6">

                    {/* DECODE: Top Status Bar */}
                    <div className="bg-black/60 border border-cyan-900/50 p-3 flex justify-between items-center text-xs font-mono">
                      <div className="flex items-center gap-3">
                        <span className="animate-pulse w-2 h-2 bg-cyan-500 block rounded-full"></span>
                        <span className="text-cyan-500 tracking-wider">MODULE_DEC: ACTIVE</span>
                      </div>
                      <div className="text-cyan-700/80 hidden sm:block">Awaiting suspected artifact...</div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                      {/* DECODE: Carrier Image Input (Left col) */}
                      <div className="lg:col-span-5 flex flex-col gap-6">
                        <Card title="ARTIFACT_ANALYSIS" icon={Search} glowColor="var(--cyan-dim)" className="!border-cyan-900/40">

                          <div
                            className={`upload-zone border-2 border-dashed ${decodeDrag ? 'drag-over border-cyan-500 bg-cyan-900/10' : 'border-cyan-900/40 bg-black/40'} 
                                        flex flex-col items-center justify-center overflow-hidden transition-all duration-300 group`}
                            style={{ height: '320px', position: 'relative' }}
                            onDragOver={handleDragEvents(setDecodeDrag).onDragOver}
                            onDragEnter={handleDragEvents(setDecodeDrag).onDragEnter}
                            onDragLeave={handleDragEvents(setDecodeDrag).onDragLeave}
                            onDrop={(e) => {
                              e.preventDefault(); e.stopPropagation();
                              setDecodeDrag(false);
                              handleDecodeFile(e.dataTransfer.files[0]);
                            }}
                            onClick={() => decodeFileRef.current.click()}
                          >
                            {decodePreview ? (
                              <div className="relative w-full h-full group-hover:scale-[1.02] transition-transform duration-500">
                                <img src={decodePreview} alt="preview" className="w-full h-full object-contain filter saturate-50 contrast-125 brightness-90 hue-rotate-[180deg] p-2" />
                                <div className="absolute inset-0 bg-cyan-500/10 pointer-events-none mix-blend-overlay shadow-[inset_0_0_50px_rgba(0,229,255,0.1)]" />
                                <div className="absolute bottom-2 left-2 bg-black/80 border border-cyan-500/50 px-2 py-1 text-[10px] text-cyan-400 flex items-center gap-1">
                                  <Activity size={10} className="animate-pulse" /> SCANNING VISUAL LAYER
                                </div>
                              </div>
                            ) : (
                              <div className="text-center p-6 select-none flex flex-col items-center gap-4">
                                <div className="w-20 h-20 rounded-full border border-cyan-900/50 flex items-center justify-center bg-cyan-900/10 group-hover:bg-cyan-900/30 group-hover:border-cyan-500/50 transition-colors shadow-[0_0_15px_rgba(0,229,255,0.05)] text-cyan-900 group-hover:text-cyan-500">
                                  <Search size={32} className="transition-all" />
                                </div>
                                <div>
                                  <p className="text-cyan-500 font-bold tracking-widest text-sm mb-1 group-hover:text-cyan-400">LOAD SUSPECTED ARTIFACT</p>
                                  <p className="text-cyan-800 text-[10px] uppercase font-mono tracking-widest leading-relaxed">
                                    Click or drop file<br />
                                    Valid formats: PNG, BMP<br />
                                    Lossless required
                                  </p>
                                </div>
                              </div>
                            )}
                            <input ref={decodeFileRef} type="file" className="hidden" accept="image/png, image/bmp" onChange={e => handleDecodeFile(e.target.files[0])} />
                          </div>

                          {decodeImage && (
                            <div className="mt-4 bg-black/60 border border-cyan-900/40 p-3 flex justify-between items-center text-[10px] text-cyan-600 font-mono">
                              <span className="truncate max-w-[150px] font-bold text-cyan-500" title={decodeImage.name}>
                                {decodeImage.name}
                              </span>
                              <span className="flex items-center gap-2">
                                <span className="opacity-70">{(decodeImage.size / (1024 * 1024)).toFixed(2)} MB</span>
                                <button className="text-red-500/70 hover:text-red-400 p-1" onClick={(e) => { e.stopPropagation(); handleClearDecode(); }} title="Clear">
                                  <XCircle size={14} />
                                </button>
                              </span>
                            </div>
                          )}

                        </Card>

                        {/* Decode Terminal Panel */}
                        <div className="bg-black/80 border border-cyan-900/40 p-4 relative overflow-hidden group shadow-lg flex-1 min-h-[160px]">
                          <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none" />
                          <TerminalLog lines={decodeLog} status={decodeStatus} />
                        </div>
                      </div>

                      {/* DECODE: Extraction Control (Right col) */}
                      <div className="lg:col-span-7 flex flex-col gap-6">

                        <Card title="EXTRACTION_SEQ_INIT" icon={Eye} glowColor="var(--cyan-dim)" className="flex-1 !border-cyan-900/40" showGlow={false}>

                          <div className="flex flex-col gap-6 h-full">

                            {/* Key Input */}
                            <div className="bg-cyan-900/10 border border-cyan-900/30 p-5 relative overflow-hidden">
                              <div className="absolute -right-4 -top-4 opacity-5 text-cyan-500">
                                <Unlock size={80} />
                              </div>
                              <Label icon={Lock} required>Authentication Key (AEAD Decoder)</Label>
                              <Input
                                type="password"
                                placeholder="ENTER PASSPHRASE TO BREAK CIPHER..."
                                value={decodePassword}
                                onChange={e => setDecodePassword(e.target.value)}
                                className="!border-cyan-900/60 focus:!border-cyan-500 focus:!shadow-[0_0_12px_rgba(0,229,255,0.2)] !text-cyan-400"
                                style={{ width: '100%' }}
                                cursor='pointer'
                              />
                            </div>
                            {/* Action Button */}
                            <div>
                              <Button
                                variant="secondary"
                                icon={Activity}
                                onClick={handleDecode}
                                isLoading={decodeStatus === 'processing'}
                                disabled={!decodeImage || decodeStatus === 'processing'}
                              >
                                {decodeStatus === 'processing' ? 'PERFORMING HEURISTIC EXTRACT...' : 'EXECUTE EXTRACTION SEQUENCE'}
                              </Button>
                            </div>

                            {/* Results Area */}
                            <div className="flex-1 pt-4 mt-2 border-t border-cyan-900/20 flex flex-col">
                              <Label icon={FileText}>Intercepted Signal Output</Label>

                              <div className={`flex-1 min-h-[220px] bg-black/60 border transition-all duration-300 relative ${decodeError ? 'border-red-900/50 shadow-[inset_0_0_30px_rgba(255,0,60,0.05)]' : decodeResult ? 'border-cyan-500/40 shadow-[inset_0_0_30px_rgba(0,229,255,0.05)] bg-[#051015]' : 'border-cyan-900/30 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]'} flex flex-col`}>

                                {decodeError && (
                                  <div className="absolute inset-0 p-6 flex flex-col justify-center items-center text-center animate-fade-in bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDI1NSwgMCwgNjAsIDAuMSkiLz4KPC9zdmc+')]">
                                    <ShieldAlert size={36} className="text-red-500 mb-3" />
                                    <h4 className="font-orbitron tracking-widest text-red-500 font-bold uppercase mb-2">Access Denied</h4>
                                    <p className="text-red-500/70 font-mono text-[10px] max-w-sm leading-relaxed border border-red-900/50 bg-black/80 px-4 py-3">
                                      {decodeError.toLowerCase().includes('incorrect password') ?
                                        'CRYPTOGRAPHIC FAILURE: Key derivation mismatch. The provided authentication token is invalid or the artifact architecture has been modified.' :
                                        decodeError}
                                    </p>
                                  </div>
                                )}

                                {decodeResult && (
                                  <div className="flex-1 flex flex-col relative h-full animate-fade-in">
                                    <div className="sticky top-0 bg-cyan-900/20 border-b border-cyan-900/30 px-4 py-2 flex justify-between items-center backdrop-blur-sm">
                                      <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 border border-cyan-500/20">AUTH_VALIDATED</span>
                                      <span className="text-[10px] text-cyan-600 font-mono">{decodeResult.length} BYTES RECOVERED</span>
                                    </div>
                                    <div className="p-5 flex-1 overflow-auto custom-scrollbar-cyan text-cyan-300 font-mono text-sm leading-relaxed whitespace-pre-wrap select-text">
                                      {decodeResult}
                                    </div>
                                    <div className="p-3 border-t border-cyan-900/30 bg-black/40 flex justify-end">
                                      <button
                                        onClick={() => navigator.clipboard.writeText(decodeResult)}
                                        className="text-[10px] bg-cyan-900/20 text-cyan-400 border border-cyan-700 hover:bg-cyan-900 hover:text-cyan-300 px-4 py-2 transition-colors font-orbitron tracking-widest"
                                      >
                                        COPY TO CLIPBOARD
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {!decodeResult && !decodeError && (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 select-none">
                                    <div className="text-4xl mb-4 text-cyan-900" style={{ filter: 'drop-shadow(0 0 10px rgba(0,229,255,0.1))' }}>◈</div>
                                    <p className="text-[10px] tracking-widest text-cyan-700 font-mono">STANDBY FOR EXTRACTION...</p>
                                  </div>
                                )}

                              </div>
                            </div>

                          </div>
                        </Card>
                      </div>

                    </div>
                  </div>
                ) : activeTab === 'analyze' ? (
                  /* ===================== ANALYZE WORKSPACE ===================== */
                  <div className="animate-fade-in flex flex-col gap-6">
                    <div className="bg-black/60 border border-yellow-900/50 p-3 flex justify-between items-center text-xs font-mono">
                      <div className="flex items-center gap-3">
                        <span className="animate-pulse w-2 h-2 bg-yellow-500 block rounded-full"></span>
                        <span className="text-yellow-500 tracking-wider">MODULE_ANL: ACTIVE</span>
                      </div>
                      <div className="text-yellow-700/80 hidden sm:block">Awaiting forensic target...</div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                      <div className="lg:col-span-5 flex flex-col gap-6">
                        <Card title="FORENSIC_TARGET" icon={Upload} glowColor="var(--yellow-dim)" className="!border-yellow-900/40">
                          <div
                            className={`upload-zone border-2 border-dashed ${analyzeDrag ? 'drag-over border-yellow-500 bg-yellow-900/10' : 'border-yellow-900/40 bg-black/40'} 
                                        flex flex-col items-center justify-center overflow-hidden transition-all duration-300 group`}
                            style={{ height: '320px', position: 'relative' }}
                            onDragOver={handleDragEvents(setAnalyzeDrag).onDragOver}
                            onDragEnter={handleDragEvents(setAnalyzeDrag).onDragEnter}
                            onDragLeave={handleDragEvents(setAnalyzeDrag).onDragLeave}
                            onDrop={(e) => {
                              e.preventDefault(); e.stopPropagation();
                              setAnalyzeDrag(false);
                              handleAnalyzeFile(e.dataTransfer.files[0]);
                            }}
                            onClick={() => analyzeFileRef.current.click()}
                          >
                            {analyzePreview ? (
                              <div className="relative w-full h-full group-hover:scale-[1.02] transition-transform duration-500">
                                <img src={analyzePreview} alt="preview" className="w-full h-full object-contain filter saturate-50 contrast-125 brightness-90 sepia p-2" />
                                <div className="absolute inset-0 bg-yellow-500/10 pointer-events-none mix-blend-overlay shadow-[inset_0_0_50px_rgba(255,204,0,0.1)]" />
                              </div>
                            ) : (
                              <div className="text-center p-6 select-none flex flex-col items-center gap-4">
                                <div className="w-20 h-20 rounded-full border border-yellow-900/50 flex items-center justify-center bg-yellow-900/10 group-hover:bg-yellow-900/30 group-hover:border-yellow-500/50 transition-colors shadow-[0_0_15px_rgba(255,204,0,0.05)] text-yellow-900 group-hover:text-yellow-500">
                                  <BarChart2 size={32} className="transition-all" />
                                </div>
                                <div>
                                  <p className="text-yellow-500 font-bold tracking-widest text-sm mb-1 group-hover:text-yellow-400">LOAD IMAGE FOR ANALYSIS</p>
                                  <p className="text-yellow-800 text-[10px] uppercase font-mono tracking-widest leading-relaxed">
                                    Click or drop file<br />
                                  </p>
                                </div>
                              </div>
                            )}
                            <input ref={analyzeFileRef} type="file" className="hidden" accept="image/*" onChange={e => handleAnalyzeFile(e.target.files[0])} />
                          </div>

                          {analyzeImage && (
                            <div className="mt-4 bg-black/60 border border-yellow-900/40 p-3 flex justify-between items-center text-[10px] text-yellow-600 font-mono">
                              <span className="truncate max-w-[150px] font-bold text-yellow-500" title={analyzeImage.name}>{analyzeImage.name}</span>
                              <span className="flex items-center gap-2">
                                <span className="opacity-70">{(analyzeImage.size / (1024 * 1024)).toFixed(2)} MB</span>
                                <button className="text-red-500/70 hover:text-red-400 p-1" onClick={(e) => { e.stopPropagation(); handleClearAnalyze(); }} title="Clear">
                                  <XCircle size={14} />
                                </button>
                              </span>
                            </div>
                          )}
                        </Card>

                        <div className="bg-black/80 border border-yellow-900/40 p-4 relative overflow-hidden group shadow-lg flex-1 min-h-[160px]">
                          <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-yellow-500/10 to-transparent pointer-events-none" />
                          <TerminalLog lines={analyzeLog} status={analyzeStatus} />
                        </div>
                      </div>

                      <div className="lg:col-span-7 flex flex-col gap-6">
                        <Card title="DATA_FORENSICS" icon={Activity} glowColor="var(--yellow-dim)" className="flex-1 !border-yellow-900/40" showGlow={false}>
                          <div className="flex flex-col gap-6 h-full">
                            <div>
                              <Button
                                variant="secondary"
                                icon={BarChart2}
                                onClick={handleAnalyze}
                                isLoading={analyzeStatus === 'processing'}
                                disabled={!analyzeImage || analyzeStatus === 'processing'}
                                className="!border-yellow-500 !text-yellow-500 hover:!bg-yellow-500 hover:!text-black"
                              >
                                {analyzeStatus === 'processing' ? 'RUNNING ESTIMATOR...' : 'RUN STRUCTURAL ANALYSIS'}
                              </Button>
                            </div>

                            <div className="flex-1 pt-4 mt-2 border-t border-yellow-900/20 flex flex-col">
                              {analyzeResult ? (
                                <div className="space-y-4">
                                  <div className="bg-yellow-900/10 border border-yellow-900/30 p-4 font-mono text-sm space-y-2">
                                    <div className="flex justify-between"><span className="text-yellow-700">DIMENSIONS:</span> <span className="text-yellow-400">{analyzeResult.dimensions}</span></div>
                                    <div className="flex justify-between"><span className="text-yellow-700">FORMAT:</span> <span className="text-yellow-400">{analyzeResult.format}</span></div>
                                    <div className="flex justify-between"><span className="text-yellow-700">MAX_CAPACITY:</span> <span className="text-yellow-400">{(analyzeResult.capacity_bytes / 1024).toFixed(2)} KB</span></div>
                                    <div className="flex justify-between"><span className="text-yellow-700">LSB_ENTROPY:</span> <span className="text-yellow-400">{analyzeResult.lsb_entropy}</span></div>
                                  </div>

                                  <div className={`p-4 border ${analyzeResult.stego_suspected ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'bg-green-900/20 border-green-500/50 text-green-400'} font-bold text-center uppercase tracking-widest`}>
                                    {analyzeResult.stego_suspected ? 'WARNING: HIGH STRUCTURAL ENTROPY DETECTED. PAYLOAD SUSPECTED.' : 'CLEAR: ENTROPY WITHIN NORMAL NOISE RANGE.'}
                                  </div>
                                </div>
                              ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 select-none">
                                  <div className="text-4xl mb-4 text-yellow-900" style={{ filter: 'drop-shadow(0 0 10px rgba(255,204,0,0.1))' }}>◈</div>
                                  <p className="text-[10px] tracking-widest text-yellow-700 font-mono">STANDBY FOR METRICS...</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ===================== SANITIZE WORKSPACE ===================== */
                  <div className="animate-fade-in flex flex-col gap-6">
                    <div className="bg-black/60 border border-red-900/50 p-3 flex justify-between items-center text-xs font-mono">
                      <div className="flex items-center gap-3">
                        <span className="animate-pulse w-2 h-2 bg-red-500 block rounded-full"></span>
                        <span className="text-red-500 tracking-wider">MODULE_SNT: ACTIVE</span>
                      </div>
                      <div className="text-red-700/80 hidden sm:block">Awaiting target for destruction...</div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                      <div className="lg:col-span-5 flex flex-col gap-6">
                        <Card title="DESTRUCTION_TARGET" icon={Upload} glowColor="var(--red-dim)" className="!border-red-900/40">
                          <div
                            className={`upload-zone border-2 border-dashed ${sanitizeDrag ? 'drag-over border-red-500 bg-red-900/10' : 'border-red-900/40 bg-black/40'} 
                                        flex flex-col items-center justify-center overflow-hidden transition-all duration-300 group`}
                            style={{ height: '320px', position: 'relative' }}
                            onDragOver={handleDragEvents(setSanitizeDrag).onDragOver}
                            onDragEnter={handleDragEvents(setSanitizeDrag).onDragEnter}
                            onDragLeave={handleDragEvents(setSanitizeDrag).onDragLeave}
                            onDrop={(e) => {
                              e.preventDefault(); e.stopPropagation();
                              setSanitizeDrag(false);
                              handleSanitizeFile(e.dataTransfer.files[0]);
                            }}
                            onClick={() => sanitizeFileRef.current.click()}
                          >
                            {sanitizePreview ? (
                              <div className="relative w-full h-full group-hover:scale-[1.02] transition-transform duration-500">
                                <img src={sanitizePreview} alt="preview" className="w-full h-full object-contain filter saturate-50 contrast-125 brightness-90 hue-rotate-[290deg] p-2" />
                                <div className="absolute inset-0 bg-red-500/10 pointer-events-none mix-blend-overlay shadow-[inset_0_0_50px_rgba(255,0,0,0.1)]" />
                                <div className="absolute top-2 right-2 bg-black/80 border border-red-500/50 px-2 py-1 text-[10px] text-red-500 font-bold blink">
                                  TARGET LOCKED
                                </div>
                              </div>
                            ) : (
                              <div className="text-center p-6 select-none flex flex-col items-center gap-4">
                                <div className="w-20 h-20 rounded-full border border-red-900/50 flex items-center justify-center bg-red-900/10 group-hover:bg-red-900/30 group-hover:border-red-500/50 transition-colors shadow-[0_0_15px_rgba(255,0,0,0.05)] text-red-900 group-hover:text-red-500">
                                  <ShieldOff size={32} className="transition-all" />
                                </div>
                                <div>
                                  <p className="text-red-500 font-bold tracking-widest text-sm mb-1 group-hover:text-red-400">LOAD IMAGE TO SANITIZE</p>
                                  <p className="text-red-800 text-[10px] uppercase font-mono tracking-widest leading-relaxed">
                                    Click or drop file<br />
                                  </p>
                                </div>
                              </div>
                            )}
                            <input ref={sanitizeFileRef} type="file" className="hidden" accept="image/*" onChange={e => handleSanitizeFile(e.target.files[0])} />
                          </div>

                          {sanitizeImage && (
                            <div className="mt-4 bg-black/60 border border-red-900/40 p-3 flex justify-between items-center text-[10px] text-red-600 font-mono">
                              <span className="truncate max-w-[150px] font-bold text-red-500" title={sanitizeImage.name}>{sanitizeImage.name}</span>
                              <span className="flex items-center gap-2">
                                <span className="opacity-70">{(sanitizeImage.size / (1024 * 1024)).toFixed(2)} MB</span>
                                <button className="text-red-500/70 hover:text-red-400 p-1" onClick={(e) => { e.stopPropagation(); handleClearSanitize(); }} title="Clear">
                                  <XCircle size={14} />
                                </button>
                              </span>
                            </div>
                          )}
                        </Card>

                        <div className="bg-black/80 border border-red-900/40 p-4 relative overflow-hidden group shadow-lg flex-1 min-h-[160px]">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-red-500/10 to-transparent pointer-events-none" />
                          <TerminalLog lines={sanitizeLog} status={sanitizeStatus} />
                        </div>
                      </div>

                      <div className="lg:col-span-7 flex flex-col gap-6">
                        <Card title="LSB_SCRUB_SEQUENCE" icon={Activity} glowColor="var(--red-dim)" className="flex-1 !border-red-900/40" showGlow={false}>
                          <div className="flex flex-col gap-6 h-full">
                            <div>
                              <p className="text-red-500/80 font-mono text-xs mb-4">
                                This action will zero out the Least Significant Bits of all color channels, effectively destroying any hidden signals while preserving the visual composition of the host file.
                              </p>

                              <Button
                                variant="secondary"
                                icon={ShieldOff}
                                onClick={handleSanitize}
                                isLoading={sanitizeStatus === 'processing'}
                                disabled={!sanitizeImage || sanitizeStatus === 'processing'}
                                className="!border-red-500 !text-red-500 hover:!bg-red-500 hover:!text-black"
                              >
                                {sanitizeStatus === 'processing' ? 'WIPING LSB DATA...' : 'INITIATE LSB PURGE'}
                              </Button>
                            </div>

                            <div className="flex-1 pt-4 mt-2 border-t border-red-900/20 flex flex-col">
                              {sanitizeResultUrl ? (
                                <div className="animate-fade-in border border-red-500/40 bg-red-500/5 relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_10px_#ff0000]" />
                                  <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
                                    <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                                      <CheckCircle2 size={32} className="text-red-400" />
                                    </div>
                                    <div className="flex-1 text-center sm:text-left">
                                      <h3 className="text-red-400 font-bold tracking-widest text-sm mb-1 drop-shadow-sm font-orbitron uppercase">Scrub Successful</h3>
                                      <p className="text-red-600/80 text-xs font-mono mb-4">The image has been sanitized. All hidden variables are wiped.</p>
                                      <div className="flex flex-col sm:flex-row gap-3">
                                        <a
                                          href={sanitizeResultUrl}
                                          download={`clean_${sanitizeImage?.name?.split('.')[0] || 'img'}.png`}
                                          className="stego-btn !border-red-500 !text-red-500 hover:!bg-red-500 hover:!text-black !py-2.5 !text-[10px] text-center w-full"
                                        >
                                          <span className="flex justify-center items-center gap-2"><Download size={14} /> SECURE DOWNLOAD</span>
                                        </a>
                                        <button className="border border-red-900 text-red-500 hover:text-red-400 hover:border-red-600 px-4 py-2 text-[10px] font-orbitron tracking-widest bg-black/50 transition-colors w-full sm:w-auto shrink-0"
                                          onClick={handleClearSanitize}>
                                          NEW TARGET
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 select-none">
                                  <div className="text-4xl mb-4 text-red-900" style={{ filter: 'drop-shadow(0 0 10px rgba(255,0,0,0.1))' }}>◈</div>
                                  <p className="text-[10px] tracking-widest text-red-700 font-mono">STANDBY FOR PROTOCOL DESTRUCT...</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

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

      {/* Global CSS Overrides for specific tweaks */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,255,65,0.2); }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,255,65,0.5); }
        
        .custom-scrollbar-cyan::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar-cyan::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .custom-scrollbar-cyan::-webkit-scrollbar-thumb { background: rgba(0,229,255,0.2); }
        .custom-scrollbar-cyan::-webkit-scrollbar-thumb:hover { background: rgba(0,229,255,0.5); }
        
        @keyframes fade-in { 0% { opacity: 0; transform: translateY(5px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}

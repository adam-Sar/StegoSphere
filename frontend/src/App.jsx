import { useState, useRef, useEffect } from 'react';

// ---------- Matrix Rain Canvas ----------
function MatrixRain() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
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
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    return () => { clearInterval(interval); window.removeEventListener('resize', handleResize); };
  }, []);
  return <canvas ref={canvasRef} id="matrix-canvas" style={{ position: 'fixed', top: 0, left: 0, zIndex: 0, opacity: 0.08, pointerEvents: 'none' }} />;
}

// ---------- Animated terminal log ----------
function TerminalLog({ lines }) {
  return (
    <div className="font-mono text-xs text-green-600 space-y-0.5 px-1">
      {lines.map((l, i) => <div key={i}><span className="text-green-700 mr-2">[{String(i).padStart(2, '0')}]</span>{l}</div>)}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('encode');

  // Encode State
  const [encodeImage, setEncodeImage] = useState(null);
  const [encodePreview, setEncodePreview] = useState(null);
  const [message, setMessage] = useState('');
  const [encodePassword, setEncodePassword] = useState('');
  const [isEncoding, setIsEncoding] = useState(false);
  const [encodeResult, setEncodeResult] = useState(null);
  const [encodeLog, setEncodeLog] = useState([]);
  const [encodeDrag, setEncodeDrag] = useState(false);

  // Decode State
  const [decodeImage, setDecodeImage] = useState(null);
  const [decodePreview, setDecodePreview] = useState(null);
  const [decodePassword, setDecodePassword] = useState('');
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodeResult, setDecodeResult] = useState('');
  const [decodeError, setDecodeError] = useState('');
  const [decodeLog, setDecodeLog] = useState([]);
  const [decodeDrag, setDecodeDrag] = useState(false);

  const encodeFileRef = useRef();
  const decodeFileRef = useRef();

  const pushLog = (setter, line) => setter(prev => [...prev.slice(-6), line]);

  const handleEncodeFile = (file) => {
    if (!file) return;
    setEncodeImage(file);
    setEncodePreview(URL.createObjectURL(file));
    setEncodeResult(null);
    pushLog(setEncodeLog, `> IMAGE LOADED: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
  };

  const handleDecodeFile = (file) => {
    if (!file) return;
    setDecodeImage(file);
    setDecodePreview(URL.createObjectURL(file));
    setDecodeResult(''); setDecodeError('');
    pushLog(setDecodeLog, `> STEGO-IMAGE LOADED: ${file.name}`);
  };

  // drag and drop helpers
  const makeDrop = (handler, setDrag) => ({
    onDragOver: (e) => { e.preventDefault(); setDrag(true); },
    onDragLeave: () => setDrag(false),
    onDrop: (e) => { e.preventDefault(); setDrag(false); handler(e.dataTransfer.files[0]); },
    onClick: () => { },
  });

  const handleEncode = async () => {
    if (!encodeImage || !message) { pushLog(setEncodeLog, '> ERR: Missing image or message payload'); return; }
    setIsEncoding(true); setEncodeResult(null);
    pushLog(setEncodeLog, '> INIT AES-256-GCM cipher...');
    pushLog(setEncodeLog, '> PBKDF2 key derivation (100k iterations)...');
    const formData = new FormData();
    formData.append('file', encodeImage);
    formData.append('message', message);
    formData.append('password', encodePassword);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/encode', { method: 'POST', body: formData });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail); }
      const blob = await res.blob();
      setEncodeResult(URL.createObjectURL(blob));
      pushLog(setEncodeLog, `> LSB EMBED COMPLETE — payload secured`);
      pushLog(setEncodeLog, `> OUTPUT: stego_${encodeImage.name.split('.')[0]}.png`);
    } catch (err) {
      pushLog(setEncodeLog, `> FATAL: ${err.message}`);
    } finally { setIsEncoding(false); }
  };

  const handleDecode = async () => {
    if (!decodeImage) { pushLog(setDecodeLog, '> ERR: No stego-image selected'); return; }
    setIsDecoding(true); setDecodeResult(''); setDecodeError('');
    pushLog(setDecodeLog, '> SCANNING LSB channels...');
    pushLog(setDecodeLog, '> AUTHENTICATING AEAD tag...');
    const formData = new FormData();
    formData.append('file', decodeImage);
    formData.append('password', decodePassword);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/decode', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setDecodeResult(data.message);
      pushLog(setDecodeLog, '> AUTH OK — plaintext recovered');
    } catch (err) {
      setDecodeError(err.message);
      pushLog(setDecodeLog, `> AUTH FAILED: ${err.message}`);
    } finally { setIsDecoding(false); }
  };

  return (
    <div className="min-h-screen hex-bg relative" style={{ zIndex: 1 }}>
      <MatrixRain />

      {/* noise vignette */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)', pointerEvents: 'none', zIndex: 1 }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">

        {/* ---- HEADER ---- */}
        <header className="text-center mb-10">
          <div className="inline-block relative mb-2">
            <p className="text-xs tracking-[0.5em] text-green-700 mb-3 uppercase">// classified signal v2.1.0</p>
            <h1
              className="glitch text-5xl md:text-7xl font-black uppercase"
              data-text="StegoSphere"
              style={{ fontFamily: 'Orbitron, monospace', color: '#00ff41', textShadow: '0 0 30px rgba(0,255,65,0.6), 0 0 60px rgba(0,255,65,0.3)' }}
            >
              StegoSphere
            </h1>
          </div>
          <p className="text-green-600 tracking-widest text-sm mt-3 font-mono">
            [ LSB STEGANOGRAPHY &nbsp;+&nbsp; AES-256-GCM AEAD ENCRYPTION ]
          </p>

          {/* status bar */}
          <div className="flex justify-center gap-8 mt-5 text-xs font-mono">
            <span className="status-ok">● BACKEND ONLINE</span>
            <span className="status-ok">● AEAD ENGINE READY</span>
            <span style={{ color: '#00e5ff' }}>● CHANNEL SECURE</span>
          </div>
        </header>

        {/* ---- TABS ---- */}
        <div className="flex justify-center gap-2 mb-8">
          <button className={`tab-btn ${activeTab === 'encode' ? 'active' : ''}`} onClick={() => setActiveTab('encode')}>
            ⬛ ENCODE
          </button>
          <button className={`tab-btn stego-btn-cyan ${activeTab === 'decode' ? 'active' : ''}`} style={activeTab === 'decode' ? { background: 'rgba(0,229,255,0.08)', borderColor: 'var(--cyan-dim)', color: 'var(--cyan)', boxShadow: '0 0 15px rgba(0,229,255,0.3)' } : {}} onClick={() => setActiveTab('decode')}>
            ▷ DECODE
          </button>
        </div>

        {/* ---- MAIN PANEL ---- */}
        <div className="neon-border corner-deco" style={{ background: 'rgba(5,15,5,0.85)', backdropFilter: 'blur(8px)' }}>

          {/* top chrome bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-green-900/50">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#ff3b30' }} />
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#ffcc00' }} />
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#28cd41' }} />
            </div>
            <span className="text-xs text-green-700 font-mono tracking-widest">
              {activeTab === 'encode' ? 'EMBED_PAYLOAD.exe' : 'EXTRACT_SIGNAL.exe'}
            </span>
            <span className="text-xs text-green-800 font-mono blink">■</span>
          </div>

          <div className="p-6 md:p-8">
            {activeTab === 'encode' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* LEFT — Image Upload */}
                <div className="flex flex-col gap-4">
                  <label className="text-xs tracking-widest text-green-600 uppercase font-mono">// target carrier image</label>
                  <div
                    className={`upload-zone corner-deco flex flex-col items-center justify-center overflow-hidden`}
                    style={{ height: '280px', position: 'relative' }}
                    {...makeDrop(handleEncodeFile, setEncodeDrag)}
                    onClick={() => encodeFileRef.current.click()}
                  >
                    {encodePreview ? (
                      <img src={encodePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'saturate(0.3) brightness(0.8) hue-rotate(90deg)' }} />
                    ) : (
                      <div className="text-center p-6 select-none">
                        <div className="text-5xl mb-4" style={{ filter: 'drop-shadow(0 0 10px #00ff41)' }}>⬛</div>
                        <p className="text-green-500 text-sm tracking-widest">DRAG &amp; DROP / CLICK TO LOAD</p>
                        <p className="text-green-800 text-xs mt-2">SUPPORTED: PNG · JPG · WEBP</p>
                      </div>
                    )}
                    {encodeDrag && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,255,65,0.07)', border: '2px solid #00ff41', pointerEvents: 'none' }} />}
                    <input ref={encodeFileRef} type="file" className="hidden" accept="image/*" onChange={e => handleEncodeFile(e.target.files[0])} />
                  </div>

                  {encodeImage && (
                    <div className="text-xs font-mono text-green-700 border border-green-900 px-3 py-2">
                      <span className="text-green-500">FILE://</span> {encodeImage.name} &nbsp;|&nbsp; {(encodeImage.size / 1024).toFixed(1)} KB
                    </div>
                  )}

                  {/* Terminal log */}
                  <div className="border border-green-900/60 p-3" style={{ background: 'rgba(0,0,0,0.5)', minHeight: '80px' }}>
                    <div className="text-xs text-green-800 mb-2 tracking-widest">SYSTEM LOG &gt;</div>
                    <TerminalLog lines={encodeLog} />
                    {isEncoding && <div className="progress-bar mt-2" />}
                  </div>
                </div>

                {/* RIGHT — Message + Password */}
                <div className="flex flex-col gap-5">
                  <div>
                    <label className="text-xs tracking-widest text-green-600 uppercase font-mono block mb-2">// payload message</label>
                    <textarea
                      className="stego-textarea"
                      rows={7}
                      placeholder="> ENTER CLASSIFIED MESSAGE FOR EMBEDDING..."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                    />
                    <div className="text-right text-xs text-green-800 font-mono mt-1">{message.length} bytes</div>
                  </div>

                  <div>
                    <label className="text-xs tracking-widest text-green-600 uppercase font-mono block mb-2">// aes-256-gcm passphrase</label>
                    <div className="relative">
                      <input type="password" className="stego-input pl-8" placeholder="PASSPHRASE FOR PBKDF2 KEY DERIVATION..." value={encodePassword} onChange={e => setEncodePassword(e.target.value)} />
                    </div>
                  </div>

                  <button className="stego-btn" onClick={handleEncode} disabled={isEncoding}>
                    <span>{isEncoding ? '[ EMBEDDING... ]' : '[ ENCRYPT & EMBED PAYLOAD ]'}</span>
                  </button>

                  {encodeResult && (
                    <div className="border border-green-700 p-4 text-center" style={{ background: 'rgba(0,255,65,0.04)' }}>
                      <div className="text-xs text-green-600 mb-3 tracking-widest">// OPERATION COMPLETE</div>
                      <p className="text-green-400 text-sm mb-4">✓ PAYLOAD EMBEDDED SUCCESSFULLY</p>
                      <a
                        href={encodeResult}
                        download={`stego_${encodeImage?.name?.split('.')[0]}.png`}
                        className="stego-btn inline-block text-center"
                        style={{ textDecoration: 'none', display: 'block', width: '100%' }}
                      >
                        <span>[ DOWNLOAD SECURED IMAGE ]</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ===================== DECODE TAB ===================== */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* LEFT — Image Upload */}
                <div className="flex flex-col gap-4">
                  <label className="text-xs tracking-widest" style={{ color: 'var(--cyan)', fontFamily: 'monospace' }}>// stego-image input</label>
                  <div
                    className="upload-zone corner-deco flex flex-col items-center justify-center overflow-hidden"
                    style={{ height: '280px', position: 'relative', borderColor: 'var(--border)' }}
                    {...makeDrop(handleDecodeFile, setDecodeDrag)}
                    onClick={() => decodeFileRef.current.click()}
                  >
                    {decodePreview ? (
                      <img src={decodePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'saturate(0.3) brightness(0.8) hue-rotate(160deg)' }} />
                    ) : (
                      <div className="text-center p-6 select-none">
                        <div className="text-5xl mb-4" style={{ filter: 'drop-shadow(0 0 10px var(--cyan))' }}>▱</div>
                        <p className="text-sm tracking-widest" style={{ color: 'var(--cyan-dim)' }}>DRAG &amp; DROP STEGO-IMAGE</p>
                        <p className="text-xs mt-2" style={{ color: 'var(--text-dim)' }}>PNG · BMP ONLY (LOSSLESS)</p>
                      </div>
                    )}
                    {decodeDrag && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,229,255,0.05)', border: '2px solid var(--cyan)', pointerEvents: 'none' }} />}
                    <input ref={decodeFileRef} type="file" className="hidden" accept="image/png,image/bmp" onChange={e => handleDecodeFile(e.target.files[0])} />
                  </div>

                  {decodeImage && (
                    <div className="text-xs font-mono border px-3 py-2" style={{ color: 'var(--cyan-dim)', borderColor: 'rgba(0,229,255,0.15)' }}>
                      <span style={{ color: 'var(--cyan)' }}>FILE://</span> {decodeImage.name}
                    </div>
                  )}

                  {/* Terminal log */}
                  <div className="border p-3" style={{ background: 'rgba(0,0,0,0.5)', minHeight: '80px', borderColor: 'rgba(0,229,255,0.1)' }}>
                    <div className="text-xs mb-2 tracking-widest" style={{ color: 'rgba(0,229,255,0.4)' }}>ANALYSIS LOG &gt;</div>
                    <TerminalLog lines={decodeLog} />
                    {isDecoding && <div className="progress-bar mt-2" style={{ background: 'linear-gradient(90deg, var(--cyan), var(--green))' }} />}
                  </div>
                </div>

                {/* RIGHT — Password + Result */}
                <div className="flex flex-col gap-5">
                  <div>
                    <label className="text-xs tracking-widest block mb-2" style={{ color: 'var(--cyan-dim)', fontFamily: 'monospace' }}>// decryption passphrase</label>
                    <div className="relative">
                      <input type="password" className="stego-input pl-8" style={{ borderColor: 'rgba(0,229,255,0.2)', color: 'var(--cyan)' }} placeholder="PROVIDE PASSPHRASE TO AUTHENTICATE AEAD..." value={decodePassword} onChange={e => setDecodePassword(e.target.value)} />
                    </div>
                  </div>

                  <button className="stego-btn stego-btn-cyan" onClick={handleDecode} disabled={isDecoding}>
                    <span>{isDecoding ? '[ SCANNING CHANNELS... ]' : '[ EXTRACT EMBEDDED SIGNAL ]'}</span>
                  </button>

                  {/* Error */}
                  {decodeError && (
                    <div className="border px-4 py-3" style={{ borderColor: 'rgba(255,0,60,0.4)', background: 'rgba(255,0,60,0.05)' }}>
                      <div className="text-xs mb-1 tracking-widest" style={{ color: 'rgba(255,0,60,0.6)' }}>// AUTHENTICATION ERROR</div>
                      <p className="text-xs font-mono" style={{ color: '#ff003c' }}>{decodeError}</p>
                    </div>
                  )}

                  {/* Success */}
                  {decodeResult && (
                    <div className="border flex-1 flex flex-col" style={{ borderColor: 'rgba(0,255,65,0.25)', background: 'rgba(0,255,65,0.03)' }}>
                      <div className="px-4 py-2 border-b text-xs tracking-widest" style={{ borderColor: 'rgba(0,255,65,0.15)', color: 'var(--green-dim)' }}>
                        // DECRYPTED PAYLOAD
                      </div>
                      <pre className="px-4 py-4 text-sm flex-1 overflow-auto whitespace-pre-wrap" style={{ color: '#a6e3a1', fontFamily: "'Share Tech Mono', monospace" }}>{decodeResult}</pre>
                    </div>
                  )}

                  {!decodeResult && !decodeError && (
                    <div className="border flex-1 flex items-center justify-center" style={{ minHeight: '160px', borderColor: 'var(--border)', background: 'rgba(0,0,0,0.3)' }}>
                      <div className="text-center">
                        <div className="text-3xl mb-3" style={{ filter: 'drop-shadow(0 0 8px var(--green-dim))' }}>◈</div>
                        <p className="text-xs tracking-widest" style={{ color: 'var(--text-dim)' }}>AWAITING EXTRACTION...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ---- FOOTER ---- */}
        <footer className="text-center mt-8 pb-4">
          <div className="flex justify-center items-center gap-6 text-xs font-mono" style={{ color: 'var(--text-dim)' }}>
            <span>LSB-STEGANOGRAPHY</span>
            <span style={{ color: 'var(--border)' }}>|</span>
            <span>AES-256-GCM</span>
            <span style={{ color: 'var(--border)' }}>|</span>
            <span>PBKDF2-SHA256</span>
            <span style={{ color: 'var(--border)' }}>|</span>
            <span>FASTAPI</span>
          </div>
          <p className="text-xs mt-2" style={{ color: 'rgba(0,255,65,0.15)' }}>// StegoSphere Pro — signals hidden in plain sight</p>
        </footer>
      </div>
    </div>
  );
}

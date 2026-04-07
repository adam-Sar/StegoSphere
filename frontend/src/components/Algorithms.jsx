import { useState } from 'react';
import { Lock, Shield, Activity, Hash, Zap, Eye, ChevronDown, ChevronUp, Code, Terminal } from 'lucide-react';

const AlgorithmSection = ({ 
  title, 
  icon: Icon, 
  color = 'green', 
  children, 
  isOpen, 
  onToggle 
}) => {
  const colorMap = {
    green: 'border-green-500 text-green-400',
    cyan: 'border-cyan-500 text-cyan-400',
    yellow: 'border-yellow-500 text-yellow-400',
    purple: 'border-purple-500 text-purple-400',
  };

  const colors = colorMap[color];

  return (
    <div className="border border-green-900/50 bg-black/40 rounded-sm overflow-hidden transition-all duration-300">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 hover:bg-green-900/20 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg border ${colors} bg-opacity-10`}>
            <Icon size={24} className={colors} />
          </div>
          <h3 className={`text-lg font-bold font-orbitron tracking-widest uppercase ${colors}`}>
            {title}
          </h3>
        </div>
        {isOpen ? <ChevronUp size={20} className="text-green-700" /> : <ChevronDown size={20} className="text-green-700" />}
      </button>
      
      {isOpen && (
        <div className="p-6 border-t border-green-900/30 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

const CodeBlock = ({ code, language = 'python' }) => (
  <div className="relative bg-black/80 border border-green-900/50 rounded-sm overflow-hidden my-4">
    <div className="flex items-center justify-between px-4 py-2 bg-green-900/20 border-b border-green-900/30">
      <div className="flex items-center gap-2">
        <Code size={14} className="text-green-600" />
        <span className="text-xs text-green-600 font-mono">{language}</span>
      </div>
      <div className="flex gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#ff3b30]" />
        <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#ffcc00]" />
        <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#28cd41]" />
      </div>
    </div>
    <pre className="p-4 overflow-x-auto text-xs text-green-400 font-mono whitespace-pre">
      <code>{code}</code>
    </pre>
  </div>
);

export default function Algorithms() {
  const [openSections, setOpenSections] = useState(['lsb', 'aes']);

  const toggleSection = (id) => {
    setOpenSections(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen hex-bg relative pb-20 font-mono" style={{ backgroundColor: 'var(--bg)' }}>
      
      {/* Header */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 xl:px-10 py-10">
        <div className="flex justify-between items-start mb-10 border-b border-green-900/50 pb-6">
          <div className="flex gap-4">
            <div className="hidden sm:block">
              <div className="w-16 h-16 border border-cyan-500/50 flex items-center justify-center bg-cyan-500/5 relative overflow-hidden">
                <Terminal size={28} className="text-cyan-500 relative z-10" />
                <div className="absolute inset-0 bg-cyan-500/10 animate-pulse" />
              </div>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.5em] text-cyan-700/80 mb-1 uppercase drop-shadow-sm">// technical_documentation</p>
              <h1
                className="glitch text-4xl sm:text-5xl font-black uppercase leading-none"
                data-text="ALGORITHMS"
                style={{ fontFamily: 'Orbitron, monospace', color: '#00e5ff', textShadow: '0 0 20px rgba(0,229,255,0.4), 0 0 40px rgba(0,229,255,0.2)' }}
              >
                ALGORITHMS
              </h1>
              <p className="text-cyan-600/80 tracking-widest text-xs mt-1 font-mono">
                [ STEGOSPHERE CRYPTOGRAPHIC ENGINE SPECIFICATIONS ]
              </p>
            </div>
          </div>
        </div>

        {/* Overview */}
        <div className="mb-12 p-6 bg-cyan-900/10 border border-cyan-900/30 rounded-sm">
          <h2 className="text-sm font-bold text-cyan-400 font-orbitron tracking-widest uppercase mb-4 flex items-center gap-2">
            <Shield size={16} />
            System Overview
          </h2>
          <p className="text-xs text-green-600 font-mono leading-relaxed mb-4">
            StegoSphere_v3 implements a multi-layered security architecture combining state-of-the-art steganography and cryptography. The system operates through four distinct processing phases:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-black/40 border border-green-900/30 rounded-sm">
              <div className="text-2xl font-black text-green-400 mb-1">01</div>
              <div className="text-[10px] text-green-600 uppercase tracking-widest">Message Encryption</div>
            </div>
            <div className="p-4 bg-black/40 border border-cyan-900/30 rounded-sm">
              <div className="text-2xl font-black text-cyan-400 mb-1">02</div>
              <div className="text-[10px] text-cyan-600 uppercase tracking-widest">LSB Embedding</div>
            </div>
            <div className="p-4 bg-black/40 border border-yellow-900/30 rounded-sm">
              <div className="text-2xl font-black text-yellow-400 mb-1">03</div>
              <div className="text-[10px] text-yellow-600 uppercase tracking-widest">Carrier Encoding</div>
            </div>
            <div className="p-4 bg-black/40 border border-purple-900/30 rounded-sm">
              <div className="text-2xl font-black text-purple-400 mb-1">04</div>
              <div className="text-[10px] text-purple-600 uppercase tracking-widest">Verification</div>
            </div>
          </div>
        </div>

        {/* Algorithm Sections */}
        <div className="space-y-6">
          
          {/* LSB Steganography */}
          <AlgorithmSection 
            title="LSB Steganography" 
            icon={Eye}
            color="green"
            isOpen={openSections.includes('lsb')}
            onToggle={() => toggleSection('lsb')}
          >
            <div className="space-y-4">
              <p className="text-xs text-green-600 font-mono leading-relaxed">
                <strong className="text-green-400">Least Significant Bit (LSB)</strong> is the most widely used steganographic technique. It works by modifying the least significant bit of each pixel's color channel (R, G, B), which changes the visual representation by less than 1% - imperceptible to human vision.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-green-900/10 border border-green-900/30 rounded-sm">
                  <h4 className="text-xs font-bold text-green-400 font-orbitron tracking-widest uppercase mb-2">Advantages</h4>
                  <ul className="text-[10px] text-green-600 space-y-1 font-mono">
                    <li>▸ Near-perfect invisibility</li>
                    <li>▸ Large payload capacity (~1.5MB per 1920x1080)</li>
                    <li>▸ Reversible (lossless) operation</li>
                    <li>▸ Works with PNG, BMP formats</li>
                  </ul>
                </div>
                <div className="p-4 bg-yellow-900/10 border border-yellow-900/30 rounded-sm">
                  <h4 className="text-xs font-bold text-yellow-400 font-orbitron tracking-widest uppercase mb-2">Limitations</h4>
                  <ul className="text-[10px] text-yellow-600 space-y-1 font-mono">
                    <li>▸ Vulnerable to statistical analysis</li>
                    <li>▸ Destroyed by image compression</li>
                    <li>▸ Resizing corrupts payload</li>
                    <li>▸ Requires lossless image formats</li>
                  </ul>
                </div>
              </div>

              <CodeBlock language="python" code={`# LSB Encoding Pseudocode
def lsb_embed(carrier_pixels, message_bits):
    output = carrier_pixels.copy()
    bit_index = 0
    
    for i in range(len(output)):
        for channel in [R, G, B]:
            if bit_index < len(message_bits):
                # Clear LSB and embed bit
                output[i][channel] = (output[i][channel] & 0xFE) | message_bits[bit_index]
                bit_index += 1
                
    return output

# LSB Decoding Pseudocode
def lsb_extract(stego_pixels):
    message_bits = []
    
    for pixel in stego_pixels:
        for channel in [R, G, B]:
            # Extract LSB
            message_bits.append(pixel[channel] & 0x01)
            
    return message_bits
`} />
            </div>
          </AlgorithmSection>

          {/* AES-256-GCM */}
          <AlgorithmSection 
            title="AES-256-GCM Encryption" 
            icon={Lock}
            color="cyan"
            isOpen={openSections.includes('aes')}
            onToggle={() => toggleSection('aes')}
          >
            <div className="space-y-4">
              <p className="text-xs text-cyan-600 font-mono leading-relaxed">
                <strong className="text-cyan-400">Advanced Encryption Standard - Galois/Counter Mode</strong> provides authenticated encryption with associated data (AEAD). This ensures both confidentiality (encryption) and integrity (authentication) of the hidden message.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-cyan-900/10 border border-cyan-900/30 rounded-sm text-center">
                  <div className="text-3xl font-black text-cyan-400 mb-1">256</div>
                  <div className="text-[10px] text-cyan-600 uppercase tracking-widest">Key Size (bits)</div>
                </div>
                <div className="p-4 bg-cyan-900/10 border border-cyan-900/30 rounded-sm text-center">
                  <div className="text-3xl font-black text-cyan-400 mb-1">128</div>
                  <div className="text-[10px] text-cyan-600 uppercase tracking-widest">Block Size (bits)</div>
                </div>
                <div className="p-4 bg-cyan-900/10 border border-cyan-900/30 rounded-sm text-center">
                  <div className="text-3xl font-black text-cyan-400 mb-1">16</div>
                  <div className="text-[10px] text-cyan-600 uppercase tracking-widest">Auth Tag (bytes)</div>
                </div>
              </div>

              <div className="p-4 bg-cyan-900/10 border border-cyan-900/30 rounded-sm">
                <h4 className="text-xs font-bold text-cyan-400 font-orbitron tracking-widest uppercase mb-2">Authentication Tag</h4>
                <p className="text-[10px] text-cyan-600 font-mono leading-relaxed">
                  AES-GCM produces a 128-bit authentication tag that's embedded with the encrypted message. During decryption, this tag verifies that the message hasn't been tampered with. If the tag verification fails, the decryption is rejected.
                </p>
              </div>

              <CodeBlock language="python" code={`from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# Encrypt message with AES-256-GCM
def encrypt_message(message: str, key: bytes) -> tuple:
    cipher = AESGCM(key)
    nonce = os.urandom(12)  # 96-bit nonce for GCM
    
    # Encrypt and authenticate
    ciphertext = cipher.encrypt(nonce, message.encode(), None)
    
    # Extract ciphertext and auth tag (last 16 bytes)
    encrypted_data = ciphertext[:-16]
    auth_tag = ciphertext[-16:]
    
    return nonce, encrypted_data, auth_tag

# Decrypt message with AES-256-GCM
def decrypt_message(nonce: bytes, ciphertext: bytes, 
                   auth_tag: bytes, key: bytes) -> str:
    cipher = AESGCM(key)
    
    # Decrypt and verify authentication
    message = cipher.decrypt(nonce, ciphertext + auth_tag, None)
    
    return message.decode()
`} />
            </div>
          </AlgorithmSection>

          {/* PBKDF2 Key Derivation */}
          <AlgorithmSection 
            title="PBKDF2-SHA256 Key Derivation" 
            icon={Hash}
            color="yellow"
            isOpen={openSections.includes('pbkdf2')}
            onToggle={() => toggleSection('pbkdf2')}
          >
            <div className="space-y-4">
              <p className="text-xs text-yellow-600 font-mono leading-relaxed">
                <strong className="text-yellow-400">Password-Based Key Derivation Function 2</strong> securely converts user passwords into cryptographic keys. It uses SHA-256 with 100,000 iterations to prevent brute-force attacks.
              </p>

              <div className="p-4 bg-yellow-900/10 border border-yellow-900/30 rounded-sm">
                <h4 className="text-xs font-bold text-yellow-400 font-orbitron tracking-widest uppercase mb-2">Why 100,000 Iterations?</h4>
                <p className="text-[10px] text-yellow-600 font-mono leading-relaxed">
                  Each iteration of SHA-256 must complete before the next one begins. With 100,000 iterations, an attacker attempting a brute-force attack must perform 100,000 SHA-256 operations for each password guess, dramatically increasing the cost of the attack.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-black/40 border border-yellow-900/30 rounded-sm">
                  <h4 className="text-xs font-bold text-yellow-400 font-orbitron tracking-widest uppercase mb-2">Parameters</h4>
                  <ul className="text-[10px] text-yellow-600 space-y-1 font-mono">
                    <li>▸ Hash Function: SHA-256</li>
                    <li>▸ Iterations: 100,000</li>
                    <li>▸ Salt: 16 bytes (random)</li>
                    <li>▸ Key Length: 32 bytes (256-bit)</li>
                  </ul>
                </div>
                <div className="p-4 bg-black/40 border border-yellow-900/30 rounded-sm">
                  <h4 className="text-xs font-bold text-yellow-400 font-orbitron tracking-widest uppercase mb-2">Protection Against</h4>
                  <ul className="text-[10px] text-yellow-600 space-y-1 font-mono">
                    <li>▸ Rainbow table attacks</li>
                    <li>▸ Dictionary attacks</li>
                    <li>▸ Brute-force attempts</li>
                    <li>▸ GPU/CPU acceleration</li>
                  </ul>
                </div>
              </div>

              <CodeBlock language="python" code={`import os
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

# Derive 256-bit key from password
def derive_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,  # 256-bit key
        salt=salt,
        iterations=100000,
    )
    key = kdf.derive(password.encode())
    return key

# Generate random salt
salt = os.urandom(16)
key = derive_key("user_password", salt)
print(f"Derived Key: {key.hex()}")
`} />
            </div>
          </AlgorithmSection>

          {/* Security Overview */}
          <AlgorithmSection 
            title="Security Architecture" 
            icon={Shield}
            color="purple"
            isOpen={openSections.includes('security')}
            onToggle={() => toggleSection('security')}
          >
            <div className="space-y-4">
              <p className="text-xs text-purple-600 font-mono leading-relaxed">
                StegoSphere employs defense-in-depth principles, combining multiple security layers to protect the confidentiality and integrity of hidden messages.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-4 p-4 bg-black/40 border border-green-900/30 rounded-sm">
                  <div className="p-2 bg-green-900/20 rounded-lg shrink-0">
                    <Lock size={20} className="text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-green-400 font-orbitron tracking-widest uppercase mb-1">Encryption First</h4>
                    <p className="text-[10px] text-green-600 font-mono">Messages are encrypted BEFORE steganography, ensuring they remain secure even if the steganography is detected.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-black/40 border border-cyan-900/30 rounded-sm">
                  <div className="p-2 bg-cyan-900/20 rounded-lg shrink-0">
                    <Activity size={20} className="text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-cyan-400 font-orbitron tracking-widest uppercase mb-1">Authentication</h4>
                    <p className="text-[10px] text-cyan-600 font-mono">AES-GCM's authentication tag ensures tamper detection. Any modification to the stego image corrupts the message.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-black/40 border border-yellow-900/30 rounded-sm">
                  <div className="p-2 bg-yellow-900/20 rounded-lg shrink-0">
                    <Hash size={20} className="text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-yellow-400 font-orbitron tracking-widest uppercase mb-1">Strong Keys</h4>
                    <p className="text-[10px] text-yellow-600 font-mono">PBKDF2 with 100,000 iterations prevents offline attacks. Random salts prevent precomputed attacks.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-black/40 border border-purple-900/30 rounded-sm">
                  <div className="p-2 bg-purple-900/20 rounded-lg shrink-0">
                    <Eye size={20} className="text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-purple-400 font-orbitron tracking-widest uppercase mb-1">Plausible Deniability</h4>
                    <p className="text-[10px] text-purple-600 font-mono">Without the correct password, hidden data is indistinguishable from random noise. The image appears normal.</p>
                  </div>
                </div>
              </div>
            </div>
          </AlgorithmSection>

        </div>

        {/* Footer */}
        <footer className="text-center mt-16 pt-6 border-t border-green-900/30">
          <p className="text-[10px] text-green-700/40 font-mono tracking-widest uppercase">// StegoSphere_v3 — Cryptographically Secure [ {(new Date()).getFullYear()} ]</p>
        </footer>

        <style>{`
          @keyframes fade-in { 0% { opacity: 0; transform: translateY(5px); } 100% { opacity: 1; transform: translateY(0); } }
          .animate-fade-in { animation: fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `}</style>
      </div>
    </div>
  );
}
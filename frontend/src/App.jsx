import { useState, useRef } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('encode');

  // Encode State
  const [encodeImage, setEncodeImage] = useState(null);
  const [encodeImagePreview, setEncodeImagePreview] = useState(null);
  const [message, setMessage] = useState('');
  const [encodePassword, setEncodePassword] = useState('');
  const [isEncoding, setIsEncoding] = useState(false);
  const [encodeResult, setEncodeResult] = useState(null);

  // Decode State
  const [decodeImage, setDecodeImage] = useState(null);
  const [decodeImagePreview, setDecodeImagePreview] = useState(null);
  const [decodePassword, setDecodePassword] = useState('');
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodeResult, setDecodeResult] = useState('');
  const [decodeError, setDecodeError] = useState('');

  const fileInputEncodeRef = useRef();
  const fileInputDecodeRef = useRef();

  const handleEncodeImageSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEncodeImage(file);
      setEncodeImagePreview(URL.createObjectURL(file));
      setEncodeResult(null);
    }
  };

  const handleDecodeImageSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDecodeImage(file);
      setDecodeImagePreview(URL.createObjectURL(file));
      setDecodeResult('');
      setDecodeError('');
    }
  };

  const handleEncode = async () => {
    if (!encodeImage || !message) {
      alert("Please select an image and enter a message to hide.");
      return;
    }

    setIsEncoding(true);
    setEncodeResult(null);

    const formData = new FormData();
    formData.append('file', encodeImage);
    formData.append('message', message);
    if (encodePassword) {
      formData.append('password', encodePassword);
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/encode', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to encode message');
      }

      // Download the resultant image blob
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setEncodeResult(url);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsEncoding(false);
    }
  };

  const handleDecode = async () => {
    if (!decodeImage) {
      alert("Please select an image to decode.");
      return;
    }

    setIsDecoding(true);
    setDecodeResult('');
    setDecodeError('');

    const formData = new FormData();
    formData.append('file', decodeImage);
    if (decodePassword) {
      formData.append('password', decodePassword);
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/decode', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to decode message');
      }

      setDecodeResult(data.message);
    } catch (err) {
      setDecodeError(err.message);
    } finally {
      setIsDecoding(false);
    }
  };

  return (
    <div className="min-h-screen bg-stegobg text-stegotext font-sans flex flex-col items-center py-12 px-4 selection:bg-stegohover selection:text-stegobg">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-stegoaccent to-stegohover mb-4">
            StegoSphere Web Pro
          </h1>
          <p className="text-lg text-gray-400">
            Hide secret text messages inside your favorite images, securely encrypted via RC4.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center space-x-6 mb-8">
          <button
            onClick={() => setActiveTab('encode')}
            className={`px-6 py-3 rounded-full text-lg font-bold transition-all duration-300 ${activeTab === 'encode'
                ? 'bg-stegoaccent text-stegobg shadow-lg shadow-stegoaccent/30 scale-105'
                : 'bg-stegosurface text-stegotext hover:bg-stegolight'
              }`}
          >
            🔒 Encode & Hide
          </button>
          <button
            onClick={() => setActiveTab('decode')}
            className={`px-6 py-3 rounded-full text-lg font-bold transition-all duration-300 ${activeTab === 'decode'
                ? 'bg-stegoaccent text-stegobg shadow-lg shadow-stegoaccent/30 scale-105'
                : 'bg-stegosurface text-stegotext hover:bg-stegolight'
              }`}
          >
            🔓 Decode & Extract
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-stegosurface rounded-3xl p-8 shadow-2xl border border-stegolight/50">

          {/* ---------------- ENCODE TAB ---------------- */}
          {activeTab === 'encode' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Left Column: Image Selector */}
              <div className="flex flex-col space-y-4">
                <div
                  className="bg-stegolight border-2 border-dashed border-gray-600 rounded-2xl flex flex-col items-center justify-center h-80 cursor-pointer overflow-hidden group hover:border-stegoaccent transition-colors"
                  onClick={() => fileInputEncodeRef.current.click()}
                >
                  {encodeImagePreview ? (
                    <img src={encodeImagePreview} alt="Preview" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="text-center p-6">
                      <svg className="w-16 h-16 mx-auto text-gray-500 mb-4 group-hover:text-stegoaccent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                      <p className="text-xl font-semibold mb-2">Click to Browse Target Image</p>
                      <p className="text-sm text-gray-400">Recommendation: Use PNG Images</p>
                    </div>
                  )}
                  <input type="file" className="hidden" ref={fileInputEncodeRef} accept="image/png, image/jpeg, image/webp" onChange={handleEncodeImageSelect} />
                </div>
                {encodeImage && <p className="text-sm text-stegoaccent flex justify-between"><span>Selected: {encodeImage.name}</span></p>}

                {encodeResult && (
                  <div className="bg-green-900/20 border border-green-800 rounded-xl p-4 text-center mt-4 animate-pulse">
                    <p className="text-green-400 font-semibold mb-3">✅ Message Successfully Embedded!</p>
                    <a
                      href={encodeResult}
                      download={`secured_${encodeImage.name.replace(/\.[^/.]+$/, "")}.png`}
                      className="inline-block px-6 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20"
                    >
                      Download Secured Image
                    </a>
                  </div>
                )}
              </div>

              {/* Right Column: Message & Password */}
              <div className="flex flex-col space-y-6">
                <div>
                  <label className="block text-lg font-medium mb-2">The Secret Text:</label>
                  <textarea
                    className="w-full h-40 bg-[#181825] border border-stegolight rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-stegoaccent text-stegotext resize-none"
                    placeholder="Type the highly confidential message you want to hide here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-lg font-medium mb-2">Encryption Password (Optional):</label>
                  <input
                    type="password"
                    className="w-full bg-[#181825] border border-stegolight rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-stegoaccent text-stegotext"
                    placeholder="A strong password for RC4 stream cipher..."
                    value={encodePassword}
                    onChange={(e) => setEncodePassword(e.target.value)}
                  />
                </div>
                <button
                  className={`w-full py-4 rounded-xl text-lg font-bold text-stegobg transition-all duration-300 ${isEncoding ? 'bg-gray-500 cursor-not-allowed' : 'bg-stegoaccent hover:bg-stegohover shadow-lg shadow-stegoaccent/20'}`}
                  onClick={handleEncode}
                  disabled={isEncoding}
                >
                  {isEncoding ? 'Encrypting & Embedding...' : 'Encrypt & Embed Payload'}
                </button>
              </div>
            </div>
          )}

          {/* ---------------- DECODE TAB ---------------- */}
          {activeTab === 'decode' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Left Column: Image Selector */}
              <div className="flex flex-col space-y-4">
                <div
                  className="bg-stegolight border-2 border-dashed border-gray-600 rounded-2xl flex flex-col items-center justify-center h-80 cursor-pointer overflow-hidden group hover:border-stegoaccent transition-colors"
                  onClick={() => fileInputDecodeRef.current.click()}
                >
                  {decodeImagePreview ? (
                    <img src={decodeImagePreview} alt="Preview" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="text-center p-6">
                      <svg className="w-16 h-16 mx-auto text-gray-500 mb-4 group-hover:text-stegoaccent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                      <p className="text-xl font-semibold mb-2">Click to Browse Stego-Image</p>
                      <p className="text-sm text-gray-400">Select the previously secured PNG image</p>
                    </div>
                  )}
                  <input type="file" className="hidden" ref={fileInputDecodeRef} accept="image/png, image/bmp" onChange={handleDecodeImageSelect} />
                </div>
                {decodeImage && <p className="text-sm text-stegoaccent flex justify-between"><span>Selected: {decodeImage.name}</span></p>}
              </div>

              {/* Right Column: Password & Result */}
              <div className="flex flex-col space-y-6">
                <div>
                  <label className="block text-lg font-medium mb-2">Decryption Password (If applied):</label>
                  <input
                    type="password"
                    className="w-full bg-[#181825] border border-stegolight rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-stegoaccent text-stegotext"
                    placeholder="Provide the password to unlock the RC4 cipher..."
                    value={decodePassword}
                    onChange={(e) => setDecodePassword(e.target.value)}
                  />
                </div>
                <button
                  className={`w-full py-4 rounded-xl text-lg font-bold text-stegobg transition-all duration-300 ${isDecoding ? 'bg-gray-500 cursor-not-allowed' : 'bg-stegohover hover:bg-white shadow-lg shadow-stegohover/20'}`}
                  onClick={handleDecode}
                  disabled={isDecoding}
                >
                  {isDecoding ? 'Extracting & Decrypting...' : 'Extract Embedded Secret'}
                </button>

                {/* Results View */}
                {decodeError && (
                  <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 mt-2">
                    <p className="text-red-400 font-semibold mb-1">Extraction Failed:</p>
                    <p className="text-sm text-red-300">{decodeError}</p>
                  </div>
                )}
                {decodeResult && (
                  <div className="p-4 bg-[#181825] border border-stegoaccent rounded-xl mt-2 relative">
                    <span className="absolute -top-3 left-4 bg-stegosurface px-2 text-stegoaccent text-sm font-bold">Decrypted Message</span>
                    <p className="text-[#a6e3a1] font-mono whitespace-pre-wrap mt-2">{decodeResult}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 pb-10">
          <p>© {new Date().getFullYear()} StegoSphere Pro Web. Empowering privacy with LSB Cryptography and RC4 Encryption.</p>
        </div>
      </div>
    </div>
  );
}

export default App;

import io
import os
import hashlib
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

app = FastAPI(title="StegoSphere API")

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------------------------------------
# Core Algorithms
# ----------------------------------------------------------------------

def encrypt_aead(password: str, data: bytes) -> bytes:
    if not password:
        password = "NO_PASSWORD_SUPPLIED"
    
    salt = os.urandom(16)
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    key = kdf.derive(password.encode('utf-8'))
    
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, data, associated_data=None)
    
    return salt + nonce + ciphertext

def decrypt_aead(password: str, encrypted_data: bytes) -> bytes:
    if not password:
        password = "NO_PASSWORD_SUPPLIED"
        
    salt = encrypted_data[:16]
    nonce = encrypted_data[16:28]
    ciphertext = encrypted_data[28:]
    
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    key = kdf.derive(password.encode('utf-8'))
    
    aesgcm = AESGCM(key)
    try:
        return aesgcm.decrypt(nonce, ciphertext, associated_data=None)
    except Exception:
        raise ValueError("Decryption/Authentication failed: Incorrect password or corrupted payload.")

def encode_data_into_image(img: Image.Image, data: bytes) -> Image.Image:
    """Core LSB implementation: hides data bytes in the RGB channels of an image."""
    img = img.convert('RGB')
    pixels = img.load()
    width, height = img.size
    
    # Convert data into a string of bits
    bits = ''.join([f"{byte:08b}" for byte in data])
    bits_len = len(bits)
    
    bit_idx = 0
    for y in range(height):
        for x in range(width):
            if bit_idx < bits_len:
                r, g, b = pixels[x, y]
                
                # Encode in Red channel
                if bit_idx < bits_len:
                    r = (r & ~1) | int(bits[bit_idx])
                    bit_idx += 1
                # Encode in Green channel
                if bit_idx < bits_len:
                    g = (g & ~1) | int(bits[bit_idx])
                    bit_idx += 1
                # Encode in Blue channel
                if bit_idx < bits_len:
                    b = (b & ~1) | int(bits[bit_idx])
                    bit_idx += 1
                    
                pixels[x, y] = (r, g, b)
            else:
                break
        if bit_idx >= bits_len:
            break
            
    return img

def embed_message(img: Image.Image, message: str, password: str = "") -> Image.Image:
    """Combines password encryption, length headers, and LSB embedding."""
    message_bytes = message.encode('utf-8')
    
    # Magic header 'STEG' protects against bad Decrypts 
    data_to_encrypt = b'STEG' + message_bytes
    
    # AEAD Encryption: encrypts data and prepends salt and nonce
    encrypted_payload = encrypt_aead(password, data_to_encrypt)
    
    # Prefix the encrypted payload with its length (4 bytes big-endian)
    length = len(encrypted_payload)
    length_bytes = length.to_bytes(4, byteorder='big')
    
    final_data = length_bytes + encrypted_payload
    
    # Security/Capacity check
    width, height = img.size
    max_bytes = (width * height * 3) // 8
    
    if len(final_data) > max_bytes:
        raise ValueError(f"Image capacity is {max_bytes} bytes, but data requires {len(final_data)} bytes.")
        
    return encode_data_into_image(img, final_data)

def extract_message(img: Image.Image, password: str = "") -> str:
    """Extracts length prefix, reads the bitstream, and decrypts the payload."""
    img = img.convert('RGB')
    width, height = img.size
    
    max_payload = (width * height * 3) // 8 - 4
    
    def bit_generator():
        pixels = img.load()
        for y in range(height):
            for x in range(width):
                r, g, b = pixels[x, y]
                yield r & 1
                yield g & 1
                yield b & 1

    gen = bit_generator()
    
    # 1. Read first 32 bits for length
    length_bits = []
    for _ in range(32):
        try:
            length_bits.append(str(next(gen)))
        except StopIteration:
            raise ValueError("Image does not contain a valid hidden message.")
            
    length_int = int("".join(length_bits), 2)
    
    if length_int <= 0 or length_int > max_payload:
        raise ValueError("No valid message found or image is incorrectly formatted.")
        
    # 2. Extract payload bits
    payload_bits = []
    for _ in range(length_int * 8):
        try:
            payload_bits.append(str(next(gen)))
        except StopIteration:
            raise ValueError("Image stream abruptly ended before full message could be read.")
            
    payload_bytes = bytearray()
    for i in range(0, len(payload_bits), 8):
        byte = int("".join(payload_bits[i:i+8]), 2)
        payload_bytes.append(byte)
        
    # 3. Decrypt payload and check header validity
    decrypted_data = decrypt_aead(password, bytes(payload_bytes))
        
    if not decrypted_data.startswith(b'STEG'):
        raise ValueError("Decryption failed: Incorrect password or corrupted payload.")
        
    # Cut off 'STEG' and interpret back to text
    return decrypted_data[4:].decode('utf-8')

# ----------------------------------------------------------------------
# API Endpoints
# ----------------------------------------------------------------------

@app.post("/api/encode")
async def api_encode(
    file: UploadFile = File(...),
    message: str = Form(...),
    password: str = Form("")
):
    try:
        # Read the file as an image
        image_data = await file.read()
        img = Image.open(io.BytesIO(image_data))
        
        # Embed the message
        stego_img = embed_message(img, message, password)
        
        # Save image memory buffer
        img_io = io.BytesIO()
        stego_img.save(img_io, format="PNG")
        img_io.seek(0)
        
        # Return as downloadable PNG
        return StreamingResponse(
            img_io,
            media_type="image/png",
            headers={
                "Content-Disposition": f"attachment; filename=stego_{file.filename.split('.')[0]}.png"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/decode")
async def api_decode(
    file: UploadFile = File(...),
    password: str = Form("")
):
    try:
        # Read the file as an image
        image_data = await file.read()
        img = Image.open(io.BytesIO(image_data))
        
        # Extract the message
        secret_message = extract_message(img, password)
        
        return {"success": True, "message": secret_message}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
from PIL import Image, ImageTk
import os

# ----------------------------------------------------------------------
# Core Algorithms
# ----------------------------------------------------------------------

def rc4(key: bytes, data: bytes) -> bytes:
    """A simple but fast RC4 encryption implementation for our payload."""
    S = list(range(256))
    j = 0
    out = bytearray()
    
    # Key-scheduling algorithm
    for i in range(256):
        j = (j + S[i] + key[i % len(key)]) % 256
        S[i], S[j] = S[j], S[i]
        
    # Pseudo-random generation algorithm
    i = j = 0
    for byte in data:
        i = (i + 1) % 256
        j = (j + S[i]) % 256
        S[i], S[j] = S[j], S[i]
        out.append(byte ^ S[(S[i] + S[j]) % 256])
        
    return bytes(out)

def encode_data_into_image(image_path, data: bytes):
    """Core LSB implementation: hides data bytes in the RGB channels of an image."""
    img = Image.open(image_path).convert('RGB')
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

def embed_message(image_path, message: str, password: str = ""):
    """Combines password encryption, length headers, and LSB embedding."""
    key = password.encode('utf-8') if password else b'NO_PASSWORD_SUPPLIED'
    message_bytes = message.encode('utf-8')
    
    # Magic header 'STEG' protects against bad Decrypts 
    data_to_encrypt = b'STEG' + message_bytes
    encrypted_payload = rc4(key, data_to_encrypt)
    
    # Prefix the encrypted payload with its length (4 bytes big-endian)
    length = len(encrypted_payload)
    length_bytes = length.to_bytes(4, byteorder='big')
    
    final_data = length_bytes + encrypted_payload
    
    # Security/Capacity check
    img = Image.open(image_path)
    width, height = img.size
    max_bytes = (width * height * 3) // 8
    
    if len(final_data) > max_bytes:
        raise ValueError(f"Image capacity is {max_bytes} bytes, but data requires {len(final_data)} bytes.")
        
    return encode_data_into_image(image_path, final_data)

def extract_message(image_path, password: str = ""):
    """Extracts length prefix, reads the bitstream, and decrypts the payload."""
    key = password.encode('utf-8') if password else b'NO_PASSWORD_SUPPLIED'
    img = Image.open(image_path).convert('RGB')
    width, height = img.size
    
    # Generator for yielding bits channel-by-channel
    def bit_generator():
        pixels = img.load()
        for y in range(height):
            for x in range(width):
                r, g, b = pixels[x, y]
                yield r & 1
                yield g & 1
                yield b & 1

    gen = bit_generator()
    
    # 1. Read the first 32 bits to resolve the length of the secret packet
    length_bits = []
    for _ in range(32):
        try:
            length_bits.append(str(next(gen)))
        except StopIteration:
            raise ValueError("Image does not contain a valid hidden message.")
            
    length_int = int("".join(length_bits), 2)
    max_payload = (width * height * 3) // 8 - 4
    
    if length_int <= 0 or length_int > max_payload:
        raise ValueError("No valid message found or image is incorrectly formatted.")
        
    # 2. Extract exactly the number of bits needed for the payload
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
    decrypted_data = rc4(key, bytes(payload_bytes))
    if not decrypted_data.startswith(b'STEG'):
        raise ValueError("Decryption failed: Incorrect password or corrupted payload.")
        
    # Cut off 'STEG' and interpret back to text
    return decrypted_data[4:].decode('utf-8')

# ----------------------------------------------------------------------
# Tkinter Application Graphical Interface
# ----------------------------------------------------------------------

class StegApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("StegoSphere Pro")
        self.geometry("900x700")
        
        # UI Premium Color Palette
        self.bg_color = "#11111B"
        self.surface_color = "#1E1E2E"
        self.surface_light = "#313244"
        self.text_color = "#CDD6F4"
        self.accent_color = "#cba6f7"
        self.accent_hover = "#b4befe"
        
        self.font_main = ('Segoe UI', 11)
        self.font_title = ('Segoe UI', 24, 'bold')
        self.font_btn = ('Segoe UI', 11, 'bold')
        
        self.configure(bg=self.bg_color)
        
        self.style = ttk.Style(self)
        try:
            self.style.theme_use('clam')
        except:
            pass
            
        self.setup_styles()
        self.create_widgets()

    def setup_styles(self):
        self.style.configure('TFrame', background=self.bg_color)
        self.style.configure('Card.TFrame', background=self.surface_color)
        self.style.configure('TLabel', background=self.bg_color, foreground=self.text_color, font=self.font_main)
        self.style.configure('Card.TLabel', background=self.surface_light, foreground=self.text_color, font=self.font_main)
        self.style.configure('Header.TLabel', background=self.bg_color, font=self.font_title, foreground=self.accent_color)
        self.style.configure('SubHeader.TLabel', background=self.bg_color, font=('Segoe UI', 12), foreground="#a6adc8")
        
        self.style.configure('TButton', font=self.font_btn, background=self.accent_color, foreground=self.bg_color, borderwidth=0, padding=12)
        self.style.map('TButton', background=[('active', self.accent_hover)])
        
        self.style.configure('TNotebook', background=self.bg_color, borderwidth=0)
        self.style.configure('TNotebook.Tab', font=('Segoe UI', 12, 'bold'), padding=[25, 12], background=self.surface_color, foreground="#a6adc8")
        self.style.map('TNotebook.Tab', background=[('selected', self.accent_color)], foreground=[('selected', self.bg_color)])

    def create_widgets(self):
        # Top Header
        header_frame = ttk.Frame(self)
        header_frame.pack(fill='x', pady=(30, 15))
        ttk.Label(header_frame, text="Steganography Pro", style='Header.TLabel').pack()
        ttk.Label(header_frame, text="Hide secret text messages inside your favorite images, securely encrypted via RC4.", style='SubHeader.TLabel').pack(pady=(5, 0))
        
        # Tabs system
        self.notebook = ttk.Notebook(self)
        self.notebook.pack(expand=True, fill='both', padx=40, pady=(10, 40))
        
        self.tab_hide = ttk.Frame(self.notebook, style='Card.TFrame')
        self.tab_extract = ttk.Frame(self.notebook, style='Card.TFrame')
        
        self.notebook.add(self.tab_hide, text="  🔒 Encode & Hide  ")
        self.notebook.add(self.tab_extract, text="  🔓 Decode & Extract  ")
        
        self.build_hide_tab()
        self.build_extract_tab()
        
    def build_hide_tab(self):
        # Layout definition
        container = ttk.Frame(self.tab_hide, style='Card.TFrame')
        container.pack(expand=True, fill='both', padx=20, pady=20)
        
        left_panel = tk.Frame(container, bg=self.surface_color)
        left_panel.pack(side='left', expand=True, fill='both', padx=(0, 10))
        
        right_panel = tk.Frame(container, bg=self.surface_color)
        right_panel.pack(side='right', expand=True, fill='both', padx=(10, 0))
        
        # LEFT: Image stuff
        self.lbl_image_preview_hide = tk.Label(left_panel, text="No Image Selected\n(Recommendation: Use PNG Images)", bg=self.surface_light, fg=self.text_color, font=self.font_main)
        self.lbl_image_preview_hide.pack(expand=True, fill='both', pady=(0, 15))
        
        btn_browse = ttk.Button(left_panel, text="Browse Target Image", command=self.browse_hide_image)
        btn_browse.pack(fill='x')
        
        self.lbl_capacity = tk.Label(left_panel, text="Capacity: 0 Bytes", bg=self.surface_color, fg="#bac2de", font=("Segoe UI", 10))
        self.lbl_capacity.pack(anchor='w', pady=(5, 0))
        
        self.hide_image_path = None

        # RIGHT: Message details
        tk.Label(right_panel, text="The Secret Text:", bg=self.surface_color, fg=self.text_color, font=self.font_main).pack(anchor='w', pady=(0, 5))
        self.txt_message = scrolledtext.ScrolledText(right_panel, height=10, bg=self.surface_light, fg=self.text_color, insertbackground=self.text_color, font=self.font_main, relief='flat', padx=15, pady=15)
        self.txt_message.pack(fill='both', expand=True, pady=(0, 20))
        
        tk.Label(right_panel, text="Encryption Password (Optional):", bg=self.surface_color, fg=self.text_color, font=self.font_main).pack(anchor='w', pady=(0, 5))
        self.ent_password_hide = tk.Entry(right_panel, show="*", bg=self.surface_light, fg=self.text_color, insertbackground=self.text_color, font=self.font_main, relief='flat', bd=10)
        self.ent_password_hide.pack(fill='x', pady=(0, 25))
        
        btn_encode = ttk.Button(right_panel, text="Encrypt & Embed Payload", command=self.encode_action)
        btn_encode.pack(fill='x')

    def build_extract_tab(self):
        container = ttk.Frame(self.tab_extract, style='Card.TFrame')
        container.pack(expand=True, fill='both', padx=20, pady=20)
        
        left_panel = tk.Frame(container, bg=self.surface_color)
        left_panel.pack(side='left', expand=True, fill='both', padx=(0, 10))
        
        right_panel = tk.Frame(container, bg=self.surface_color)
        right_panel.pack(side='right', expand=True, fill='both', padx=(10, 0))
        
        # LEFT: Image stuff
        self.lbl_image_preview_extract = tk.Label(left_panel, text="No Image Selected", bg=self.surface_light, fg=self.text_color, font=self.font_main)
        self.lbl_image_preview_extract.pack(expand=True, fill='both', pady=(0, 15))
        
        btn_browse = ttk.Button(left_panel, text="Browse Stego-Image", command=self.browse_extract_image)
        btn_browse.pack(fill='x')
        
        self.extract_image_path = None

        # RIGHT: Extraction details
        tk.Label(right_panel, text="Decryption Password (If applied):", bg=self.surface_color, fg=self.text_color, font=self.font_main).pack(anchor='w', pady=(0, 5))
        self.ent_password_extract = tk.Entry(right_panel, show="*", bg=self.surface_light, fg=self.text_color, insertbackground=self.text_color, font=self.font_main, relief='flat', bd=10)
        self.ent_password_extract.pack(fill='x', pady=(0, 20))
        
        btn_decode = ttk.Button(right_panel, text="Extract Embedded Secret", command=self.decode_action)
        btn_decode.pack(fill='x', pady=(0, 30))
        
        tk.Label(right_panel, text="Decrypted Message:", bg=self.surface_color, fg=self.text_color, font=self.font_main).pack(anchor='w', pady=(0, 5))
        self.txt_extracted = scrolledtext.ScrolledText(right_panel, height=8, bg=self.surface_light, fg="#a6e3a1", insertbackground=self.text_color, font=self.font_main, relief='flat', padx=15, pady=15)
        self.txt_extracted.pack(fill='both', expand=True)

    def _resize_preview(self, img_path, label):
        try:
            img = Image.open(img_path)
            # Create a thumbnail with proportional resize
            img.thumbnail((350, 350))
            img_tk = ImageTk.PhotoImage(img)
            label.configure(image=img_tk, text="")
            label.image = img_tk  # keep reference to prevent garbage collection
        except Exception as e:
            label.configure(text="Unable to preview image.")
            
    def browse_hide_image(self):
        path = filedialog.askopenfilename(filetypes=[("Image Files", "*.png;*.jpg;*.jpeg;*.bmp;*.webp")])
        if path:
            self.hide_image_path = path
            self._resize_preview(path, self.lbl_image_preview_hide)
            
            try:
                with Image.open(path) as img:
                    width, height = img.size
                    max_bytes = (width * height * 3) // 8 - 4
                    self.lbl_capacity.config(text=f"Maximum allowed payload size: {max_bytes:,} Characters")
            except Exception:
                self.lbl_capacity.config(text="Capacity: Unknown")

    def browse_extract_image(self):
        path = filedialog.askopenfilename(filetypes=[("Image Files", "*.png;*.bmp")])
        if path:
            self.extract_image_path = path
            self._resize_preview(path, self.lbl_image_preview_extract)

    def encode_action(self):
        if not self.hide_image_path:
            messagebox.showwarning("Incomplete", "Please browse and select an image first.")
            return
            
        message = self.txt_message.get("1.0", tk.END).strip()
        if not message:
            messagebox.showwarning("Incomplete", "The secret message field is empty.")
            return
            
        password = self.ent_password_hide.get()
        
        # Ask to save PNG, since JPG removes data bits during compression loops!
        save_path = filedialog.asksaveasfilename(
            defaultextension=".png", 
            filetypes=[("PNG Image (Lossless)", "*.png")],
            title="Save Secured Image"
        )
        if not save_path:
            return
            
        try:
            self.config(cursor="wait")
            self.update()
            
            stego_img = embed_message(self.hide_image_path, message, password)
            stego_img.save(save_path, format="PNG")
            
            self.config(cursor="")
            messagebox.showinfo("Success", f"Your message has been embedded secretly!\n\nSaved gracefully to:\n{save_path}")
            
            # Reset UI entries
            self.txt_message.delete("1.0", tk.END)
            self.ent_password_hide.delete(0, tk.END)
            
        except ValueError as ve:
            self.config(cursor="")
            messagebox.showerror("Error", str(ve))
        except Exception as e:
            self.config(cursor="")
            messagebox.showerror("Application Error", f"Failed to encode the message:\n{str(e)}")

    def decode_action(self):
        if not self.extract_image_path:
            messagebox.showwarning("Incomplete", "Please browse and select a stego-image first.")
            return
            
        password = self.ent_password_extract.get()
        
        try:
            self.config(cursor="wait")
            self.update()
            
            secret_msg = extract_message(self.extract_image_path, password)
            
            self.config(cursor="")
            self.txt_extracted.config(state='normal')
            self.txt_extracted.delete("1.0", tk.END)
            self.txt_extracted.insert(tk.END, secret_msg)
            
            messagebox.showinfo("Extraction Granted", "Decryption algorithm executed smoothly! Your message was cleanly retrieved.")
        except Exception as e:
            self.config(cursor="")
            messagebox.showerror("Decryption Failed", str(e))

if __name__ == "__main__":
    app = StegApp()
    app.mainloop()

import struct

def get_png_dimensions(file_path):
    with open(file_path, 'rb') as f:
        data = f.read(24)
        if data[:8] == b'\x89PNG\r\n\x1a\n':
            w, h = struct.unpack('>LL', data[16:24])
            return w, h
    return None

w, h = get_png_dimensions(r"C:\Users\ASUS\Desktop\V-DESK-Workspace\assets\vdesk-navbar-logo.png")
print(f"Uploaded logo dimensions: {w} x {h} (aspect ratio: {w/h:.2f})")

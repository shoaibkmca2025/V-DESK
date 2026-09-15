import os

video_path = r"C:\Users\ASUS\Desktop\V-DESK-Workspace\assets\vdesk-hero-video.mp4"
print("File exists:", os.path.exists(video_path))
print("File size:", os.path.getsize(video_path), "bytes")

# Read header bytes to check MP4 atom
with open(video_path, "rb") as f:
    header = f.read(64)
    print("Header bytes (hex):", header.hex()[:64])
    print("Header contains ftyp:", b"ftyp" in header)

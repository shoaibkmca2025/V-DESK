with open(r"C:\Users\ASUS\Desktop\V-DESK-Workspace\styles.css", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if line.strip().startswith('/*') and any(w in line for w in ['V-DESK', 'THEME', 'NAVBAR', 'HERO', 'CARDS', 'PRICING', 'WIZARD']):
        print(f"L{idx+1}: {line.strip()}")

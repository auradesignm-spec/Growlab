from pathlib import Path
import re
ps = Path("components/dashboard/ProductStudio.tsx").read_text(encoding="utf-8")
keys = sorted(set(re.findall(r't\("([^"]+)"\)', ps)))
print("ns", re.findall(r'useTranslations\("([^"]+)"\)', ps))
print("\n".join(keys))
print("studio-field", ps.count("studio-field"))
print("import", [l for l in ps.splitlines() if "from @" in l])

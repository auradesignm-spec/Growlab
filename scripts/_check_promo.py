import pathlib, re
t = pathlib.Path(r"c:/Users/User/Growlab/lib/merchant-store/promo.ts").read_text(encoding="utf-8")
print("KINDS line:", t.splitlines()[5])
for m in re.finditer(r'kind === "([^"]+)"', t):
    print("cmp", repr(m.group(1)))
for m in re.finditer(r'kind: "([^"]+)"', t):
    print("lit", repr(m.group(1)))
print("fields", set(re.findall(r"\b(buyQty|buyQty|getQty|getQty|percentOff|percentOff)\b", t)))

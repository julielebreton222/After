# Records Canva media ids: python3 art/rec.py key=MEDIAID key2=MEDIAID ...
import json, sys
p = 'art/media-ids.json'
d = json.load(open(p))
for a in sys.argv[1:]:
    k, v = a.split('=', 1)
    d[k] = v
json.dump(d, open(p, 'w'), indent=2)
print(len(d), 'recorded')

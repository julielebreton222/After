# Prints the full prompt for each painting key given on the command line.
import json, re, sys
d = json.load(open('art/scenes.json'))
for key in sys.argv[1:]:
    ch, scene = d['scenes'][key]
    scene = re.sub(r'\{(\w+)\}', lambda m: d['characters'][m.group(1)], scene)
    print(f"== {key}\n{d['base']} {d['palette'][str(ch)]} Use the reference images for drawing style and for any characters they show. Scene: {scene}\n")

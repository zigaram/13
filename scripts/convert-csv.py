import csv
import json
import re
import os

CSV_PATH = '/mnt/user-data/uploads/aquarium_species_database__6_.csv'
OUTPUT_PATH = 'src/data/fish.json'
OLD_DATA_PATH = 'src/data/fish.json.bak'

# Load existing data to preserve compatibleWith/incompatibleWith
old_data = {}
with open(OLD_DATA_PATH) as f:
    for item in json.load(f):
        old_data[item['slug']] = item

def slugify(name):
    s = name.lower().strip()
    s = re.sub(r'\([^)]*\)', '', s).strip()  # Remove parenthetical
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'[\s]+', '-', s)
    s = re.sub(r'-+', '-', s).strip('-')
    return s

def cm_to_inches(cm_str):
    try:
        return round(float(cm_str) / 2.54, 1)
    except:
        return 3.0

def c_to_f(temp_str):
    """Convert '22-28' celsius range to fahrenheit min/max"""
    try:
        parts = temp_str.replace('–', '-').split('-')
        min_c = float(parts[0].strip())
        max_c = float(parts[1].strip()) if len(parts) > 1 else min_c
        return round(min_c * 9/5 + 32, 0), round(max_c * 9/5 + 32, 0)
    except:
        return 72, 82

def liters_to_gallons(liters_str):
    try:
        return round(float(liters_str) / 3.785, 0)
    except:
        return 10

def parse_ph(ph_str):
    try:
        parts = ph_str.replace('–', '-').split('-')
        return float(parts[0].strip()), float(parts[1].strip()) if len(parts) > 1 else float(parts[0].strip())
    except:
        return 6.5, 7.5

def parse_schooling(school_str):
    s = school_str.lower().strip()
    if not s or s == 'no' or s == 'solitary' or 'solo' in s:
        return False, None
    # Extract number
    m = re.search(r'(\d+)', s)
    count = int(m.group(1)) if m else 6
    return True, count

def map_care_level(level):
    l = level.lower().strip()
    if 'do not' in l:
        return 'do-not-keep'
    if 'beginner' in l:
        return 'beginner'
    if 'intermediate' in l:
        return 'intermediate'
    if 'advanced' in l or 'expert' in l:
        return 'advanced'
    return 'intermediate'

def map_temperament(aggression_str):
    try:
        a = int(aggression_str)
        if a <= 3:
            return 'peaceful'
        if a <= 6:
            return 'semi-aggressive'
        return 'aggressive'
    except:
        return 'peaceful'

def map_type(category):
    c = category.lower().strip()
    if c == 'fish':
        return 'fish'
    if c == 'invertebrate':
        return 'invertebrate'
    if c == 'amphibian':
        return 'amphibian'
    if c == 'reptile':
        return 'reptile'
    if c == 'cnidarian':
        return 'cnidarian'
    return 'fish'

def map_water_type(wt):
    w = wt.lower().strip()
    if 'salt' in w:
        return 'saltwater'
    if 'brackish' in w:
        return 'brackish'
    return 'freshwater'

def map_bioload(bl):
    b = bl.lower().strip()
    if 'very' in b or 'extreme' in b:
        return 'very-high'
    if 'high' in b:
        return 'high'
    if 'medium' in b or 'moderate' in b:
        return 'medium'
    return 'low'

def map_activity(ap):
    a = ap.lower().strip()
    if 'nocturnal' in a:
        return 'nocturnal'
    if 'crepuscular' in a:
        return 'crepuscular'
    return 'diurnal'

def map_plant_safe(ps):
    p = ps.lower().strip()
    if p in ('yes', 'true', 'safe'):
        return 'yes'
    if p in ('no', 'false', 'unsafe', 'will eat', 'destroys'):
        return 'no'
    if 'mostly' in p or 'generally' in p:
        return 'mostly'
    if 'caution' in p or 'may' in p:
        return 'caution'
    if p == '' or p == 'n/a':
        return 'yes'
    return 'mostly'

def map_oxygen(ox):
    o = ox.lower().strip()
    if 'high' in o:
        return 'high'
    if 'medium' in o or 'moderate' in o:
        return 'medium'
    return 'low'

def map_reef_safe(rs, water_type):
    if water_type != 'saltwater':
        return 'n/a'
    r = rs.lower().strip()
    if r in ('yes', 'true'):
        return 'yes'
    if r in ('no', 'false'):
        return 'no'
    if 'caution' in r or 'with' in r:
        return 'caution'
    return 'caution'

def parse_diseases(disease_str):
    if not disease_str.strip():
        return []
    # Split by comma, semicolon, or " and "
    parts = re.split(r'[,;]| and ', disease_str)
    return [p.strip().strip('"').strip("'") for p in parts if p.strip()]

def generate_description(row):
    name = row['Common Name']
    sci = row['Scientific Name (Latin)']
    wt = row['Water Type']
    care = row['Care Level']
    notes = row.get('Notes', '')
    colors = row.get('Colors', '')
    position = row.get('Aquarium Position', '')
    
    desc = f"The {name} ({sci}) is a {care.lower()} {wt.lower()} species"
    if colors:
        desc += f" known for its {colors.lower()} coloration"
    desc += "."
    if notes:
        desc += f" {notes.split(';')[0].strip()}."
    if position:
        short_pos = position.split(';')[0].strip()
        if len(short_pos) < 80:
            desc += f" {short_pos}."
    return desc[:300]

def generate_meta_title(row):
    name = row['Common Name']
    return f"{name} Care Guide: Tank Size, Diet, Tank Mates & More"

def generate_meta_description(row):
    name = row['Common Name']
    sci = row['Scientific Name (Latin)']
    care = row['Care Level']
    size = row.get('Max Size (cm)', '')
    tank = row.get('Min Tank Size (L)', '')
    wt = row['Water Type']
    return f"Complete {name} ({sci}) care guide. {care} {wt.lower()} species. Size, tank requirements, compatible tank mates, diet, breeding, and expert tips."[:160]

def generate_keywords(row):
    name = row['Common Name']
    sci = row['Scientific Name (Latin)']
    subcat = row.get('Subcategory', '')
    wt = row['Water Type']
    kws = [
        name.lower(),
        f"{name.lower()} care",
        f"{name.lower()} care guide",
        f"{name.lower()} tank mates",
        f"{name.lower()} tank size",
        sci.lower() if sci else '',
        subcat.lower(),
        wt.lower(),
    ]
    return [k for k in kws if k]

# ============================================================
# MAIN CONVERSION
# ============================================================
with open(CSV_PATH, 'r', encoding='utf-8-sig') as f:
    rows = list(csv.DictReader(f))

species = []
seen_slugs = set()

for row in rows:
    name = row['Common Name'].strip()
    slug = slugify(name)
    
    # Handle duplicate slugs
    if slug in seen_slugs:
        # Try with subcategory
        subcat = slugify(row.get('Subcategory', ''))
        slug = f"{slug}-{subcat}" if subcat else f"{slug}-2"
    if slug in seen_slugs:
        slug = f"{slug}-{slugify(row['Water Type'])}"
    seen_slugs.add(slug)
    
    water_type = map_water_type(row['Water Type'])
    temp_min, temp_max = c_to_f(row.get('Temperature Range (°C)', '24-28'))
    ph_min, ph_max = parse_ph(row.get('pH Range', '6.5-7.5'))
    schooling, school_size = parse_schooling(row.get('Schooling', ''))
    
    # Preserve existing compatibility data if we have it
    old = old_data.get(slug, {})
    
    # Parse lifespan
    lifespan_raw = row.get('Lifespan (years)', '3-5')
    lifespan = f"{lifespan_raw} years" if lifespan_raw and not 'year' in lifespan_raw.lower() else lifespan_raw
    
    spec = {
        'slug': slug,
        'name': name,
        'scientificName': row.get('Scientific Name (Latin)', ''),
        'family': row.get('Subcategory', ''),
        'category': water_type,
        'type': map_type(row['Category']),
        'subcategory': row.get('Subcategory', ''),
        'careLevel': map_care_level(row.get('Care Level', 'Intermediate')),
        'temperament': map_temperament(row.get('Aggression (1-10)', '3')),
        'diet': row.get('Diet', 'Omnivore'),
        'minTankSize': int(liters_to_gallons(row.get('Min Tank Size (L)', '40'))),
        'maxSize': cm_to_inches(row.get('Max Size (cm)', '8')),
        'temperature': { 'min': int(temp_min), 'max': int(temp_max) },
        'ph': { 'min': ph_min, 'max': ph_max },
        'lifespan': lifespan,
        'schooling': schooling,
        'compatibleWith': old.get('compatibleWith', []),
        'incompatibleWith': old.get('incompatibleWith', []),
        'description': generate_description(row),
        'careGuide': '',
        'imageUrl': f"/images/fish/{slug}.svg",
        'metaTitle': generate_meta_title(row),
        'metaDescription': generate_meta_description(row),
        'keywords': generate_keywords(row),
        
        # New enriched fields
        'colors': row.get('Colors', ''),
        'speed': int(row.get('Speed (0-100)', '30') or '30'),
        'movingPattern': row.get('Moving Pattern', ''),
        'aquariumPosition': row.get('Aquarium Position', '').split(';')[0].strip(),
        'aggression': int(row.get('Aggression (1-10)', '3') or '3'),
        'waterHardness': row.get('Water Hardness (GH)', ''),
        'bioload': map_bioload(row.get('Bioload', 'Low')),
        'breeding': row.get('Breeding', ''),
        'activityPeriod': map_activity(row.get('Activity Period', 'Diurnal')),
        'plantSafe': map_plant_safe(row.get('Plant Safe', 'Yes')),
        'oxygenDemand': map_oxygen(row.get('Oxygen Demand', 'Low')),
        'commonDiseases': parse_diseases(row.get('Common Diseases', '')),
        'dimorphism': row.get('Dimorphism', ''),
        'priceRange': row.get('Price Range', '$$'),
        'bodyShape': row.get('Body Shape', ''),
        'bodySize': row.get('Body Size LxWxH (cm)', ''),
        'origin': row.get('Origin', ''),
        'reefSafe': map_reef_safe(row.get('Reef Safe', ''), water_type),
        'notes': row.get('Notes', ''),
    }
    
    if schooling and school_size:
        spec['minSchoolSize'] = school_size
    
    species.append(spec)

# Sort: freshwater first, then saltwater, then by name
def sort_key(s):
    type_order = {'fish': 0, 'invertebrate': 1, 'cnidarian': 2, 'amphibian': 3, 'reptile': 4}
    cat_order = {'freshwater': 0, 'brackish': 1, 'saltwater': 2}
    return (cat_order.get(s['category'], 9), type_order.get(s['type'], 9), s['name'])

species.sort(key=sort_key)

with open(OUTPUT_PATH, 'w') as f:
    json.dump(species, f, indent=2, ensure_ascii=False)

print(f"Generated {len(species)} species in {OUTPUT_PATH}")
print()

# Stats
from collections import Counter
cats = Counter(s['category'] for s in species)
types = Counter(s['type'] for s in species)
cares = Counter(s['careLevel'] for s in species)

print("By water type:", dict(cats))
print("By creature type:", dict(types))
print("By care level:", dict(cares))
print()
print(f"With schooling data: {sum(1 for s in species if s['schooling'])}")
print(f"With color data: {sum(1 for s in species if s['colors'])}")
print(f"With behavior data: {sum(1 for s in species if s['movingPattern'])}")
print(f"With disease data: {sum(1 for s in species if s['commonDiseases'])}")
print(f"With breeding data: {sum(1 for s in species if s['breeding'])}")
print(f"With body shape data: {sum(1 for s in species if s['bodyShape'])}")
print(f"With origin data: {sum(1 for s in species if s['origin'])}")

"""Calcula, para cada localidad/barrio del AMBA hasta 60 km de CABA, la distancia POR CALLE desde el límite de CABA (OpenStreetMap + OSRM).
Salida: herramientas/zonas-calculadas.json  (se usa para generar js/zonas-envio.js). Cachea lo ya descargado en herramientas/cache-zonas/.
Uso: python herramientas/calcular-zonas.py
"""
import json, math, os, sys, time, urllib.parse, urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(AQUI, 'cache-zonas')
os.makedirs(CACHE, exist_ok=True)
UA = {'User-Agent': 'ProMuebles-calculo-envios/1.0 (pablodelia80@gmail.com)'}

def http(url, data=None, intentos=3):
    for i in range(intentos):
        try:
            req = urllib.request.Request(url, data=(urllib.parse.urlencode({'data': data}).encode() if data else None), headers=UA)
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.loads(r.read().decode('utf-8'))
        except Exception as e:
            time.sleep(4 * (i + 1))
    return None

def cacheado(nombre, fn):
    f = os.path.join(CACHE, nombre + '.json')
    if os.path.exists(f):
        return json.load(open(f, encoding='utf-8'))
    v = fn()
    if v is not None:
        json.dump(v, open(f, 'w', encoding='utf-8'), ensure_ascii=False)
    return v

def log(*a):
    print(*a, flush=True)

# ---- zonas por partido (clasificación de uso común) ----
NORTE = ['Vicente López', 'San Isidro', 'San Fernando', 'Tigre', 'General San Martín', 'San Miguel', 'Malvinas Argentinas', 'José C. Paz', 'Pilar', 'Escobar']
OESTE = ['Tres de Febrero', 'Hurlingham', 'Ituzaingó', 'Morón', 'La Matanza', 'Merlo', 'Moreno', 'General Rodríguez', 'Marcos Paz']
SUR = ['Avellaneda', 'Lanús', 'Lomas de Zamora', 'Quilmes', 'Berazategui', 'Florencio Varela', 'Almirante Brown', 'Esteban Echeverría', 'Ezeiza', 'Presidente Perón', 'San Vicente', 'Cañuelas']
ZONA = {p: 'N' for p in NORTE}; ZONA.update({p: 'O' for p in OESTE}); ZONA.update({p: 'S' for p in SUR})

# ---- límite de CABA ----
def poligono(q):
    r = http('https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode({'q': q, 'format': 'json', 'polygon_geojson': 1, 'limit': 5, 'countrycodes': 'ar'}))
    time.sleep(1.2)
    for c in r or []:
        g = c.get('geojson')
        if g and g['type'] in ('Polygon', 'MultiPolygon'):
            return {'osm_type': c.get('osm_type'), 'osm_id': c.get('osm_id'), 'geo': g}
    return None

caba = cacheado('caba', lambda: poligono('Ciudad Autónoma de Buenos Aires, Argentina'))
def anillos(g): return [p[0] for p in (g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']])]
rings = anillos(caba['geo'])
R = 6371.0088
def xy(lon, lat, lat0): return (math.radians(lon) * R * math.cos(math.radians(lat0)), math.radians(lat) * R)
def seg(p, a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]
    t = 0 if dx == dy == 0 else max(0, min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)))
    return math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy))
def dentro(lon, lat):
    ins = False
    for ring in rings:
        j = len(ring) - 1
        for i in range(len(ring)):
            xi, yi = ring[i]; xj, yj = ring[j]
            if ((yi > lat) != (yj > lat)) and (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi): ins = not ins
            j = i
    return ins
def recta(lon, lat):
    if dentro(lon, lat): return 0.0
    p = xy(lon, lat, lat); best = 1e9
    for ring in rings:
        pts = [xy(x, y, lat) for x, y in ring]
        for i in range(len(pts) - 1): best = min(best, seg(p, pts[i], pts[i + 1]))
    return best

# ---- localidades por partido ----
TIPOS = 'suburb|neighbourhood|town|village|hamlet|quarter|city'
lugares = []
for partido in ZONA:
    def bajar(p=partido):
        r = http('https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode({'q': 'Partido de %s, Buenos Aires, Argentina' % p, 'format': 'json', 'limit': 5, 'countrycodes': 'ar'}))
        time.sleep(1.2)
        rel = [c for c in (r or []) if c.get('osm_type') == 'relation']
        if not rel: return None
        area = 3600000000 + int(rel[0]['osm_id'])
        q = '[out:json][timeout:90];area(%d)->.a;(node["place"~"^(%s)$"](area.a);way["place"~"^(%s)$"](area.a););out center tags;' % (area, TIPOS, TIPOS)
        d = http('https://overpass-api.de/api/interpreter', q)
        time.sleep(2)
        return d
    d = cacheado('partido-' + partido.replace(' ', '_'), bajar)
    if not d:
        log('SIN DATOS', partido); continue
    n = 0
    for e in d['elements']:
        nom = e.get('tags', {}).get('name'); tipo = e.get('tags', {}).get('place')
        lat = e.get('lat') or e.get('center', {}).get('lat'); lon = e.get('lon') or e.get('center', {}).get('lon')
        if not nom or lat is None: continue
        r = recta(lon, lat)
        if r > 60: continue
        if r > 12 and tipo in ('neighbourhood', 'quarter', 'hamlet'): continue  # lejos: solo localidades principales
        lugares.append({'n': nom, 'p': partido, 'z': ZONA[partido], 'lat': lat, 'lon': lon, 'recta': round(r, 2), 'tipo': tipo}); n += 1
    log('%-22s %4d lugares' % (partido, n))

# deduplicar por (nombre, partido)
dedup = {}
for l in lugares:
    k = (l['n'].lower(), l['p'])
    if k not in dedup or l['recta'] < dedup[k]['recta']: dedup[k] = l
lugares = list(dedup.values())
log('Total lugares:', len(lugares))

# ---- puertas de entrada: vértices del límite terrestre de CABA (General Paz y Riachuelo), sin la costa del río ----
fuentes = []
ult = None
for ring in rings:
    for lon, lat in ring:
        costa = (lat > -34.60 and lon > -58.455) or (lon > -58.37 and lat > -34.66)
        if costa: continue
        if ult is None or math.hypot(*[a - b for a, b in zip(xy(lon, lat, lat), xy(ult[0], ult[1], lat))]) > 1.8:
            fuentes.append((lon, lat)); ult = (lon, lat)
log('Puertas de entrada:', len(fuentes))

# ---- distancia por calle (OSRM table), mínimo entre puertas ----
def tabla(srcs, dsts):
    coords = ';'.join('%f,%f' % c for c in srcs + dsts)
    s = ';'.join(str(i) for i in range(len(srcs)))
    d = ';'.join(str(len(srcs) + i) for i in range(len(dsts)))
    url = 'https://router.project-osrm.org/table/v1/driving/%s?sources=%s&destinations=%s&annotations=distance' % (coords, s, d)
    return http(url)

TAM_S, TAM_D = 25, 75
for i in range(0, len(lugares), TAM_D):
    lote = lugares[i:i + TAM_D]
    mejor = [None] * len(lote)
    for j in range(0, len(fuentes), TAM_S):
        k = 'osrm-%d-%d' % (i, j)
        r = cacheado(k, lambda: tabla(fuentes[j:j + TAM_S], [(l['lon'], l['lat']) for l in lote]))
        time.sleep(0.6)
        if not r or 'distances' not in r: log('falló lote', i, j); continue
        for fila in r['distances']:
            for idx, v in enumerate(fila):
                if v is not None and (mejor[idx] is None or v < mejor[idx]): mejor[idx] = v
    for idx, l in enumerate(lote):
        l['km'] = None if mejor[idx] is None else round(mejor[idx] / 1000, 1)
    log('calculado', min(i + TAM_D, len(lugares)), '/', len(lugares))

ok = [l for l in lugares if l.get('km') is not None]
json.dump(ok, open(os.path.join(AQUI, 'zonas-calculadas.json'), 'w', encoding='utf-8'), ensure_ascii=False)
log('Guardado. Con distancia:', len(ok), 'de', len(lugares))

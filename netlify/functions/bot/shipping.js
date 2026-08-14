// Cálculo real de costo de envío: geocodifica el lugar que menciona el cliente
// y mide la distancia de MANEJO real (OSRM, gratis, sin API key) a la fábrica
// y al centro de CABA. Si OSRM falla, cae a línea recta (Haversine) como respaldo.

const { NEGOCIO } = require('./knowledge');

const OBELISCO = { lat: -34.6037, lon: -58.3816 };

let factoryCoordsCache = null;

async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ar&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'ProMuebles-BotWeb-Prototipo/1.0 (uso interno, prueba)' },
  });
  if (!res.ok) throw new Error(`Nominatim respondió ${res.status}`);
  const data = await res.json();
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), label: data[0].display_name };
}

function haversineKm(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lon - a.lon) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function osrmDrivingKm(a, b) {
  const url = `https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=false`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM respondió ${res.status}`);
  const data = await res.json();
  if (data.code !== 'Ok' || !data.routes || !data.routes.length) throw new Error('OSRM sin ruta');
  return data.routes[0].distance / 1000;
}

async function drivingKm(a, b) {
  try {
    return await osrmDrivingKm(a, b);
  } catch (e) {
    console.error('OSRM falló, uso línea recta como respaldo:', e.message);
    return haversineKm(a, b);
  }
}

async function getFactoryCoords() {
  if (factoryCoordsCache) return factoryCoordsCache;
  const coords = await geocode(NEGOCIO.fabrica.direccion);
  if (!coords) throw new Error('No se pudo geocodificar la dirección de la fábrica');
  factoryCoordsCache = coords;
  return coords;
}

function tierForDistance(km) {
  for (const tramo of NEGOCIO.envio.tramos_desde_caba) {
    if (km <= tramo.hasta_km) return tramo.precio;
  }
  return null; // fuera de rango conocido
}

async function calcularEnvio(localidad) {
  const destino = await geocode(`${localidad}, Argentina`);
  if (!destino) {
    return { ok: false, motivo: 'no_encontrado' };
  }

  const fabrica = await getFactoryCoords();
  const kmFabrica = await drivingKm(fabrica, destino);

  if (kmFabrica <= NEGOCIO.envio.radio_gratis_fabrica_km) {
    return { ok: true, gratis: true, motivo: 'cerca_fabrica', km_fabrica: Math.round(kmFabrica * 10) / 10 };
  }

  const kmCaba = await drivingKm(OBELISCO, destino);
  const precio = tierForDistance(kmCaba);

  if (precio === null) {
    return { ok: true, fuera_de_rango: true, km_caba: Math.round(kmCaba * 10) / 10 };
  }

  return {
    ok: true,
    gratis: precio === 0,
    precio,
    km_caba: Math.round(kmCaba * 10) / 10,
    lugar_encontrado: destino.label,
  };
}

module.exports = { calcularEnvio };

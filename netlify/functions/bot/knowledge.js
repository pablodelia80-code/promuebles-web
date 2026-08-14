// Catálogo: snapshot estático en products.json (generado a partir de
// ProMuebles Web/js/productos-data.js). Va como JSON, no leyendo el archivo
// original en runtime, porque Netlify empaqueta la función siguiendo los
// require() — un fs.readFileSync a una ruta externa no viaja con el deploy.
// Si productos-data.js cambia, hay que regenerar este products.json.
const catalog = require('./products.json');

function loadCatalog() {
  return catalog;
}

const NOMBRES_BOT = ['Vale', 'Cintia', 'Lorena', 'Euge', 'Romi'];

const NEGOCIO = {
  telefono: '+541168767075',
  whatsapp: 'https://wa.me/5491168767075',
  email: 'promuebles1983@gmail.com',
  fabrica: {
    direccion: 'Moisés Lebensohn 1068, Boulogne, Buenos Aires, Argentina',
  },
  pago: 'El pago se hace en efectivo o transferencia al momento de la entrega. Primero se arma la cama en la habitación del cliente, y recién ahí se hace el pago.',
  personalizacion: 'Todas las camas se fabrican en blanco. Se puede pedir en otro color (wengue, roble kendall, nogal pacífico, negro, gris perla, gris sombra, kentoky) con un adicional de $110.000.',
  tiempos: 'El tiempo de entrega depende de lo que se esté fabricando en el momento y de la zona. Como referencia general en Mercado Libre se informan 5 días hábiles, pero puede ser antes si conviene la zona (Pedro agrupa entregas cercanas para aprovechar el viaje) o algo más si hay mucha demanda. Para una fecha más precisa, lo mejor es preguntarle directo a Pedro.',
  envio: {
    resumen: 'El costo de envío se calcula según la distancia. Gratis cerca de la fábrica (Boulogne, zona norte) y dentro de CABA + 10km alrededor. Más lejos, el precio sube por tramos de distancia.',
    tramos_desde_caba: [
      { hasta_km: 10, precio: 0 },
      { hasta_km: 20, precio: 40000 },
      { hasta_km: 30, precio: 60000 },
      { hasta_km: 40, precio: 80000 },
      { hasta_km: 60, precio: 95000 },
    ],
    radio_gratis_fabrica_km: 10,
  },
  handoff: 'Por ahora, si el cliente quiere hablar con una persona (Pedro o Pablo), se le pasa el link de WhatsApp de ProMuebles para que continúe la charla ahí.',
};

module.exports = { loadCatalog, NEGOCIO, NOMBRES_BOT };

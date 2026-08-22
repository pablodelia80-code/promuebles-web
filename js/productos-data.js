// Real product data extracted from the original ProMuebles catalog (prices) + real catalog specs (Pablo, ago 2026)

const CATEGORIES = [
  { id: '1-plaza', nombre: '1 Plaza' },
  { id: '1-plaza-y-media', nombre: '1 Plaza y Media' },
  { id: '2-plazas', nombre: '2 Plazas' },
  { id: 'queen', nombre: 'Queen' },
  { id: 'king', nombre: 'King' },
  { id: 'personalizacion', nombre: 'Personalización' }
];

const PRODUCTS = [
  // 1 Plaza
  { n: 'Modelo 1 plaza Vip', cat: '1-plaza', medida: '80 × 190 cm', img: 'assets/productos/1-plaza-VIP-1.jpg', price: 365000,
    resumen: '6 cajones, 1 botinero y 1 baulera.',
    specs: ['6 cajones laterales', '1 botinero al pie', '1 baulera central grande', 'Medida total: 193 × 83 cm · Altura: 42 cm', 'Cajones de 40 × 40 × 15 cm', 'Baulera central de 145 × 35 × 40 cm', 'Melamina de 15 mm, blanca por dentro y por fuera', 'Soporta hasta 400 kg', 'Corredera telescópica reforzada'] },

  // 1 Plaza y Media
  { n: 'Modelo de Plaza y Media (Esquinero)', cat: '1-plaza-y-media', medida: '105 × 190 cm', img: 'assets/productos/1-plaza-y-media-VIP-Esquinero.jpg', price: 420000,
    clientPhotos: ['assets/producto-fotos/plaza-media-esquinero-1.jpg','assets/producto-fotos/plaza-media-esquinero-2.jpg','assets/producto-fotos/plaza-media-esquinero-3.jpg','assets/producto-fotos/plaza-media-esquinero-4.jpg'],
    resumen: 'Modelo pensado para un rincón: los 6 cajones están todos de un mismo lateral, y el lateral opuesto lo ocupa la baulera, por eso ese lado va contra la pared sin perder acceso a nada. Suma 2 botineros al pie.',
    specs: ['6 cajones laterales', '2 botineros al pie (4 pares cada uno)', '1 baulera central', 'Medida total: 193 × 103 cm · Altura: 42 cm', 'Cajones de 48 × 40 × 15 cm', 'Baulera central de 145 × 55 × 40 cm', 'Melamina de 15 mm, blanca por dentro y por fuera', 'Soporta hasta 600 kg', 'Corredera telescópica reforzada'] },
  { n: 'Modelo 8 Vip Plaza y Media', cat: '1-plaza-y-media', medida: '105 × 190 cm', img: 'assets/productos/1-plaza-y-media-VIP-1.jpg', price: 420000,
    resumen: '8 cajones laterales, 2 botineros y 2 bauleras.',
    specs: ['8 cajones laterales (4 de cada lado)', '2 botineros al pie (4 pares cada uno)', '2 bauleras en la cabecera de 67 × 38 × 40 cm', 'Medida total: 193 × 103 cm · Altura: 42 cm', 'Cajones de 48 × 40 × 15 cm', 'Melamina de 15 mm, blanca por dentro y por fuera', 'Soporta hasta 600 kg', 'Corredera telescópica reforzada'] },
  { n: 'Modelo 12 Vip Plaza y Media', cat: '1-plaza-y-media', medida: '105 × 190 cm', img: 'assets/productos/1-plaza-y-media-12-VIP.jpg', price: 440000,
    clientPhotos: ['assets/producto-fotos/12-vip-plaza-y-media-1.jpg'],
    resumen: '12 cajones (8 laterales y 4 frontales) y 2 bauleras.',
    specs: ['8 cajones laterales (4 de cada lado)', '4 cajones frontales al pie', '2 bauleras en la cabecera de 67 × 38 × 40 cm', 'Medida total: 193 × 103 cm · Altura: 42 cm', 'Cajones laterales de 48 × 40 × 15 cm', 'Cajones frontales de 45 × 40 × 15 cm', 'Melamina de 15 mm, blanca por dentro y por fuera', 'Soporta hasta 600 kg', 'Corredera telescópica reforzada'] },

  // 2 Plazas
  { n: '8 Vip', cat: '2-plazas', medida: '140 × 190 cm', img: 'assets/productos/1-8-VIP.jpg', price: 440000, priceOld: 545000, oferta: true,
    clientPhotos: ['assets/producto-fotos/8-vip-1.jpg','assets/producto-fotos/8-vip-2.jpg','assets/producto-fotos/8-vip-3.jpg','assets/producto-fotos/8-vip-4.jpg','assets/producto-fotos/8-vip-5.jpg','assets/producto-fotos/8-vip-6.jpg','assets/producto-fotos/8-vip-7.jpg','assets/producto-fotos/8-vip-8.jpg','assets/producto-fotos/8-vip-9.jpg'],
    resumen: '8 cajones, 2 botineros y 3 bauleras.',
    specs: ['8 cajones (4 de cada lado)', '2 botineros al pie', '3 bauleras: 1 central grande y 2 en la cabecera', 'Medida total: 193 × 143 cm · Altura: 42 cm', 'Cajones de 48 × 40 × 15 cm', 'Baulera central de 102 × 50 × 40 cm', 'Melamina de 15 mm, blanca por dentro y por fuera', 'Soporta hasta 800 kg', 'Corredera telescópica reforzada'] },
  { n: 'Modelo 4 Vip', cat: '2-plazas', medida: '140 × 190 cm', img: 'assets/productos/1-4-VIP.jpg', price: 450000,
    clientPhotos: ['assets/producto-fotos/4-vip-1.jpg','assets/producto-fotos/4-vip-2.jpg','assets/producto-fotos/4-vip-3.jpg','assets/producto-fotos/4-vip-4.jpg','assets/producto-fotos/4-vip-5.jpg','assets/producto-fotos/4-vip-6.jpg','assets/producto-fotos/4-vip-7.jpg','assets/producto-fotos/4-vip-8.jpg'],
    resumen: '4 cajones, 2 botineros y 3 bauleras.',
    specs: ['4 cajones laterales', '2 botineros al pie', '3 bauleras: 1 central grande y 2 en la cabecera', 'Medida total: 193 × 143 cm · Altura: 42 cm', 'Cajones de 48 × 40 × 30 cm', 'Baulera central de 102 × 50 × 40 cm', 'Melamina de 15 mm, blanca por dentro y por fuera', 'Soporta hasta 800 kg', 'Corredera telescópica reforzada'] },
  { n: 'Modelo 6 Vip', cat: '2-plazas', medida: '140 × 190 cm', img: 'assets/productos/1-6-VIP.jpg', price: 470000,
    clientPhotos: ['assets/producto-fotos/6-vip-1.jpg','assets/producto-fotos/6-vip-2.jpg','assets/producto-fotos/6-vip-3.jpg','assets/producto-fotos/6-vip-4.jpg','assets/producto-fotos/6-vip-5.jpg','assets/producto-fotos/6-vip-6.jpg','assets/producto-fotos/6-vip-7.jpg','assets/producto-fotos/6-vip-8.jpg','assets/producto-fotos/6-vip-9.jpg','assets/producto-fotos/6-vip-10.jpg'],
    resumen: '6 cajones y 3 bauleras.',
    specs: ['6 cajones: 4 laterales y 2 al pie', '3 bauleras: 1 central grande y 2 en la cabecera', 'Medida total: 193 × 143 cm · Altura: 42 cm', 'Cajones de 48 × 40 × 30 cm', 'Baulera central de 102 × 50 × 40 cm', 'Melamina de 15 mm, blanca por dentro y por fuera', 'Soporta hasta 800 kg', 'Corredera telescópica reforzada'] },
  { n: 'Modelo con Estantes Vip', cat: '2-plazas', medida: '140 × 190 cm', img: 'assets/productos/Modelo-Cajones-VIP.jpg', price: 470000,
    resumen: '6 cajones, 3 bauleras y estantes en los pies.',
    specs: ['6 cajones laterales, blancos por dentro y por fuera', '3 bauleras: 1 central grande y 2 en la cabecera', '6 estantes en los pies', 'Medida total: 193 × 143 cm · Altura: 42 cm', 'Cajones de 48 × 40 × 30 cm', 'Melamina de 15 mm', 'Soporta hasta 800 kg', 'Correderas telescópicas reforzadas'] },
  { n: 'Modelo 10 Vip', cat: '2-plazas', medida: '140 × 190 cm', img: 'assets/productos/4.jpg', price: 515000,
    clientPhotos: ['assets/producto-fotos/10-vip-1.jpg','assets/producto-fotos/10-vip-2.jpg','assets/producto-fotos/10-vip-3.jpg','assets/producto-fotos/10-vip-4.jpg','assets/producto-fotos/10-vip-5.jpg','assets/producto-fotos/10-vip-6.jpg','assets/producto-fotos/10-vip-7.jpg'],
    resumen: '10 cajones y 3 bauleras.',
    specs: ['10 cajones: 4 de cada lado y 2 frontales', '3 bauleras: 1 central grande y 2 en la cabecera', 'Medida total: 193 × 143 cm · Altura: 42 cm', '8 cajones laterales de 48 × 40 × 30 cm', '2 cajones frontales de 65 × 40 × 30 cm', 'Melamina de 15 mm, blanca por dentro y por fuera', 'Soporta hasta 800 kg', 'Corredera telescópica reforzada'] },
  { n: 'Modelo 12 Vip', cat: '2-plazas', medida: '140 × 190 cm', img: 'assets/productos/1-12-VIP.jpg', price: 540000,
    clientPhotos: ['assets/producto-fotos/12-vip-1.jpg','assets/producto-fotos/12-vip-2.jpg','assets/producto-fotos/12-vip-3.jpg','assets/producto-fotos/12-vip-4.jpg','assets/producto-fotos/12-vip-5.jpg','assets/producto-fotos/12-vip-6.jpg'],
    resumen: '12 cajones y 3 bauleras.',
    specs: ['12 cajones: 4 de cada lado y 4 al pie', '3 bauleras: 1 central grande y 2 en la cabecera', 'Medida total: 193 × 143 cm · Altura: 42 cm', 'Cajones de 48 × 40 × 15 cm', 'Baulera central de 102 × 50 × 40 cm', 'Melamina de 15 mm, blanca por dentro y por fuera', 'Soporta hasta 800 kg', 'Corredera telescópica reforzada'] },
  { n: 'Modelo 18 Vip', cat: '2-plazas', medida: '140 × 190 cm', img: 'assets/productos/18-VIP.jpg', price: 735000,
    clientPhotos: ['assets/producto-fotos/18-vip-1.jpg','assets/producto-fotos/18-vip-2.jpg','assets/producto-fotos/18-vip-3.jpg','assets/producto-fotos/18-vip-4.jpg'],
    resumen: '18 cajones y 3 bauleras.',
    specs: ['18 cajones: 6 laterales y 6 frontales', '3 bauleras: 1 central grande y 2 en la cabecera', 'Medida total: 193 × 143 cm · Altura: 55 cm (el colchón comienza a los 52 cm)', 'Cajones de 48 × 40 × 12 cm', 'Melamina de 15 mm, blanca por dentro y por fuera', 'Soporta hasta 800 kg', 'Corredera telescópica reforzada'] },

  // Queen
  { n: 'Modelo 4 Vip Queen', cat: 'queen', medida: '160 × 200 cm', img: 'assets/productos/1-4-VIP.jpg', price: 460000,
    clientPhotos: ['assets/producto-fotos/4-vip-1.jpg','assets/producto-fotos/4-vip-2.jpg','assets/producto-fotos/4-vip-3.jpg','assets/producto-fotos/4-vip-4.jpg','assets/producto-fotos/4-vip-5.jpg','assets/producto-fotos/4-vip-6.jpg','assets/producto-fotos/4-vip-7.jpg','assets/producto-fotos/4-vip-8.jpg'],
    resumen: '4 cajones, 2 botineros y 3 bauleras.',
    specs: ['4 cajones laterales', '2 botineros al pie', '3 bauleras: 1 central grande y 2 en la cabecera', 'Medida total: 203 × 163 cm · Altura: 42 cm', 'Cajones de 48 × 40 × 30 cm', 'Baulera central de 102 × 70 × 40 cm', 'Melamina de 15 mm, blanca por dentro y por fuera', 'Soporta hasta 800 kg', 'Corredera telescópica reforzada'] },
  { n: 'Modelo 6 Vip Queen', cat: 'queen', medida: '160 × 200 cm', img: 'assets/productos/1-6-VIP.jpg', price: 480000,
    clientPhotos: ['assets/producto-fotos/6-vip-1.jpg','assets/producto-fotos/6-vip-2.jpg','assets/producto-fotos/6-vip-3.jpg','assets/producto-fotos/6-vip-4.jpg','assets/producto-fotos/6-vip-5.jpg','assets/producto-fotos/6-vip-6.jpg','assets/producto-fotos/6-vip-7.jpg','assets/producto-fotos/6-vip-8.jpg','assets/producto-fotos/6-vip-9.jpg','assets/producto-fotos/6-vip-10.jpg'],
    resumen: '6 cajones y 3 bauleras.',
    specs: ['6 cajones: 4 laterales y 2 al pie', '3 bauleras: 1 central grande y 2 en la cabecera', 'Medida total: 203 × 163 cm · Altura: 42 cm', 'Cajones de 48 × 40 × 30 cm', 'Baulera central de 102 × 70 × 40 cm', 'Melamina de 15 mm, blanca por dentro y por fuera', 'Soporta hasta 800 kg', 'Corredera telescópica reforzada'] },
  { n: 'Modelo 8 Vip Queen', cat: 'queen', medida: '160 × 200 cm', img: 'assets/productos/1-8-VIP.jpg', price: 495000,
    clientPhotos: ['assets/producto-fotos/8-vip-1.jpg','assets/producto-fotos/8-vip-2.jpg','assets/producto-fotos/8-vip-3.jpg','assets/producto-fotos/8-vip-4.jpg','assets/producto-fotos/8-vip-5.jpg','assets/producto-fotos/8-vip-6.jpg','assets/producto-fotos/8-vip-7.jpg','assets/producto-fotos/8-vip-8.jpg','assets/producto-fotos/8-vip-9.jpg'],
    resumen: '8 cajones, 2 botineros y 3 bauleras.',
    specs: ['8 cajones (4 de cada lado)', '2 botineros al pie', '3 bauleras: 1 central grande y 2 en la cabecera', 'Medida total: 203 × 163 cm · Altura: 42 cm', 'Cajones de 48 × 40 × 15 cm', 'Baulera central de 102 × 70 × 40 cm', 'Melamina de 15 mm, blanca por dentro y por fuera', 'Soporta hasta 800 kg', 'Corredera telescópica reforzada'] },
  { n: 'Modelo 10 Vip Queen', cat: 'queen', medida: '160 × 200 cm', img: 'assets/productos/4.jpg', price: 525000,
    clientPhotos: ['assets/producto-fotos/10-vip-1.jpg','assets/producto-fotos/10-vip-2.jpg','assets/producto-fotos/10-vip-3.jpg','assets/producto-fotos/10-vip-4.jpg','assets/producto-fotos/10-vip-5.jpg','assets/producto-fotos/10-vip-6.jpg','assets/producto-fotos/10-vip-7.jpg'],
    resumen: '10 cajones y 3 bauleras.',
    specs: ['10 cajones: 4 de cada lado y 2 frontales', '3 bauleras: 1 central grande y 2 en la cabecera', 'Medida total: 203 × 163 cm · Altura: 42 cm', '8 cajones laterales de 48 × 40 × 30 cm', '2 cajones frontales de 75 × 40 × 30 cm', 'Melamina de 15 mm, blanca por dentro y por fuera', 'Soporta hasta 800 kg', 'Corredera telescópica reforzada'] },
  { n: 'Modelo 12 Vip Queen', cat: 'queen', medida: '160 × 200 cm', img: 'assets/productos/1-12-VIP.jpg', price: 540000,
    clientPhotos: ['assets/producto-fotos/12-vip-1.jpg','assets/producto-fotos/12-vip-2.jpg','assets/producto-fotos/12-vip-3.jpg','assets/producto-fotos/12-vip-4.jpg','assets/producto-fotos/12-vip-5.jpg','assets/producto-fotos/12-vip-6.jpg'],
    resumen: '12 cajones y 3 bauleras.',
    specs: ['12 cajones: 4 de cada lado y 4 al pie', '3 bauleras: 1 central grande y 2 en la cabecera', 'Medida total: 203 × 163 cm · Altura: 42 cm', 'Cajones de 48 × 40 × 15 cm', 'Baulera central de 102 × 70 × 40 cm', 'Melamina de 15 mm, blanca por dentro y por fuera', 'Soporta hasta 800 kg', 'Corredera telescópica reforzada'] },
  { n: 'Modelo Estantes Vip Queen', cat: 'queen', medida: '160 × 200 cm', img: 'assets/productos/Modelo-Cajones-VIP-1.jpg', price: 510000,
    resumen: '6 cajones, 3 bauleras y estantes en los pies.',
    specs: ['6 cajones laterales, blancos por dentro y por fuera', '3 bauleras: 1 central grande y 2 en la cabecera', '6 estantes en los pies', 'Medida total: 203 × 163 cm · Altura: 42 cm', 'Cajones de 48 × 40 × 30 cm', 'Melamina de 15 mm', 'Soporta hasta 800 kg', 'Correderas telescópicas reforzadas'] },
  { n: 'Modelo 18 Vip Queen', cat: 'queen', medida: '160 × 200 cm', img: 'assets/productos/18-VIP.jpg', price: 780000,
    clientPhotos: ['assets/producto-fotos/18-vip-1.jpg','assets/producto-fotos/18-vip-2.jpg','assets/producto-fotos/18-vip-3.jpg','assets/producto-fotos/18-vip-4.jpg'],
    resumen: '18 cajones y 3 bauleras.',
    specs: ['18 cajones: 6 laterales y 6 frontales', '3 bauleras: 1 central grande y 2 en la cabecera', 'Medida total: 203 × 163 cm · Altura: 55 cm (el colchón comienza a los 52 cm)', 'Cajones de 48 × 40 × 12 cm', 'Melamina de 15 mm, blanca por dentro y por fuera', 'Soporta hasta 800 kg', 'Corredera telescópica reforzada'] },

  // King 180x200
  { n: '8 Vip King', cat: 'king', subcat: 'king-180', medida: 'King 180 × 200 cm', img: 'assets/productos/1-King-8.jpg', price: 650000,
    clientPhotos: ['assets/producto-fotos/king-8-vip-1.jpg','assets/producto-fotos/king-8-vip-2.jpg','assets/producto-fotos/king-8-vip-3.jpg','assets/producto-fotos/king-8-vip-4.jpg'],
    resumen: '14 cajones y 5 bauleras.',
    specs: ['8 cajones (4 de cada lado)', '3 botineros frontales (6 pares cada uno)', '5 bauleras: 2 centrales grandes y 3 en la cabecera', 'Medida total: 203 × 203 cm · Altura: 42 cm', 'Cajones de 48 × 40 × 15 cm', 'Bauleras centrales de 102 × 55 × 40 cm', 'Melamina de 15 mm, blanca por dentro y por fuera', 'Soporta hasta 800 kg', 'Corredera telescópica reforzada'] },
  { n: '14 Vip King', cat: 'king', subcat: 'king-180', medida: 'King 180 × 200 cm', img: 'assets/productos/1-King-14.jpg', price: 695000,
    clientPhotos: ['assets/producto-fotos/king-14-vip-1.jpg','assets/producto-fotos/king-14-vip-2.jpg','assets/producto-fotos/king-14-vip-3.jpg','assets/producto-fotos/king-14-vip-4.jpg','assets/producto-fotos/king-14-vip-5.jpg'],
    resumen: '14 cajones y 5 bauleras.',
    specs: ['14 cajones en total: 8 laterales (4 de cada lado) y 6 frontales', '5 bauleras: 2 centrales grandes y 3 en la cabecera', 'Medida total: 203 × 203 cm · Altura: 42 cm', 'Cajones de 48 × 40 × 15 cm', 'Bauleras centrales de 102 × 55 × 40 cm', 'Melamina de 15 mm, blanca por dentro y por fuera', 'Soporta hasta 800 kg', 'Corredera telescópica reforzada'] },
  // King 200x200
  { n: '8 Vip King', cat: 'king', subcat: 'king-200', medida: 'King 200 × 200 cm', img: 'assets/productos/1-King-8.jpg', price: 670000,
    clientPhotos: ['assets/producto-fotos/king-8-vip-1.jpg','assets/producto-fotos/king-8-vip-2.jpg','assets/producto-fotos/king-8-vip-3.jpg','assets/producto-fotos/king-8-vip-4.jpg'],
    resumen: '14 cajones y 5 bauleras.',
    specs: ['8 cajones (4 de cada lado)', '3 botineros frontales (6 pares cada uno)', '5 bauleras: 2 centrales grandes y 3 en la cabecera', 'Medida total: 203 × 203 cm · Altura: 42 cm', 'Cajones de 48 × 40 × 15 cm', 'Bauleras centrales de 102 × 55 × 40 cm', 'Melamina de 15 mm, blanca por dentro y por fuera', 'Soporta hasta 800 kg', 'Corredera telescópica reforzada'] },
  { n: '14 Vip King', cat: 'king', subcat: 'king-200', medida: 'King 200 × 200 cm', img: 'assets/productos/1-King-14.jpg', price: 715000,
    clientPhotos: ['assets/producto-fotos/king-14-vip-1.jpg','assets/producto-fotos/king-14-vip-2.jpg','assets/producto-fotos/king-14-vip-3.jpg','assets/producto-fotos/king-14-vip-4.jpg','assets/producto-fotos/king-14-vip-5.jpg'],
    resumen: '14 cajones y 5 bauleras.',
    specs: ['14 cajones en total: 8 laterales (4 de cada lado) y 6 frontales', '5 bauleras: 2 centrales grandes y 3 en la cabecera', 'Medida total: 203 × 203 cm · Altura: 42 cm', 'Cajones de 48 × 40 × 15 cm', 'Bauleras centrales de 102 × 55 × 40 cm', 'Melamina de 15 mm, blanca por dentro y por fuera', 'Soporta hasta 800 kg', 'Corredera telescópica reforzada'] }
];

const COLORS = [
  { n: 'Blanco', sw: '#FFFFFF', compare: 'assets/showroom/compare-blanca.jpg' },
  { n: 'Wengue', sw: '#3B2A1D', tex: 'assets/colores/texture-wengue.jpg', compare: 'assets/showroom/compare-wengue.jpg' },
  { n: 'Roble Kendall', sw: '#A9825A', tex: 'assets/colores/texture-roble-kendall.jpg', compare: 'assets/showroom/compare-roble-kendall.jpg' },
  { n: 'Nogal Pacífico', sw: '#7A5433', tex: 'assets/colores/texture-nogal-pacifico.jpg', compare: 'assets/showroom/compare-nogal-pacifico.jpg' },
  { n: 'Negro', sw: '#1B1512', compare: 'assets/showroom/compare-negro.jpg' },
  { n: 'Gris Perla', sw: '#B9B4AE', compare: 'assets/showroom/compare-gris-perla.jpg' },
  { n: 'Gris Sombra', sw: '#6E6862', compare: 'assets/showroom/compare-gris-sombra.jpg' },
  { n: 'Kentoky', sw: '#8C6B4A', tex: 'assets/colores/texture-kentoky.jpg', compare: 'assets/showroom/compare-kentoky.jpg' }
];
const CAMA_BLANCA = 'assets/showroom/compare-blanca.jpg';

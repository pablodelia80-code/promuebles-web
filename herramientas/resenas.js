// Reseñas REALES de Mercado Libre (extraídas el 01/10/2026). Texto textual, sin cambios. Selección de las mejores aprobada por Pablo.
// No incluir: la reseña con el reclamo sin resolver (2p 12 cajones) ni la que habla de que los cajones se abren por el colchón.
const ML = 'https://www.mercadolibre.com.ar/';
const PUB = {
  vip8: { n: 'Cama box 2 plazas 8 Vip', u: ML + 'cama-box-2-plazas-8-cajones-botineros-bauleras-promuebles-8-vip/p/MLA75655725' },
  p8: { n: 'Cama box 2 plazas 8 cajones', u: ML + 'cama-box-2-plazas-8-cajones-botineros-bauleras--promuebles/up/MLAU3873268966' },
  p10: { n: 'Cama box 2 plazas 10 cajones', u: ML + 'cama-box-2-plazas-10-cajones-bauleras-sommier-promuebles/up/MLAU3900428131' },
  q10: { n: 'Cama box Queen 10 cajones', u: ML + 'cama-box-queen-10-cajones-bauleras-sommier-promuebles/up/MLAU3897407026' },
  q12: { n: 'Cama box Queen 12 cajones', u: ML + 'camabox-queen-12-cajones-bauleras-sommier-promuebles-200x160/up/MLAU3900649885' }
};
const R = (pub, mes, x) => ({ pub: PUB[pub], mes, x });
module.exports = [
  R('q12', 'Septiembre 2026', 'Excelente calidad y muy buenas terminaciones. Los cajones son amplios y los rieles funcionan perfecto, sin trabarse. Compré el modelo de 12 cajones y quedó muy bien. La atención y el armado fueron excelentes: coordinaron rápido y lo dejaron armado en minutos. Muy recomendable ♥️.'),
  R('vip8', 'Septiembre 2026', 'Es muy linda, cómoda y práctica. En menos de una semana ya la tenía en mi casa, los chicos vienen y la arman en 5 minutos, es genial, súper recomiendo !.'),
  R('p8', 'Agosto 2026', 'Hermosa cama!!! muy cómoda!! y muchísimo lugar de guardado. El botinero es espectacular, entran 6 pares grandes de zapatillas!! y los cajones un golazo!. Los chicos, unos genios, en 2 minutos estaba la cama armada. Muy cordiales.'),
  R('q10', 'Agosto 2026', 'Excelente producto,me será de mucha utilidad para aprovechar espacio en un depto chico. Destaco la atención recibida como la instalación que hicieron en tiempo récord y muy profesional. En mi caso tuvieron que subir todo por escalera con mucho esfuerzo y aún así dejaron todo bien y rápido. Super recomendables!. Gracias.'),
  R('p10', 'Septiembre 2026', 'Excelente!! rapidísimo el envío y el armado!! amamos la cama! es muy fuerte y funcional. Recomendadísimo.'),
  R('q12', 'Septiembre 2026', 'Muy buena atención me lo subieron y armaron rapidísimo, súper amables. Recomiendo 100%.'),
  R('p10', 'Agosto 2026', 'Hermosa cama! está cama tiene una altura perfecta de 43cm! no como las otras que vi que tienen 30cm. Los chicos la traen casi armada y en 5 min la dejan lista! un espectáculo.'),
  R('vip8', 'Septiembre 2026', 'Excelente atención, respuesta rápida y entrega acordada. Los chicos muy amables y predispuestos!! El producto es buenísimo!.'),
  R('p10', 'Septiembre 2026', 'Muy buena la calidad, las terminaciones, es linda. El servicio de entrega y armado impecable. Muy recomendable. Gracias!.'),
  R('q12', 'Septiembre 2026', 'Muy buena calidad, tiene la funcionalidad perfecta para departamentos y ambientes pequeños, cuenta con un reborde que hace que el colchón no se mueva, y la atención por parte de los chicos es excelente.'),
  R('p8', 'Mayo 2026', 'Excelente calidad de producto, lo instalaron muy rápido, me encantó todo muy lindo y buena calidad. Volvería a comprarla.'),
  R('vip8', 'Septiembre 2026', 'Buena atención y predisposición por parte de la empresa. El producto práctico y de buena calidad. Es lo que esperaba !.')
];

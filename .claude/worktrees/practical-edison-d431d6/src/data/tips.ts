export interface Tip {
  slug: string
  titulo: string
  descripcion: string
  imagen: string
  contenido: string
}

export const tips: Tip[] = [
  {
    slug: 'salitre',
    titulo: 'Salitre en Paredes',
    descripcion:
      'El salitre es un depósito de sales minerales que aparece en muros y paredes, causando deterioro estético y estructural. Aprende a identificarlo y eliminarlo.',
    imagen: '/productos/tips/salitre.jpg',
    contenido: `
El salitre, también conocido como eflorescencia, es causado por la migración de sales solubles a través del concreto o mampostería.

**¿Por qué aparece?**
- Humedad excesiva en los muros
- Materiales de construcción con alto contenido de sales
- Falta de impermeabilización adecuada

**¿Cómo eliminarlo?**
1. Cepilla la superficie afectada con un cepillo de cerdas duras
2. Aplica una solución de agua con vinagre o ácido muriático diluido
3. Enjuaga con abundante agua limpia
4. Deja secar completamente
5. Aplica un sellador o impermeabilizante para prevenir recurrencia

**Recomendación FERCADI:** Usa nuestro sellador Ipermax para una protección duradera contra la humedad y el salitre.
    `,
  },
]

export function getTipBySlug(slug: string): Tip | undefined {
  return tips.find((t) => t.slug === slug)
}

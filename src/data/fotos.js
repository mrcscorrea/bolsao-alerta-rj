/**
 * Fotos reais de alagamentos no Rio, com licença livre (Wikimedia Commons).
 * Autor e licença conferidos nos metadados de cada arquivo; as imagens ficam
 * em public/fotos/ para não depender do servidor do Wikimedia.
 */
const commons = (arquivo) => `https://commons.wikimedia.org/wiki/File:${arquivo}`

export const FOTOS = {
  tijuca: {
    src: '/fotos/tijuca-afonso-pena.webp',
    alt: 'Praça Afonso Pena, na Tijuca, alagada de madrugada',
    legenda: 'Praça Afonso Pena, Tijuca, abril de 2010.',
    autor: 'Fabiano Carnevale',
    licenca: 'CC BY 2.0',
    pagina: commons('Superakvego_en_Rio_de_Janeiro_en_2010_placo_Afonso_Pena_je_la_4-a_de_mateno.jpg'),
  },
  botafogo: {
    src: '/fotos/botafogo-voluntarios.webp',
    alt: 'Rua Voluntários da Pátria, em Botafogo, inundada',
    legenda: 'Rua Voluntários da Pátria, Botafogo, abril de 2010.',
    autor: 'Carolina Gonçalves/ABr',
    licenca: 'CC BY 3.0 BR',
    pagina: commons('Chuva_Rio.jpg'),
  },
  onibus: {
    src: '/fotos/onibus-2010.webp',
    alt: 'Ônibus atravessando rua alagada e levantando água',
    legenda: 'Ônibus em rua alagada, abril de 2010.',
    autor: 'Rodrigo Esper',
    licenca: 'CC BY 2.0',
    pagina: commons('Superakvego_en_Rio_de_Janeiro_en_2010_autobuso_1.jpg'),
  },
  santaCruz: {
    src: '/fotos/largo-bodecao.webp',
    alt: 'Pontos de ônibus com água pela metade, em largo alagado',
    legenda: 'Largo do Bodegão, Santa Cruz, 2010.',
    autor: 'Raphael Alves Soares',
    licenca: 'CC BY-SA 3.0',
    pagina: commons('Largo_do_Bodeção_Alagado_-_panoramio.jpg'),
  },
  fusca: {
    src: '/fotos/rua-2010.webp',
    alt: 'Fusca com água até as rodas em avenida alagada',
    legenda: 'Avenida alagada, abril de 2010.',
    autor: 'Rodrigo Esper',
    licenca: 'CC BY 2.0',
    pagina: commons('Superakvego_en_Rio_de_Janeiro_en_2010_strato_1.jpg'),
  },
  catete: {
    src: '/fotos/catete-2021.webp',
    alt: 'Pedestres com água pelos joelhos no cruzamento do Catete',
    legenda: 'Rua do Catete com Silveira Martins, fevereiro de 2021.',
    autor: 'Alberto Lemos',
    licenca: 'CC BY-SA 4.0',
    pagina: commons('Enchente_no_bairro_do_Catete.jpg'),
  },
  avBrasil: {
    src: '/fotos/av-brasil-penha.webp',
    alt: 'Placas de sinalização e trânsito na Avenida Brasil, na Penha',
    legenda: 'Av. Brasil, km 13, Penha.',
    autor: 'Wilfredor',
    licenca: 'CC0',
    pagina: commons('Direction_signs_on_Avenida_Brasil_at_km_13_in_Penha,_Rio_de_Janeiro,_Brazil.jpg'),
  },
}

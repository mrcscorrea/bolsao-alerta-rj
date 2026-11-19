/**
 * Manchetes reais sobre alagamentos em vias do Rio. Título e data foram
 * conferidos na página de cada matéria; o "fato" é um resumo nosso.
 * A foto é ilustrativa (chave de FOTOS): alagamento real no Rio, outra data.
 */
export const MANCHETES = [
  {
    veiculo: 'Correio da Manhã',
    titulo: 'Temporal com raios atinge o Rio e causa alagamentos em várias regiões',
    data: '2026-11-05',
    fato: 'Av. Ayrton Senna, sentido Linha Amarela, alagada na Gardênia Azul; bolsões d’água na Av. das Américas e na Lagoa.',
    local: 'Linha Amarela',
    foto: 'tijuca', // ilustrativa (não é da mesma data)
    url: 'https://www.correiodamanha.com.br/rio-de-janeiro/2026/11/332628-temporal-com-raios-atinge-o-rio-e-causa-alagamentos-em-varias-regioes.html',
  },
  {
    veiculo: 'SBT News',
    titulo: 'Chuva forte atinge Rio de Janeiro e provoca alagamentos',
    data: '2026-10-17',
    fato: 'Chuva durante toda a noite acumulou água em ruas da Barra, de Campo Grande e de São Cristóvão.',
    local: 'São Cristóvão',
    foto: 'botafogo', // ilustrativa (não é da mesma data)
    url: 'https://sbtnews.sbt.com.br/noticia/brasil/chuva-forte-atinge-rio-de-janeiro-e-provoca-alagamentos',
  },
  {
    veiculo: 'Super Rádio Tupi',
    titulo: 'Trânsito travado no Rio após chuvas recordes gera alerta',
    data: '2026-09-24',
    fato: 'Trechos críticos da Av. Brasil e da Linha Vermelha alagaram no setembro mais chuvoso em 29 anos: 171,9 mm.',
    local: 'Av. Brasil',
    foto: 'onibus', // ilustrativa (não é da mesma data)
    url: 'https://www.tupi.fm/?p=2500133',
  },
  {
    veiculo: 'Jornal de Brasília',
    titulo: 'Temporal causa alagamentos na Ilha do Governador, na zona norte do Rio',
    data: '2026-02-20',
    fato: '49,2 mm em duas horas na Ilha do Governador, o maior volume da cidade naquele dia.',
    local: 'Ilha do Governador',
    foto: 'santaCruz', // ilustrativa (não é da mesma data)
    url: 'https://jornaldebrasilia.com.br/noticias/brasil/temporal-causa-alagamentos-na-ilha-do-governador-na-zona-norte-do-rio/',
  },
  {
    veiculo: 'Jovem Pan',
    titulo: 'Chuva intensa causa alagamentos e bloqueia Avenida Brasil no Rio de Janeiro',
    data: '2024-01-21',
    fato: 'Av. Brasil fechada na altura da Vila do João até as equipes drenarem a pista, por volta das 7h45.',
    local: 'Av. Brasil',
    foto: 'fusca', // ilustrativa (não é da mesma data)
    url: 'https://jovempan.com.br/brasil/chuva-intensa-causa-alagamentos-e-bloqueia-avenida-brasil-no-rio-de-janeiro/',
  },
  {
    veiculo: 'Jovem Pan',
    titulo: 'Após estragos causados pela chuva, Rio de Janeiro interdita Avenida Brasil e fecha estações do Metrô',
    data: '2024-01-14',
    fato: 'Av. Brasil interditada e quatro estações da Linha 2 do metrô fechadas pela inundação em Acari.',
    local: 'Av. Brasil',
    foto: 'catete', // ilustrativa (não é da mesma data)
    url: 'https://jovempan.com.br/brasil/apos-estragos-causados-pela-chuva-rio-de-janeiro-interdita-avenida-brasil-e-fecha-estacoes-do-metro/',
  },
]

/** "2026-11-05" → "5 nov. 2026" */
export function formatarData(iso) {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(a, m - 1, d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
}

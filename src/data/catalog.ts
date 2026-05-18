import type { Product } from '../types/domain';
import type { CatalogProduct, CategoriaCatalogo, CategoriaExibida } from '../types/catalog';

const CATEGORIA_POR_NOME: Record<string, CategoriaCatalogo> = {
  'Acer Nitro 5 - TCC Edition': 'Notebooks',
  'Galaxy M13 4GB 64GB': 'Smartphones',
  'Galaxy M33 5G 6GB 128GB': 'Smartphones',
  'Galaxy S22 Ultra 256GB': 'Smartphones',
  'Monitor UltraWide Vision Pro 29': 'Monitores',
  'Caderno Smart Notes 360': 'Cadernos',
  'Teclado Mecanico RGB Pro': 'Perifericos',
  'Mouse Gamer Falcon X': 'Perifericos',
  'Headset Pulse 7.1': 'Acessorios',
  'Webcam Stream HD 1080p': 'Acessorios',
  'Notebook DevBook Air 14': 'Notebooks',
  'Monitor PixelView 24 IPS': 'Monitores',
  'Caderno Study Planner Max': 'Cadernos',
  'Relogio Smart Nexora Fit': 'Acessorios',
  'Tablet Nexora Tab 11': 'Smartphones'
};

const IMAGEM_PADRAO_PRODUTO = '/images.jpeg';

const PRECO_REAL_POR_NOME: Record<string, string> = {
  'Caderno Smart Notes 360': 'R$ 34,90',
  'Caderno Study Planner Max': 'R$ 42,90'
};

const IMAGEM_POR_NOME_PRODUTO: Record<string, string> = {
  'Acer Nitro 5 - TCC Edition': '/acer-nitro-v15-06.avif',
  'Galaxy M13 4GB 64GB': '/celular1.webp',
  'Galaxy M33 5G 6GB 128GB': '/celular1.webp',
  'Galaxy S22 Ultra 256GB': '/celular2.webp',
  'Monitor UltraWide Vision Pro 29': '/monitor.avif',
  'Caderno Smart Notes 360': '/caderno.webp',
  'Teclado Mecanico RGB Pro': '/teclado.jpg',
  'Mouse Gamer Falcon X': '/mouse.webp',
  'Headset Pulse 7.1': '/image.png',
  'Webcam Stream HD 1080p': '/webcam.jpg',
  'Notebook DevBook Air 14': '/notebook1.png',
  'Monitor PixelView 24 IPS': '/monitor.avif',
  'Caderno Study Planner Max': '/caderno.webp',
  'Relogio Smart Nexora Fit': '/relogio.png',
  'Tablet Nexora Tab 11': '/tablet.png'
};

export const PRODUTOS_EXTRAS: Product[] = [
  {
    id: 1001,
    name: 'Relogio Smart Nexora Fit',
    description: 'Relogio inteligente com monitoramento de saude, notificacoes e bateria de longa duracao.',
    comments: []
  },
  {
    id: 1002,
    name: 'Tablet Nexora Tab 11',
    description: 'Tablet de 11 polegadas para estudo e entretenimento, com tela ampla e som imersivo.',
    comments: []
  }
];

export const PROMOCOES_DESTAQUE = [
  {
    id: 'relogio',
    eyebrow: 'Tecnologia no seu pulso',
    title: 'Descubra a colecao de relogios smart',
    category: 'Acessorios' as CategoriaExibida,
    imageUrl:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=820&q=80',
    imageAlt: 'Relogio inteligente em destaque'
  },
  {
    id: 'tablet',
    eyebrow: 'Performance para estudo e trabalho',
    title: 'Explore nossa colecao de tablets',
    category: 'Smartphones' as CategoriaExibida,
    imageUrl:
      'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=820&q=80',
    imageAlt: 'Tablet em destaque'
  }
];

export const DUVIDAS_FREQUENTES = [
  {
    pergunta: 'Frete para capitais',
    resposta: 'Entregas para capitais acontecem entre 2 e 5 dias uteis, conforme disponibilidade do produto.'
  },
  {
    pergunta: 'Frete para interior',
    resposta: 'Para cidades do interior, o prazo medio e de 4 a 10 dias uteis.'
  },
  {
    pergunta: 'Garantia dos produtos',
    resposta: 'Todos os produtos possuem garantia minima de 12 meses contra defeitos de fabricacao.'
  },
  {
    pergunta: 'Trocas e devolucoes',
    resposta: 'Voce pode solicitar troca ou devolucao em ate 7 dias corridos apos o recebimento.'
  },
  {
    pergunta: 'Suporte tecnico',
    resposta: 'O atendimento funciona em horario comercial por WhatsApp e email para duvidas e pos-venda.'
  }
];

export const LINKS_ECOMMERCE = [
  {
    id: 'ofertas',
    icon: 'OF',
    titulo: 'Ofertas da Semana',
    descricao: 'Veja os produtos com maior desconto e condicoes especiais para o seu setup.',
    alvo: 'offers-section'
  },
  {
    id: 'categorias',
    icon: 'CT',
    titulo: 'Categorias em Alta',
    descricao: 'Acesse os itens mais procurados em notebooks, monitores e perifericos.',
    alvo: 'all-products-section'
  },
  {
    id: 'suporte',
    icon: 'SP',
    titulo: 'Suporte de Pedido',
    descricao: 'Consulte prazo, troca e garantia com nosso time de atendimento dedicado.',
    alvo: 'contact-section'
  }
];

export const formatarProdutoCatalogo = (produto: Product, indice: number): CatalogProduct => {
  const tabelaPrecos = ['R$ 3.299', 'R$ 1.049', 'R$ 1.699', 'R$ 3.199'];
  const tabelaDescontos = [
    { oldPrice: 'R$ 7.499', savings: 'R$ 4.200', discountLabel: '56% OFF' },
    { oldPrice: 'R$ 1.499', savings: 'R$ 450', discountLabel: '30% OFF' },
    { oldPrice: 'R$ 2.499', savings: 'R$ 800', discountLabel: '32% OFF' },
    { oldPrice: 'R$ 4.099', savings: 'R$ 900', discountLabel: '22% OFF' }
  ];
  const nomesComDesconto = new Set([
    'Acer Nitro 5 - TCC Edition',
    'Galaxy M33 5G 6GB 128GB',
    'Monitor UltraWide Vision Pro 29',
    'Teclado Mecanico RGB Pro',
    'Notebook DevBook Air 14'
  ]);
  const descontoSelecionado = nomesComDesconto.has(produto.name)
    ? tabelaDescontos[indice % tabelaDescontos.length]
    : undefined;
  const precoSelecionado = PRECO_REAL_POR_NOME[produto.name] ?? tabelaPrecos[indice % tabelaPrecos.length];

  return {
    ...produto,
    price: precoSelecionado,
    oldPrice: descontoSelecionado?.oldPrice,
    savings: descontoSelecionado?.savings,
    discountLabel: descontoSelecionado?.discountLabel,
    imageUrl: IMAGEM_POR_NOME_PRODUTO[produto.name] ?? IMAGEM_PADRAO_PRODUTO,
    buyLink: `https://example.com/produto/${produto.id}`,
    category: CATEGORIA_POR_NOME[produto.name] ?? 'Acessorios'
  };
};

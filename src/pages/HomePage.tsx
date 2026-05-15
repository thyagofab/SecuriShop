import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryTabs } from '../components/molecules/CategoryTabs';
import { ProductDetails } from '../components/organisms/ProductDetails';
import { ProductCard } from '../components/organisms/ProductCard';
import { StoreTemplate } from '../components/templates/StoreTemplate';
import { VulnerableHtml } from '../components/atoms/VulnerableHtml';
import type { Product, Usuario } from '../types/domain';

const API_BASE = 'http://localhost:3001/api';
const CHAVE_TOKEN_LOCALSTORAGE = 'token_usuario_tcc';
const CHAVE_COOKIE_SESSAO = 'token_usuario_tcc';

interface CatalogProduct extends Product {
  price: string;
  oldPrice?: string;
  savings?: string;
  discountLabel?: string;
  imageUrl: string;
  buyLink: string;
  category: 'Cadernos' | 'Smartphones' | 'Notebooks' | 'Monitores' | 'Perifericos' | 'Acessorios';
}

type AlvoNavegacao = 'home' | 'ofertas' | 'categorias' | 'contato' | 'login';
type CategoriaExibida = 'Todos' | CatalogProduct['category'];

const CATEGORIA_POR_NOME: Record<string, CatalogProduct['category']> = {
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

const PRODUTOS_EXTRAS: Product[] = [
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

const PROMOCOES_DESTAQUE = [
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

const DUVIDAS_FREQUENTES = [
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

const LINKS_ECOMMERCE = [
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

const formatarProdutoCatalogo = (produto: Product, indice: number): CatalogProduct => {
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
    imageUrl:
      IMAGEM_POR_NOME_PRODUTO[produto.name] ??
      IMAGEM_PADRAO_PRODUTO,
    buyLink: `https://example.com/produto/${produto.id}`,
    category: CATEGORIA_POR_NOME[produto.name] ?? 'Acessorios'
  };
};

export const HomePage = () => {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [erroComentario, setErroComentario] = useState('');
  const [consulta, setConsulta] = useState('');
  const [idProdutoSelecionado, setIdProdutoSelecionado] = useState<number | null>(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<CategoriaExibida>('Todos');
  const [navegacaoAtiva, setNavegacaoAtiva] = useState<AlvoNavegacao>('home');
  const [indiceDuvidaAberta, setIndiceDuvidaAberta] = useState<number | null>(0);
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [tokenSessao, setTokenSessao] = useState('');
  useEffect(() => {
    const parametros = new URLSearchParams(window.location.search);
    setConsulta(parametros.get('q') ?? '');
    const produtoNaUrl = Number(parametros.get('product') ?? 0);
    setIdProdutoSelecionado(produtoNaUrl > 0 ? produtoNaUrl : null);

    const tokenArmazenado = localStorage.getItem(CHAVE_TOKEN_LOCALSTORAGE) ?? '';
    setTokenSessao(tokenArmazenado);

    if (tokenArmazenado) {
      const carregarSessao = async () => {
        try {
          const resposta = await fetch(`${API_BASE}/auth/me`, {
            headers: {
              Authorization: `Bearer ${tokenArmazenado}`
            }
          });

          if (!resposta.ok) {
            localStorage.removeItem(CHAVE_TOKEN_LOCALSTORAGE);
            setTokenSessao('');
            return;
          }

          const dados = (await resposta.json()) as { user: Usuario };
          // Mantem cookie inseguro sincronizado para demonstracao de XSS.
          document.cookie = `${CHAVE_COOKIE_SESSAO}=${encodeURIComponent(tokenArmazenado)}; path=/; SameSite=Lax`;
          setUsuarioLogado(dados.user);
        } catch {
          localStorage.removeItem(CHAVE_TOKEN_LOCALSTORAGE);
          setTokenSessao('');
        }
      };

      void carregarSessao();
    }
  }, []);

  const buscarProdutos = async () => {
    try {
      setCarregando(true);
      setErro('');
      const resposta = await fetch(`${API_BASE}/products`);
      if (!resposta.ok) {
        throw new Error('Nao foi possivel carregar os produtos.');
      }
      const dados = (await resposta.json()) as Product[];
      setProdutos(dados);
    } catch {
      setErro('Falha ao carregar produtos da API. Confira se o backend esta rodando na porta 3001.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarProdutos();
  }, []);

  const aoBuscar = (termoBusca: string) => {
    setConsulta(termoBusca.trim());
    setNavegacaoAtiva('home');
    setIdProdutoSelecionado(null);
  };

  const abrirProduto = (idProduto: number) => {
    setIdProdutoSelecionado(idProduto);
    setNavegacaoAtiva('ofertas');
  };

  useEffect(() => {
    if (!idProdutoSelecionado) {
      return;
    }

    // Espera a renderizacao dos detalhes para posicionar o usuario no inicio do bloco.
    requestAnimationFrame(() => {
      rolarParaSecao('product-details-section');
    });
  }, [idProdutoSelecionado]);

  const fecharProduto = () => {
    setIdProdutoSelecionado(null);
    setNavegacaoAtiva('ofertas');
    requestAnimationFrame(() => {
      rolarParaSecao('offers-section');
    });
  };

  const rolarParaSecao = (idSecao: string) => {
    const elemento = document.getElementById(idSecao);
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const aoNavegar = (destino: AlvoNavegacao) => {
    setNavegacaoAtiva(destino);
    if (destino === 'home') {
      setIdProdutoSelecionado(null);
      rolarParaSecao('home-section');
    }
    if (destino === 'ofertas') {
      setIdProdutoSelecionado(null);
      setCategoriaSelecionada('Todos');
      requestAnimationFrame(() => {
        rolarParaSecao('offers-section');
      });
    }
    if (destino === 'categorias') {
      rolarParaSecao('categories-section');
    }
    if (destino === 'contato') {
      rolarParaSecao('contact-section');
    }
    if (destino === 'login') {
      navigate('/login');
    }
  };

  const adicionarComentario = async (idProduto: number, conteudo: string) => {
    if (!tokenSessao) {
      setErroComentario('Faca login para comentar.');
      throw new Error('Usuario nao autenticado.');
    }

    setErroComentario('');

    const resposta = await fetch(`${API_BASE}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenSessao}`
      },
      body: JSON.stringify({ productId: idProduto, content: conteudo })
    });

    if (!resposta.ok) {
      const payload = (await resposta.json().catch(() => null)) as { error?: string } | null;
      setErroComentario(payload?.error ?? 'Erro ao salvar comentario.');
      throw new Error('Erro ao salvar comentario.');
    }

    setErroComentario('');
    await buscarProdutos();
  };

  const fazerLogout = () => {
    localStorage.removeItem(CHAVE_TOKEN_LOCALSTORAGE);
    document.cookie = `${CHAVE_COOKIE_SESSAO}=; path=/; Max-Age=0; SameSite=Lax`;
    setTokenSessao('');
    setUsuarioLogado(null);
  };

  const abrirPaginaLogin = () => {
    aoNavegar('login');
  };

  const selecionarCategoria = (categoria: CategoriaExibida) => {
    setCategoriaSelecionada(categoria);
    setNavegacaoAtiva('categorias');
    setIdProdutoSelecionado(null);
    requestAnimationFrame(() => {
      rolarParaSecao('offers-section');
    });
  };

  const produtosCatalogo = useMemo(
    () => [...produtos, ...PRODUTOS_EXTRAS].map(formatarProdutoCatalogo),
    [produtos]
  );
  const produtosFiltradosPorCategoria = useMemo(() => {
    if (categoriaSelecionada === 'Todos') {
      return produtosCatalogo;
    }
    return produtosCatalogo.filter((produto) => produto.category === categoriaSelecionada);
  }, [produtosCatalogo, categoriaSelecionada]);

  const produtosExibidos = categoriaSelecionada === 'Todos' ? produtosCatalogo : produtosFiltradosPorCategoria;
  const produtosEmOferta = useMemo(
    () => produtosCatalogo.filter((produto) => Boolean(produto.discountLabel)),
    [produtosCatalogo]
  );
  const ofertasExibidas = useMemo(() => {
    if (categoriaSelecionada === 'Todos') {
      return produtosEmOferta;
    }
    return produtosEmOferta.filter((produto) => produto.category === categoriaSelecionada);
  }, [produtosEmOferta, categoriaSelecionada]);
  const produtoSelecionado = produtosCatalogo.find((item) => item.id === idProdutoSelecionado);

  return (
    <StoreTemplate
      consulta={consulta}
      aoBuscar={aoBuscar}
      navegacaoAtiva={navegacaoAtiva}
      aoNavegar={aoNavegar}
      usuarioLogado={usuarioLogado}
    >
      {!produtoSelecionado ? (
          <section className="quem-somos-v2" id="quem-somos-section">
            <div className="quem-somos-v2__content">
              <h3>Quem somos?</h3>
              <p>
                A Nexora Tech e um e-commerce especializado em tecnologia para estudo,
                trabalho e entretenimento. Nosso objetivo e facilitar a sua compra com
                informacoes claras, categorias organizadas e ofertas atualizadas.
              </p>
              <p>
                Aqui voce encontra notebooks, smartphones, monitores e acessorios em um
                unico lugar, com navegação simples, comparacao de preco e suporte para
                escolher o produto ideal para o seu setup.
              </p>
            </div>

            <aside className="quem-somos-v2__media" aria-label="Time da Nexora Tech">
              <span className="quem-somos-v2__dot quem-somos-v2__dot--top" aria-hidden="true" />
              <span className="quem-somos-v2__shadow" aria-hidden="true" />
              <img
                src="/logo.png"
                alt="Logo da Nexora Tech"
                loading="lazy"
              />
              <span className="quem-somos-v2__dot quem-somos-v2__dot--bottom" aria-hidden="true" />
            </aside>
        </section>
      ) : null}

        {!produtoSelecionado ? (
          <section className="links-ecommerce" aria-label="Links uteis da loja">
            <div className="links-ecommerce__header">
              <h3>Links Uteis</h3>
              <p>
                Navegue pelos principais atalhos do e-commerce para acompanhar ofertas,
                consultar categorias e acessar o suporte da sua compra.
              </p>
            </div>
            <div className="links-ecommerce__grid">
              {LINKS_ECOMMERCE.map((link) => (
                <article key={link.id} className="links-ecommerce__card">
                  <div className="links-ecommerce__icon" aria-hidden="true">{link.icon}</div>
                  <h4>{link.titulo}</h4>
                  <p>{link.descricao}</p>
                  <button
                    type="button"
                    className="links-ecommerce__cta"
                    onClick={() => rolarParaSecao(link.alvo)}
                  >
                    Acesse
                  </button>
                </article>
              ))}
            </div>
          </section>
        ) : null}

      {!produtoSelecionado ? (
        <section className="featured-promos" aria-label="Promocoes em destaque">
          {PROMOCOES_DESTAQUE.map((promo) => (
            <article key={promo.id} className="featured-promo-card">
              <div className="featured-promo-card__content">
                <p className="featured-promo-card__eyebrow">{promo.eyebrow}</p>
                <h3>{promo.title}</h3>
                <button
                  type="button"
                  className="featured-promo-card__cta"
                  onClick={() => selecionarCategoria(promo.category)}
                >
                  Shop now
                </button>
              </div>
              <div className="featured-promo-card__media" aria-hidden="true">
                <img src={promo.imageUrl} alt={promo.imageAlt} loading="lazy" />
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {!produtoSelecionado ? (
        <div id="categories-section">
          <CategoryTabs
            categoriaSelecionada={categoriaSelecionada}
            aoSelecionarCategoria={(categoria) => selecionarCategoria(categoria as CategoriaExibida)}
          />
        </div>
      ) : null}

      {consulta ? (
        <section className="status-text">
          <p>Busca atual (XSS Refletido):</p>
          <VulnerableHtml content={consulta} className="comment-content" />
        </section>
      ) : null}

      {carregando ? <p className="status-text">Carregando produtos...</p> : null}
      {erro ? <p className="status-text status-text--error">{erro}</p> : null}

      {!carregando && !erro && produtoSelecionado ? (
        <section id="product-details-section">
          <ProductDetails
            produto={produtoSelecionado}
            aoVoltar={fecharProduto}
            aoAdicionarComentario={adicionarComentario}
            usuarioLogado={usuarioLogado}
            erroComentario={erroComentario}
            aoLogout={fazerLogout}
            aoIrParaLogin={abrirPaginaLogin}
          />
        </section>
      ) : null}

      {!carregando && !erro && !produtoSelecionado ? (
        <>
          <section className="section-head" id="offers-section">
            <h3>Ofertas</h3>
          </section>
          <section className="catalog-grid">
            {ofertasExibidas.map((produto) => (
              <ProductCard key={`oferta-${produto.id}`} product={produto} aoSelecionar={abrirProduto} />
            ))}
          </section>

          <section className="section-head" id="all-products-section">
            <h3>
              {categoriaSelecionada === 'Todos'
                ? 'Todos os produtos'
                : `Produtos da categoria ${categoriaSelecionada}`}
            </h3>
          </section>
          <section className="catalog-grid">
            {produtosExibidos.map((produto) => (
              <ProductCard key={`catalogo-${produto.id}`} product={produto} aoSelecionar={abrirProduto} />
            ))}
          </section>
        </>
      ) : null}

      {!carregando && !erro && produtos.length === 0 ? (
        <p className="status-text">Nenhum produto encontrado.</p>
      ) : null}

      <section className="duvidas-frequentes" id="duvidas-section">
        <h3>Duvidas Frequentes</h3>
        <div className="duvidas-frequentes__lista">
          {DUVIDAS_FREQUENTES.map((duvida, indice) => {
            const aberta = indiceDuvidaAberta === indice;
            return (
              <article key={duvida.pergunta} className={`duvida-item ${aberta ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="duvida-item__pergunta"
                  onClick={() => setIndiceDuvidaAberta(aberta ? null : indice)}
                  aria-expanded={aberta}
                >
                  <span>{duvida.pergunta}</span>
                  <strong>{aberta ? '−' : '+'}</strong>
                </button>
                {aberta ? <p className="duvida-item__resposta">{duvida.resposta}</p> : null}
              </article>
            );
          })}
        </div>
      </section>
    </StoreTemplate>
  );
};

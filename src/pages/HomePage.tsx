import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { CategoryTabs } from '../components/molecules/CategoryTabs';
import { ProductCard } from '../components/organisms/ProductCard';
import { StoreTemplate } from '../components/templates/StoreTemplate';
import { PhishingBanner } from '../components/organisms/PhishingBanner';
import { useAuthSession } from '../hooks/useAuthSession';
import { useProducts } from '../hooks/useProducts';
import {
  DUVIDAS_FREQUENTES,
  LINKS_ECOMMERCE,
  PROMOCOES_DESTAQUE,
  PRODUTOS_EXTRAS,
  formatarProdutoCatalogo
} from '../data/catalog';
import type { CategoriaExibida } from '../types/catalog';

type AlvoNavegacao = 'home' | 'ofertas' | 'categorias' | 'contato' | 'login';

export const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { usuarioLogado } = useAuthSession();
  const { products, loading, error } = useProducts();
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<CategoriaExibida>('Todos');
  const [navegacaoAtiva, setNavegacaoAtiva] = useState<AlvoNavegacao>('home');
  const [indiceDuvidaAberta, setIndiceDuvidaAberta] = useState<number | null>(0);

  const rolarParaSecao = (idSecao: string) => {
    const elemento = document.getElementById(idSecao);
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    if (location.hash) {
      const alvo = location.hash.replace('#', '');
      requestAnimationFrame(() => {
        rolarParaSecao(alvo);
      });
    }
  }, [location.hash]);

  const aoBuscar = (termoBusca: string) => {
    const query = termoBusca.trim();
    const sufixo = query ? `?q=${encodeURIComponent(query)}` : '';
    navigate(`/search${sufixo}`);
  };

  const abrirProduto = (idProduto: number) => {
    navigate(`/product/${idProduto}`);
  };

  const aoNavegar = (destino: AlvoNavegacao) => {
    setNavegacaoAtiva(destino);
    if (destino === 'home') {
      rolarParaSecao('home-section');
    }
    if (destino === 'ofertas') {
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

  const selecionarCategoria = (categoria: CategoriaExibida) => {
    setCategoriaSelecionada(categoria);
    setNavegacaoAtiva('categorias');
    requestAnimationFrame(() => {
      rolarParaSecao('offers-section');
    });
  };

  const produtosCatalogo = useMemo(
    () => [...products, ...PRODUTOS_EXTRAS].map(formatarProdutoCatalogo),
    [products]
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

  const promoPayload = searchParams.get('promo') ?? '';

  return (
    <StoreTemplate
      consulta=""
      aoBuscar={aoBuscar}
      navegacaoAtiva={navegacaoAtiva}
      aoNavegar={aoNavegar}
      usuarioLogado={usuarioLogado}
    >
      <PhishingBanner payload={promoPayload} />

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

      <div id="categories-section">
        <CategoryTabs
          categoriaSelecionada={categoriaSelecionada}
          aoSelecionarCategoria={(categoria) => selecionarCategoria(categoria as CategoriaExibida)}
        />
      </div>

      {loading ? <p className="status-text">Carregando produtos...</p> : null}
      {error ? <p className="status-text status-text--error">{error}</p> : null}

      {!loading && !error ? (
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

      {!loading && !error && products.length === 0 ? (
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

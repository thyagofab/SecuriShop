import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StoreTemplate } from '../components/templates/StoreTemplate';
import { ProductCard } from '../components/organisms/ProductCard';
import { VulnerableHtml } from '../components/atoms/VulnerableHtml';
import { useAuthSession } from '../hooks/useAuthSession';
import { useProducts } from '../hooks/useProducts';
import { useSecurityMode } from '../context/SecurityModeContext';
import { formatarProdutoCatalogo, PRODUTOS_EXTRAS } from '../data/catalog';
import type { CatalogProduct } from '../types/catalog';

const filtrarProdutos = (produtos: CatalogProduct[], consulta: string) => {
  if (!consulta.trim()) {
    return [];
  }

  const termo = consulta.toLowerCase();
  return produtos.filter(
    (produto) =>
      produto.name.toLowerCase().includes(termo) ||
      produto.description.toLowerCase().includes(termo)
  );
};

export const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const consulta = searchParams.get('q') ?? '';
  const { usuarioLogado } = useAuthSession();
  const { products, loading, error } = useProducts();
  const { isSecureMode } = useSecurityMode();
  const indicioPayload = /<|onerror|script/i.test(consulta);

  const produtosCatalogo = useMemo(
    () => [...products, ...PRODUTOS_EXTRAS].map(formatarProdutoCatalogo),
    [products]
  );

  const resultados = useMemo(
    () => filtrarProdutos(produtosCatalogo, consulta),
    [consulta, produtosCatalogo]
  );

  const aoBuscar = (termoBusca: string) => {
    const query = termoBusca.trim();
    const sufixo = query ? `?q=${encodeURIComponent(query)}` : '';
    navigate(`/search${sufixo}`);
  };

  const irParaHome = (hash?: string) => {
    const destino = hash ? `/#${hash}` : '/';
    navigate(destino);
  };

  const aoNavegar = (destino: 'home' | 'ofertas' | 'categorias' | 'contato' | 'login') => {
    if (destino === 'login') {
      navigate('/login');
      return;
    }

    if (destino === 'home') {
      irParaHome();
      return;
    }

    if (destino === 'ofertas') {
      irParaHome('offers-section');
      return;
    }

    if (destino === 'categorias') {
      irParaHome('categories-section');
      return;
    }

    if (destino === 'contato') {
      irParaHome('contact-section');
    }
  };

  return (
    <StoreTemplate
      consulta={consulta}
      aoBuscar={aoBuscar}
      navegacaoAtiva="home"
      aoNavegar={aoNavegar}
      usuarioLogado={usuarioLogado}
    >
      <section className="search-hero">
        <div className="search-hero__content">
          <p className="kicker">Resultados da busca</p>
          <h2>Explorando produtos com base na sua pesquisa</h2>
          <p>Use a barra de busca para simular XSS refletido no termo informado.</p>
        </div>
      </section>

      {consulta ? (
        <section className="status-text">
          <p>Busca atual (XSS Refletido):</p>
          <VulnerableHtml content={consulta} enabled={!isSecureMode} className="comment-content" />
        </section>
      ) : (
        <p className="status-text">Digite algo na busca para listar resultados.</p>
      )}

      {isSecureMode && consulta && indicioPayload ? (
        <div className="security-card security-card--safe">
          <strong>Defesa ativa: escape de saida no React</strong>
          <p>
            O termo foi tratado como texto, impedindo a interpretacao de HTML ou scripts no navegador.
          </p>
        </div>
      ) : null}

      {loading ? <p className="status-text">Carregando produtos...</p> : null}
      {error ? <p className="status-text status-text--error">{error}</p> : null}

      {!loading && !error && consulta && resultados.length === 0 ? (
        <p className="status-text">Nenhum produto encontrado para esse termo.</p>
      ) : null}

      {!loading && !error && resultados.length > 0 ? (
        <section className="catalog-grid">
          {resultados.map((produto) => (
            <ProductCard
              key={`search-${produto.id}`}
              product={produto}
              aoSelecionar={(idProduto) => navigate(`/product/${idProduto}`)}
            />
          ))}
        </section>
      ) : null}
    </StoreTemplate>
  );
};

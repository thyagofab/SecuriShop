import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StoreTemplate } from '../components/templates/StoreTemplate';
import { ProductDetails } from '../components/organisms/ProductDetails';
import { useAuthSession } from '../hooks/useAuthSession';
import { useProducts } from '../hooks/useProducts';
import { API_BASE } from '../config/env';
import { formatarProdutoCatalogo, PRODUTOS_EXTRAS } from '../data/catalog';
import { useSecurityMode } from '../context/SecurityModeContext';

export const ProductPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const idProduto = Number(params.id ?? 0);
  const { usuarioLogado, tokenSessao, logout } = useAuthSession();
  const { products, loading, error, reload } = useProducts();
  const [erroComentario, setErroComentario] = useState('');
  const { isSecureMode } = useSecurityMode();

  const produtosCatalogo = useMemo(
    () => [...products, ...PRODUTOS_EXTRAS].map(formatarProdutoCatalogo),
    [products]
  );

  const produtoSelecionado = produtosCatalogo.find((item) => item.id === idProduto);
  const produtoDoBanco = products.find((item) => item.id === idProduto);
  const comentarioDesabilitado = Boolean(produtoSelecionado && !produtoDoBanco);

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

  const adicionarComentario = async (conteudo: string) => {
    if (!tokenSessao) {
      setErroComentario('Faca login para comentar.');
      throw new Error('Usuario nao autenticado.');
    }

    if (comentarioDesabilitado) {
      setErroComentario('Este produto e uma vitrine estatica e nao recebe comentarios.');
      throw new Error('Produto sem comentarios.');
    }

    setErroComentario('');

    const resposta = await fetch(`${API_BASE}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenSessao}`,
        'X-Secure-Mode': isSecureMode ? 'true' : 'false'
      },
      credentials: 'include',
      body: JSON.stringify({ productId: idProduto, content: conteudo })
    });

    if (!resposta.ok) {
      const payload = (await resposta.json().catch(() => null)) as { error?: string } | null;
      setErroComentario(payload?.error ?? 'Erro ao salvar comentario.');
      throw new Error('Erro ao salvar comentario.');
    }

    setErroComentario('');
    await reload();
  };

  return (
    <StoreTemplate
      consulta=""
      aoBuscar={aoBuscar}
      navegacaoAtiva="ofertas"
      aoNavegar={aoNavegar}
      usuarioLogado={usuarioLogado}
    >
      {loading ? <p className="status-text">Carregando produto...</p> : null}
      {error ? <p className="status-text status-text--error">{error}</p> : null}

      {!loading && !error && !produtoSelecionado ? (
        <section className="status-text">
          <p>Produto nao encontrado. Volte para a vitrine principal.</p>
          <button type="button" className="link-button" onClick={() => navigate('/')}>
            Ir para a vitrine
          </button>
        </section>
      ) : null}

      {!loading && !error && produtoSelecionado ? (
        <ProductDetails
          produto={produtoSelecionado}
          aoVoltar={() => navigate('/')}
          aoAdicionarComentario={adicionarComentario}
          usuarioLogado={usuarioLogado}
          erroComentario={erroComentario}
          aoLogout={logout}
          aoIrParaLogin={() => navigate('/login')}
          aoIrParaCheckout={() =>
            navigate(`/checkout?total=${encodeURIComponent(produtoSelecionado.price)}`)
          }
          comentarioDesabilitado={comentarioDesabilitado}
          mensagemComentario={
            comentarioDesabilitado
              ? 'Produto extra usado para vitrine. Comentarios desativados.'
              : ''
          }
        />
      ) : null}
    </StoreTemplate>
  );
};

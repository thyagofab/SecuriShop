import { useState } from 'react';
import type { Product, Usuario } from '../../types/domain';
import { Button } from '../atoms/Button';
import { VulnerableHtml } from '../atoms/VulnerableHtml';
import { CommentForm } from '../molecules/CommentForm';
import { useSecurityMode } from '../../context/SecurityModeContext';

interface ProductDetailsProps {
  produto: Product & {
    price: string;
    oldPrice?: string;
    savings?: string;
    imageUrl: string;
    buyLink: string;
  };
  aoVoltar: () => void;
  aoAdicionarComentario: (conteudo: string) => Promise<void>;
  usuarioLogado: Usuario | null;
  erroComentario: string;
  aoLogout: () => void;
  aoIrParaLogin: () => void;
  aoIrParaCheckout: () => void;
  comentarioDesabilitado?: boolean;
  mensagemComentario?: string;
}

export const ProductDetails = ({
  produto,
  aoVoltar,
  aoAdicionarComentario,
  usuarioLogado,
  erroComentario,
  aoLogout,
  aoIrParaLogin,
  aoIrParaCheckout,
  comentarioDesabilitado = false,
  mensagemComentario = ''
}: ProductDetailsProps) => {
  const [avaliacao, setAvaliacao] = useState(4);
  const { isSecureMode } = useSecurityMode();
  const indicioComentarios = produto.comments.some((comentario) => /<|onerror|script/i.test(comentario.content));
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.currentTarget;
    if (target.dataset.fallbackApplied === 'true') {
      return;
    }

    target.dataset.fallbackApplied = 'true';
    target.src = '/image-224acc37069842568a859bd4cdd15ab8.webp';
  };

  return (
    <section className="product-details">
      <button type="button" className="back-link" onClick={aoVoltar}>
        <span>Voltar para vitrine de ofertas</span>
      </button>

      <div className="product-details__layout">
        <div className="product-details__media">
          <img src={produto.imageUrl} alt={produto.name} loading="lazy" onError={handleImageError} />
        </div>

        <div className="product-details__content">
          <p className="kicker">Detalhes do produto</p>
          <h2>{produto.name}</h2>
          <p>{produto.description}</p>
          <p className="deal-card__price detail-price">
            {produto.price} {produto.oldPrice ? <span>{produto.oldPrice}</span> : null}
          </p>
          {produto.savings ? <p className="deal-card__save">Economia estimada: {produto.savings}</p> : null}

          <div className="rating-box">
            <strong>Avaliar produto</strong>
            <div className="rating-stars" role="radiogroup" aria-label="Avaliacao">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${avaliacao >= star ? 'is-on' : ''}`}
                  onClick={() => setAvaliacao(star)}
                >
                  ★
                </button>
              ))}
            </div>
            <small>Sua nota atual: {avaliacao}/5</small>
          </div>

          <div className="detail-actions">
            <a href={produto.buyLink} target="_blank" rel="noreferrer">
              <Button type="button" variant="primary">Ir para compra</Button>
            </a>
            <Button type="button" variant="ghost" onClick={aoIrParaCheckout}>
              Ir para checkout
            </Button>
            <Button type="button" variant="ghost" onClick={aoVoltar}>
              Continuar navegando
            </Button>
          </div>
        </div>
      </div>

      <section className="comments-section detail-comments">
        <h3>Comentarios e avaliacoes</h3>
        {usuarioLogado ? (
          <div className="usuario-logado-box">
            <span>Logado como <strong>{usuarioLogado.username}</strong></span>
            <Button type="button" variant="ghost" size="sm" onClick={aoLogout}>
              Sair
            </Button>
          </div>
        ) : (
          <div className="auth-box">
            <p className="auth-box__title">Entre para comentar</p>
            <div className="auth-actions">
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  aoIrParaLogin();
                }}
              >
                Ir para pagina de login
              </Button>
            </div>
          </div>
        )}

        <CommentForm
          aoEnviar={(conteudo) => aoAdicionarComentario(conteudo)}
          desabilitado={!usuarioLogado || comentarioDesabilitado}
          mensagemBloqueio={mensagemComentario}
        />
        {isSecureMode && indicioComentarios ? (
          <div className="security-card security-card--safe">
            <strong>Defesa ativa: comentario tratado como texto</strong>
            <p>
              O conteudo passou por sanitizacao no backend e foi renderizado como texto no frontend.
            </p>
          </div>
        ) : null}
        {erroComentario ? <p className="auth-error">{erroComentario}</p> : null}
        {produto.comments.length === 0 ? (
          <p className="empty-state">Nenhum comentario ainda.</p>
        ) : (
          produto.comments.map((comentario) => (
            <div key={comentario.id} className="comment-bubble">
              <p className="comment-meta">Comentado por: <strong>{comentario.user.username}</strong></p>
              <VulnerableHtml
                content={comentario.content}
                enabled={!isSecureMode}
                className="comment-content"
              />
            </div>
          ))
        )}
      </section>
    </section>
  );
};

import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { StoreTemplate } from '../components/templates/StoreTemplate';
import { SecurityHint } from '../components/atoms/SecurityHint';
import { VulnerableHtml } from '../components/atoms/VulnerableHtml';
import { useAuthSession } from '../hooks/useAuthSession';
import { useSecurityMode } from '../context/SecurityModeContext';

const TOTAL_PADRAO = 'R$ 3.499,00';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { usuarioLogado } = useAuthSession();
  const { isSecureMode } = useSecurityMode();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');

  const enderecoUrl = searchParams.get('endereco') ?? '';
  const totalUrl = searchParams.get('total') ?? '';

  const totalExibido = useMemo(() => {
    const hashPayload = decodeURIComponent(location.hash.replace('#', ''));
    if (hashPayload) {
      return hashPayload;
    }

    if (totalUrl) {
      return totalUrl;
    }

    return TOTAL_PADRAO;
  }, [location.hash, totalUrl]);

  const resumoEndereco = useMemo(() => {
    if (enderecoUrl) {
      return enderecoUrl;
    }

    if (endereco) {
      return endereco;
    }

    return 'Endereco nao informado.';
  }, [endereco, enderecoUrl]);

  const indicioPayload = /<|onerror|script/i.test(`${totalExibido} ${resumoEndereco}`);

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
      consulta=""
      aoBuscar={aoBuscar}
      navegacaoAtiva="ofertas"
      aoNavegar={aoNavegar}
      usuarioLogado={usuarioLogado}
    >
      <section className="checkout-hero">
        <div className="checkout-hero__content">
          <p className="kicker">Checkout</p>
          <h2>Finalize sua compra com seguranca</h2>
          <p>
            Este fluxo demonstra como um DOM-based XSS poderia alterar valores do carrinho ou endereco
            apenas manipulando a URL.
          </p>
        </div>
      </section>

      <section className="checkout-grid">
        <div className="checkout-form">
          <h3>Dados do comprador</h3>
          <label>
            Nome completo
            <input value={nome} onChange={(event) => setNome(event.target.value)} />
          </label>
          <label>
            E-mail
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            Endereco de entrega
            <input value={endereco} onChange={(event) => setEndereco(event.target.value)} />
          </label>
          <button type="button" className="btn btn--primary">
            Finalizar compra
          </button>
          <p className="checkout-note">Nao existe processamento real. Fluxo didatico.</p>
        </div>

        <aside className="checkout-summary">
          <div className="checkout-summary__header">
            <h3>Resumo do pedido</h3>
            <SecurityHint
              titulo="Campo vulneravel ao DOM-based XSS"
              dica={
                isSecureMode
                  ? 'Modo seguro ativo. O total e exibido como texto simples.'
                  : 'O total e lido diretamente da URL e inserido no DOM sem sanitizacao.'
              }
              payload="<script>alert('total')</script>"
            />
          </div>
          <div className="checkout-summary__row">
            <span>Total exibido</span>
            <VulnerableHtml content={totalExibido} enabled={!isSecureMode} className="checkout-total" />
          </div>
          <div className="checkout-summary__row">
            <span>Endereco informado</span>
            <VulnerableHtml content={resumoEndereco} enabled={!isSecureMode} className="checkout-address" />
          </div>
          <div className="checkout-summary__hint">
            <p>Teste com: <code>#&lt;script&gt;alert('XSS')&lt;/script&gt;</code></p>
            <p>Ou use: <code>?total=R$99,90&amp;endereco=&lt;img src=x onerror=alert(1)&gt;</code></p>
          </div>
          {isSecureMode && indicioPayload ? (
            <div className="security-card security-card--safe">
              <strong>Defesa ativa: texto seguro no DOM</strong>
              <p>
                Os valores vindos da URL foram exibidos como texto, evitando execucao de HTML.
              </p>
            </div>
          ) : null}
        </aside>
      </section>
    </StoreTemplate>
  );
};

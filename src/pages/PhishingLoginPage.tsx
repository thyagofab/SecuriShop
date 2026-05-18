import { useNavigate } from 'react-router-dom';
import { StoreTemplate } from '../components/templates/StoreTemplate';
import { useAuthSession } from '../hooks/useAuthSession';

export const PhishingLoginPage = () => {
  const navigate = useNavigate();
  const { usuarioLogado } = useAuthSession();

  const aoBuscar = (termoBusca: string) => {
    const query = termoBusca.trim();
    const sufixo = query ? `?q=${encodeURIComponent(query)}` : '';
    navigate(`/search${sufixo}`);
  };

  const aoNavegar = (destino: 'home' | 'ofertas' | 'categorias' | 'contato' | 'login') => {
    if (destino === 'login') {
      return;
    }
    navigate('/');
  };

  return (
    <StoreTemplate
      consulta=""
      aoBuscar={aoBuscar}
      navegacaoAtiva="login"
      aoNavegar={aoNavegar}
      usuarioLogado={usuarioLogado}
    >
      <section className="phishing-page">
        <div className="phishing-card">
          <p className="kicker">Sessao expirada</p>
          <h2>Reautenticar para desbloquear 50% OFF</h2>
          <p>Esta e uma pagina falsa para demonstrar engenharia social via XSS.</p>
          <div className="phishing-form">
            <label>
              E-mail
              <input type="email" placeholder="seuemail@exemplo.com" />
            </label>
            <label>
              Senha
              <input type="password" placeholder="********" />
            </label>
            <button type="button" className="btn btn--danger">
              Entrar e resgatar cupom
            </button>
          </div>
          <button type="button" className="link-button" onClick={() => navigate('/')}>
            Voltar para a loja
          </button>
        </div>
      </section>
    </StoreTemplate>
  );
};

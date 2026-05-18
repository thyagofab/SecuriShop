import type { Usuario } from '../../types/domain';
import { SearchBar } from '../molecules/SearchBar';
import { useSecurityMode } from '../../context/SecurityModeContext';

type AlvoNavegacao = 'home' | 'ofertas' | 'categorias' | 'contato' | 'login';

interface HeaderProps {
  consulta: string;
  aoBuscar: (consulta: string) => void;
  navegacaoAtiva: AlvoNavegacao;
  aoNavegar: (destino: AlvoNavegacao) => void;
  usuarioLogado: Usuario | null;
}

export const Header = ({ consulta, aoBuscar, navegacaoAtiva, aoNavegar, usuarioLogado }: HeaderProps) => {
  const { isSecureMode, toggleSecureMode } = useSecurityMode();

  return (
    <header className="site-header">
      <div className="site-header__brand">
        <h1>Nexora Tech</h1>
        <div className="security-mode">
          <span className={`security-mode__badge ${isSecureMode ? 'is-secure' : 'is-vulnerable'}`}>
            {isSecureMode ? 'Modo Seguro' : 'Modo Vulneravel'}
          </span>
          <button type="button" className="security-mode__toggle" onClick={toggleSecureMode}>
            {isSecureMode ? 'Ativar modo vulneravel' : 'Ativar modo seguro'}
          </button>
        </div>
      </div>

      <div className="site-header__actions">
        <nav className="top-nav" aria-label="Menu principal">
          <button type="button" className={navegacaoAtiva === 'home' ? 'is-active' : ''} onClick={() => aoNavegar('home')}>Inicio</button>
          <button type="button" className={navegacaoAtiva === 'ofertas' ? 'is-active' : ''} onClick={() => aoNavegar('ofertas')}>Ofertas</button>
          <button type="button" className={navegacaoAtiva === 'categorias' ? 'is-active' : ''} onClick={() => aoNavegar('categorias')}>Categorias</button>
          <button type="button" className={navegacaoAtiva === 'contato' ? 'is-active' : ''} onClick={() => aoNavegar('contato')}>Contato</button>
          <button type="button" className={navegacaoAtiva === 'login' ? 'is-active' : ''} onClick={() => aoNavegar('login')}>
            {usuarioLogado ? `Conta: ${usuarioLogado.username}` : 'Login'}
          </button>
        </nav>
        <SearchBar consultaInicial={consulta} aoBuscar={aoBuscar} />
      </div>
    </header>
  );
};
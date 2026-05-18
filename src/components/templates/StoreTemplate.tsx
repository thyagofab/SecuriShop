import { useEffect, useState, type ReactNode } from 'react';
import type { Usuario } from '../../types/domain';
import { Footer } from '../organisms/Footer';
import { Header } from '../organisms/Header';
import { useSecurityMode } from '../../context/SecurityModeContext';

type AlvoNavegacao = 'home' | 'ofertas' | 'categorias' | 'contato' | 'login';

interface StoreTemplateProps {
  children: ReactNode;
  consulta: string;
  aoBuscar: (consulta: string) => void;
  navegacaoAtiva: AlvoNavegacao;
  aoNavegar: (destino: AlvoNavegacao) => void;
  usuarioLogado: Usuario | null;
}

export const StoreTemplate = ({ children, consulta, aoBuscar, navegacaoAtiva, aoNavegar, usuarioLogado }: StoreTemplateProps) => {
  const { isSecureMode } = useSecurityMode();
  const [cspAviso, setCspAviso] = useState<string | null>(null);

  useEffect(() => {
    if (!isSecureMode) {
      setCspAviso(null);
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const handleCspViolation = (event: SecurityPolicyViolationEvent) => {
      const detalhe = event.violatedDirective || 'diretiva desconhecida';
      setCspAviso(`CSP bloqueou uma tentativa de execucao. Diretiva: ${detalhe}`);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        setCspAviso(null);
      }, 5000);
    };

    document.addEventListener('securitypolicyviolation', handleCspViolation);
    return () => {
      document.removeEventListener('securitypolicyviolation', handleCspViolation);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isSecureMode]);

  return (
    <div className="store-shell" id="home-section">
      <div className="glow glow--one" aria-hidden="true" />
      <div className="glow glow--two" aria-hidden="true" />
      {cspAviso ? (
        <div className="security-toast" role="status">
          {cspAviso}
        </div>
      ) : null}
      <Header
        consulta={consulta}
        aoBuscar={aoBuscar}
        navegacaoAtiva={navegacaoAtiva}
        aoNavegar={aoNavegar}
        usuarioLogado={usuarioLogado}
      />
      <main>{children}</main>
      <div id="contact-section">
        <Footer />
      </div>
    </div>
  );
};

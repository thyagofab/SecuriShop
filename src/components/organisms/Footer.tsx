export const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <section>
          <h3>Nexora Tech</h3>
          <h4>Fale Conosco</h4>
          <p>
            WhatsApp:{' '}
            <a href="https://wa.me/5511988880000" target="_blank" rel="noreferrer">
              (11) 98888-0000
            </a>
          </p>
          <p>
            Telefone: <a href="tel:+551140001234">(11) 4000-1234</a>
          </p>
          <p>
            Email: <a href="mailto:contato@nexoratech.com">contato@nexoratech.com</a>
          </p>
        </section>

        <section>
          <h4>Categorias em Destaque</h4>
          <ul>
            <li><a href="/#categories-section">Smartphones</a></li>
            <li><a href="/#categories-section">Notebooks</a></li>
            <li><a href="/#categories-section">Monitores</a></li>
            <li><a href="/#categories-section">Cadernos</a></li>
            <li><a href="/#categories-section">Perifericos</a></li>
            <li><a href="/#categories-section">Acessorios</a></li>
          </ul>
        </section>

        <section>
          <h4>Informacoes</h4>
          <ul>
            <li><a href="/#quem-somos-section">Quem Somos</a></li>
            <li><a href="/#home-section">Termos de Uso</a></li>
            <li><a href="/#home-section">Politica de Privacidade</a></li>
            <li><a href="/#duvidas-section">Duvidas Frequentes</a></li>
          </ul>
          <p>Projeto academico para demonstracao de seguranca web com foco em XSS.</p>
        </section>
      </div>

      <div className="footer-copy">© 2026 Nexora Tech. Todos os direitos reservados.</div>
    </footer>
  );
};
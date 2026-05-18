import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreTemplate } from '../components/templates/StoreTemplate';
import { LoginPage } from './LoginPage';
import { RegisterPage, type RegistroDados } from './RegisterPage';
import type { Usuario } from '../types/domain';
import { API_BASE } from '../config/env';
import {
  CHAVE_COOKIE_SESSAO,
  CHAVE_TOKEN_LOCALSTORAGE,
  CHAVE_USUARIO_LOCALSTORAGE
} from '../config/auth';

type AlvoNavegacao = 'home' | 'ofertas' | 'categorias' | 'contato' | 'login';
type PaginaAtiva = 'login' | 'register';

export const ContaPage = () => {
  const navigate = useNavigate();
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [autenticando, setAutenticando] = useState(false);
  const [erroAutenticacao, setErroAutenticacao] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [paginaAtiva, setPaginaAtiva] = useState<PaginaAtiva>('login');
  const [resetando, setResetando] = useState(false);
  const [erroReset, setErroReset] = useState('');
  const [sucessoReset, setSucessoReset] = useState('');

  useEffect(() => {
    const tokenArmazenado = localStorage.getItem(CHAVE_TOKEN_LOCALSTORAGE) ?? '';

    if (tokenArmazenado) {
      const carregarSessao = async () => {
        try {
          const resposta = await fetch(`${API_BASE}/auth/me`, {
            headers: {
              Authorization: `Bearer ${tokenArmazenado}`
            }
          });

          if (!resposta.ok) {
            if (resposta.status === 401 || resposta.status === 403) {
              localStorage.removeItem(CHAVE_TOKEN_LOCALSTORAGE);
              localStorage.removeItem(CHAVE_USUARIO_LOCALSTORAGE);
            }
            return;
          }

          const dados = (await resposta.json()) as { user: Usuario };
          // Mantem cookie inseguro sincronizado para demonstracao de XSS.
          document.cookie = `${CHAVE_COOKIE_SESSAO}=${encodeURIComponent(tokenArmazenado)}; path=/; SameSite=Lax`;
          setUsuarioLogado(dados.user);
          localStorage.setItem(CHAVE_USUARIO_LOCALSTORAGE, JSON.stringify(dados.user));
        } catch {
          // Mantem token local em caso de falha de rede.
        }
      };

      void carregarSessao();
    }
  }, []);

  const aoBuscar = (termoBusca: string) => {
    const query = termoBusca.trim();
    const sufixo = query ? `?q=${encodeURIComponent(query)}` : '';
    navigate(`/${sufixo}`);
  };

  const aoNavegar = (destino: AlvoNavegacao) => {
    if (destino === 'login') {
      return;
    }

    navigate('/');
  };

  const salvarSessao = (token: string, user: Usuario) => {
    localStorage.setItem(CHAVE_TOKEN_LOCALSTORAGE, token);
    localStorage.setItem(CHAVE_USUARIO_LOCALSTORAGE, JSON.stringify(user));
    // Intencionalmente inseguro para demonstracao de XSS no TCC.
    document.cookie = `${CHAVE_COOKIE_SESSAO}=${encodeURIComponent(token)}; path=/; SameSite=Lax`;
    setUsuarioLogado(user);
    setErroAutenticacao('');
    setMensagemSucesso('');
  };

  const validarEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const autenticar = async (rota: 'login' | 'register', email: string, senha: string) => {
    setAutenticando(true);
    setErroAutenticacao('');
    setMensagemSucesso('');

    if (!validarEmail(email)) {
      setErroAutenticacao('Informe um e-mail valido para continuar.');
      setAutenticando(false);
      return;
    }

    try {
      const resposta = await fetch(`${API_BASE}/auth/${rota}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password: senha, email })
      });

      const dados = (await resposta.json().catch(() => null)) as { error?: string; token?: string; user?: Usuario } | null;

      if (!resposta.ok || !dados?.token || !dados.user) {
        setErroAutenticacao(dados?.error ?? 'Falha ao autenticar usuario.');
        return;
      }

      salvarSessao(dados.token, dados.user);
    } catch {
      setErroAutenticacao('Nao foi possivel autenticar. Confira se a API esta rodando.');
    } finally {
      setAutenticando(false);
    }
  };

  const fazerLogin = async (email: string, senha: string) => {
    await autenticar('login', email, senha);
  };

  const fazerRegistro = async (username: string, senha: string) => {
    await autenticar('register', username, senha);
  };

  const fazerRegistroCompleto = async (dados: RegistroDados) => {
    setAutenticando(true);
    setErroAutenticacao('');
    setMensagemSucesso('');

    try {
      const resposta = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: dados.email,
          password: dados.senha,
          nome: dados.nome,
          email: dados.email,
          telefone: dados.telefone,
          endereco: dados.endereco
        })
      });

      const respostaData = (await resposta.json().catch(() => null)) as { error?: string } | null;

      if (!resposta.ok) {
        setErroAutenticacao(respostaData?.error ?? 'Falha ao criar a conta.');
        return;
      }

      setPaginaAtiva('login');
      setMensagemSucesso('Conta criada com sucesso! Agora faca login com seu e-mail.');
    } catch {
      setErroAutenticacao('Nao foi possivel criar a conta. Confira se a API esta rodando.');
    } finally {
      setAutenticando(false);
    }
  };

  const fazerLogout = () => {
    localStorage.removeItem(CHAVE_TOKEN_LOCALSTORAGE);
    localStorage.removeItem(CHAVE_USUARIO_LOCALSTORAGE);
    document.cookie = `${CHAVE_COOKIE_SESSAO}=; path=/; Max-Age=0; SameSite=Lax`;
    setUsuarioLogado(null);
  };

  const resetarBanco = async () => {
    setResetando(true);
    setErroReset('');
    setSucessoReset('');

    try {
      const resposta = await fetch(`${API_BASE}/admin/reset`, {
        method: 'POST'
      });

      if (!resposta.ok) {
        const payload = (await resposta.json().catch(() => null)) as { error?: string } | null;
        setErroReset(payload?.error ?? 'Erro ao resetar o banco.');
        return;
      }

      setSucessoReset('Comentarios limpos com sucesso. Produtos foram mantidos.');
    } catch {
      setErroReset('Nao foi possivel resetar o banco. Confira se a API esta rodando.');
    } finally {
      setResetando(false);
    }
  };

  return (
    <StoreTemplate
      consulta=""
      aoBuscar={aoBuscar}
      navegacaoAtiva="login"
      aoNavegar={aoNavegar}
      usuarioLogado={usuarioLogado}
    >
      <>
        {paginaAtiva === 'login' ? (
          <LoginPage
            usuarioLogado={usuarioLogado}
            autenticando={autenticando}
            erroAutenticacao={erroAutenticacao}
            mensagemSucesso={mensagemSucesso}
            aoLogin={fazerLogin}
            aoRegistrar={fazerRegistro}
            aoLogout={fazerLogout}
            aoIrParaCadastro={() => {
              setMensagemSucesso('');
              setPaginaAtiva('register');
            }}
          />
        ) : (
          <RegisterPage
            autenticando={autenticando}
            erroAutenticacao={erroAutenticacao}
            aoRegistrar={fazerRegistroCompleto}
            aoVoltarLogin={() => {
              setErroAutenticacao('');
              setPaginaAtiva('login');
            }}
          />
        )}

        <section className="demo-panel" aria-label="Painel de demonstracao">
          <div className="demo-panel__header">
            <h3>Painel de demonstracao</h3>
            <p>Limpeza rapida dos comentarios para repetir os testes de ataque.</p>
          </div>
          <div className="demo-panel__actions">
            <button
              type="button"
              className="btn btn--danger"
              onClick={() => {
                void resetarBanco();
              }}
              disabled={resetando}
            >
              {resetando ? 'Limpando comentarios...' : 'Limpar comentarios de ataque'}
            </button>
          </div>
          {erroReset ? <p className="auth-error">{erroReset}</p> : null}
          {sucessoReset ? <p className="auth-success">{sucessoReset}</p> : null}
        </section>
      </>
    </StoreTemplate>
  );
};

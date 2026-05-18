import { useEffect, useState } from 'react';
import { API_BASE } from '../config/env';
import {
  CHAVE_COOKIE_SESSAO,
  CHAVE_TOKEN_LOCALSTORAGE,
  CHAVE_USUARIO_LOCALSTORAGE
} from '../config/auth';
import type { Usuario } from '../types/domain';
import { useSecurityMode } from '../context/SecurityModeContext';

export const useAuthSession = () => {
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(() => {
    const salvo = localStorage.getItem(CHAVE_USUARIO_LOCALSTORAGE);
    if (!salvo) {
      return null;
    }

    try {
      return JSON.parse(salvo) as Usuario;
    } catch {
      return null;
    }
  });
  const [tokenSessao, setTokenSessao] = useState(
    () => localStorage.getItem(CHAVE_TOKEN_LOCALSTORAGE) ?? ''
  );
  const [carregandoSessao, setCarregandoSessao] = useState(() => Boolean(tokenSessao));
  const { isSecureMode } = useSecurityMode();

  useEffect(() => {
    if (!tokenSessao) {
      return;
    }

    const carregarSessao = async () => {
      try {
        const resposta = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${tokenSessao}`,
            'X-Secure-Mode': isSecureMode ? 'true' : 'false'
          },
          credentials: 'include'
        });

        if (!resposta.ok) {
          if (resposta.status === 401 || resposta.status === 403) {
            localStorage.removeItem(CHAVE_TOKEN_LOCALSTORAGE);
            localStorage.removeItem(CHAVE_USUARIO_LOCALSTORAGE);
            setTokenSessao('');
            setUsuarioLogado(null);
          }
          return;
        }

        const dados = (await resposta.json()) as { user: Usuario };
        if (!isSecureMode) {
          // Mantem cookie inseguro sincronizado para demonstracao de XSS.
          document.cookie = `${CHAVE_COOKIE_SESSAO}=${encodeURIComponent(tokenSessao)}; path=/; SameSite=Lax`;
        }
        setUsuarioLogado(dados.user);
        localStorage.setItem(CHAVE_USUARIO_LOCALSTORAGE, JSON.stringify(dados.user));
      } catch {
        // Em falhas de rede, mantem o token local para evitar logout indevido.
      } finally {
        setCarregandoSessao(false);
      }
    };

    void carregarSessao();
  }, [tokenSessao, isSecureMode]);

  const logout = () => {
    localStorage.removeItem(CHAVE_TOKEN_LOCALSTORAGE);
    localStorage.removeItem(CHAVE_USUARIO_LOCALSTORAGE);
    if (!isSecureMode) {
      document.cookie = `${CHAVE_COOKIE_SESSAO}=; path=/; Max-Age=0; SameSite=Lax`;
    }
    setTokenSessao('');
    setUsuarioLogado(null);
    setCarregandoSessao(false);
  };

  return { usuarioLogado, tokenSessao, carregandoSessao, logout };
};

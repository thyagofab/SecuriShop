import { useCallback, useEffect, useState } from 'react';
import { API_BASE } from '../config/env';
import type { Product } from '../types/domain';
import { useSecurityMode } from '../context/SecurityModeContext';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isSecureMode } = useSecurityMode();

  const carregarProdutos = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const resposta = await fetch(`${API_BASE}/products`, {
        headers: {
          'X-Secure-Mode': isSecureMode ? 'true' : 'false'
        },
        credentials: 'include'
      });
      if (!resposta.ok) {
        throw new Error('Nao foi possivel carregar os produtos.');
      }

      const dados = (await resposta.json()) as Product[];
      setProducts(dados);
    } catch {
      setError('Falha ao carregar produtos da API. Confira se o backend esta rodando na porta 3001.');
    } finally {
      setLoading(false);
    }
  }, [isSecureMode]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void carregarProdutos();
  }, [carregarProdutos]);

  return { products, loading, error, reload: carregarProdutos };
};

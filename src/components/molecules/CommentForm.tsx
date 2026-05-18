import { useState, type FormEvent } from 'react';
import { Button } from '../atoms/Button';
import { TextInput } from '../atoms/TextInput';
import { SecurityHint } from '../atoms/SecurityHint';
import { ENABLE_XSS_DEMO } from '../../config/env';

interface CommentFormProps {
  aoEnviar: (conteudo: string) => Promise<void>;
  desabilitado?: boolean;
  mensagemBloqueio?: string;
}

export const CommentForm = ({ aoEnviar, desabilitado = false, mensagemBloqueio }: CommentFormProps) => {
  const [conteudo, setConteudo] = useState('');
  const [salvando, setSalvando] = useState(false);
  const placeholder = desabilitado
    ? mensagemBloqueio || 'Faca login para comentar'
    : 'Deixe um comentario';

  const aoSubmeter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!conteudo.trim() || desabilitado) {
      return;
    }

    setSalvando(true);
    try {
      await aoEnviar(conteudo);
      setConteudo('');
    } catch {
      // Erro de envio exibido pelo componente pai.
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form className="comment-form" onSubmit={aoSubmeter}>
      <div className="comment-form__field">
        <TextInput
          name="comment"
          placeholder={placeholder}
          value={conteudo}
          onChange={(event) => setConteudo(event.target.value)}
          disabled={desabilitado || salvando}
        />
        <SecurityHint
          titulo="Campo vulneravel a XSS armazenado"
          dica={
            ENABLE_XSS_DEMO
              ? 'Comentarios sao renderizados sem sanitizacao. Scripts executam quando alguem abre o produto.'
              : 'Modo seguro ativo. Comentarios sao exibidos como texto.'
          }
          payload="<img src=x onerror=alert('xss') />"
        />
      </div>
      <Button type="submit" variant="danger" size="sm" disabled={salvando || desabilitado}>
        {salvando ? 'Salvando...' : 'Enviar'}
      </Button>
      {mensagemBloqueio ? <p className="comment-form__warning">{mensagemBloqueio}</p> : null}
    </form>
  );
};

import { useRef, type FormEvent } from 'react';
import { Button } from '../atoms/Button';
import { TextInput } from '../atoms/TextInput';
import { SecurityHint } from '../atoms/SecurityHint';
import { ENABLE_XSS_DEMO } from '../../config/env';

interface SearchBarProps {
  consultaInicial?: string;
  aoBuscar: (consulta: string) => void;
}

export const SearchBar = ({ consultaInicial = '', aoBuscar }: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const aoEnviar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const valor = (inputRef.current?.value ?? '').trim();
    aoBuscar(valor);
  };

  return (
    <form className="search-bar" onSubmit={aoEnviar}>
      <div className="search-bar__field">
        <TextInput
          id="product-search"
          name="q"
          ref={inputRef}
          key={consultaInicial}
          placeholder="Buscar notebook, mouse, monitor..."
          defaultValue={consultaInicial}
          aria-label="Buscar produtos"
        />
        <SecurityHint
          titulo="Campo vulneravel a XSS refletido"
          dica={
            ENABLE_XSS_DEMO
              ? 'A API reflete esse termo sem sanitizacao. Tente injetar HTML ou script.'
              : 'Modo seguro ativo. O termo e exibido como texto simples.'
          }
          payload="<script>alert(1)</script>"
        />
      </div>
      <Button type="submit" variant="primary">
        Buscar
      </Button>
    </form>
  );
};
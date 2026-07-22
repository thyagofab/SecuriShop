import { useRef, type FormEvent } from 'react';
import { Button } from '../atoms/Button';
import { TextInput } from '../atoms/TextInput';
import { SecurityHint } from '../atoms/SecurityHint';
import { useSecurityMode } from '../../context/SecurityModeContext';

interface SearchBarProps {
  consultaInicial?: string;
  aoBuscar: (consulta: string) => void;
}

export const SearchBar = ({ consultaInicial = '', aoBuscar }: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { isSecureMode } = useSecurityMode();

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
            isSecureMode
              ? 'Modo seguro ativo. O termo e exibido como texto simples.'
              : 'A API reflete esse termo sem sanitizacao. Tente injetar HTML ou script.'
          }
          payload="<script>alert(1)</script>"
          aoAplicarPayload={(payload) => {
            if (inputRef.current) {
              inputRef.current.value = payload;
              inputRef.current.focus();
            }
          }}
        />
      </div>
      <Button type="submit" variant="primary">
        Buscar
      </Button>
    </form>
  );
};
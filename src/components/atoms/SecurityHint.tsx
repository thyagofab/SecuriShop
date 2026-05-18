import { useState } from 'react';

interface SecurityHintProps {
  titulo: string;
  dica: string;
  payload?: string;
  owaspLabel?: string;
  owaspUrl?: string;
}

export const SecurityHint = ({
  titulo,
  dica,
  payload,
  owaspLabel = 'A03:2021 - Injection',
  owaspUrl = 'https://owasp.org/Top10/A03_2021-Injection/'
}: SecurityHintProps) => {
  const [aberto, setAberto] = useState(false);

  return (
    <div className={`security-hint ${aberto ? 'is-open' : ''}`}>
      <button
        type="button"
        className="security-hint__icon"
        onClick={() => setAberto((prev) => !prev)}
        aria-expanded={aberto}
        aria-label="Abrir dica de seguranca"
      >
        i
      </button>
      <div className="security-hint__tooltip" role="tooltip">
        <span>{owaspLabel}</span>
        <a href={owaspUrl} target="_blank" rel="noreferrer">
          Ver OWASP
        </a>
      </div>
      {aberto ? (
        <div className="security-hint__panel">
          <strong>{titulo}</strong>
          <p>{dica}</p>
          {payload ? (
            <div className="security-hint__payload">
              <span>Exemplo de payload:</span>
              <code>{payload}</code>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

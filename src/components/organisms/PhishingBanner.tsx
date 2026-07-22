import { VulnerableHtml } from '../atoms/VulnerableHtml';
import { useSecurityMode } from '../../context/SecurityModeContext';

interface PhishingBannerProps {
  payload: string;
}

export const PhishingBanner = ({ payload }: PhishingBannerProps) => {
  const { isSecureMode } = useSecurityMode();

  if (isSecureMode) {
    return null;
  }

  const conteudo =
    payload ||
    '<strong>Slot de banner vazio.</strong> Injete HTML usando ?promo= na URL para simular phishing.';

  return (
    <section className="phishing-banner" aria-label="Banner promocional injetado">
      <div className="phishing-banner__header">
        <p>Slot de campanha injetada</p>
        <span>Demo de engenharia social via XSS</span>
      </div>
      <VulnerableHtml content={conteudo} enabled={!isSecureMode} className="phishing-banner__content" />
    </section>
  );
};

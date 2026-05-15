import { useEffect, useRef } from 'react';

interface VulnerableHtmlProps {
  content: string;
  className?: string;
}

export const VulnerableHtml = ({ content, className }: VulnerableHtmlProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }


    container.innerHTML = content;

    const scripts = container.querySelectorAll('script');
    scripts.forEach((scriptOriginal) => {
      const novoScript = document.createElement('script');
      if (scriptOriginal.src) {
        novoScript.src = scriptOriginal.src;
      }
      novoScript.text = scriptOriginal.text;
      scriptOriginal.replaceWith(novoScript);
    });
  }, [content]);

  return <div ref={containerRef} className={className} />;
};
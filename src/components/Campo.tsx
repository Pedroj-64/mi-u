import type { ReactNode } from 'react';

interface Props {
  /** id del control que va dentro. */
  id: string;
  etiqueta: string;
  className?: string;
  children: ReactNode;
}

/** Etiqueta visible encima del control; los placeholders solo son ejemplos. */
export default function Campo({ id, etiqueta, className = '', children }: Props) {
  return (
    <div className={`grid min-w-0 gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-[13px] leading-[18px] font-medium">
        {etiqueta}
      </label>
      {children}
    </div>
  );
}

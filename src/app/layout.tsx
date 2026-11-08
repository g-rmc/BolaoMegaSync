import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'BolãoMegaSync • Conferidor de Mega-Sena & Mega da Virada',
  description:
    'Plataforma estática para importar apostas em CSV, consultar resultados da Mega-Sena e conferir quadras, quinas e senas do seu bolão.',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body className="font-sans">{children}</body>
    </html>
  );
}


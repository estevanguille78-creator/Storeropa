import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CurrencyProvider } from '@/components/CurrencyContext';
import { CartProvider } from '@/components/CartContext';
import { RoleProvider } from '@/components/RoleContext';
import CartDrawer from '@/components/CartDrawer';

export const metadata: Metadata = {
  title: 'Demo Store | Moda Exclusiva & Marca Personal',
  description: 'Tienda de ropa, calzado y marca personal con panel de administración totalmente personalizable.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#0f172a" />
        <link rel="icon" href="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=64&q=80" />
      </head>
      <body className="min-h-screen flex flex-col">
        <RoleProvider>
          <ThemeProvider>
            <CurrencyProvider>
              <CartProvider>
                {children}
                <CartDrawer />
              </CartProvider>
            </CurrencyProvider>
          </ThemeProvider>
        </RoleProvider>
      </body>
    </html>
  );
}


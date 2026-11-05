# 👗 Tienda de Ropa & Marca Personal (Demo Store)

E-commerce premium y moderno desarrollado con **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, y base de datos **PostgreSQL en Supabase**. Diseñado especialmente para la venta de ropa, calzado y marca personal, enfocado en personalización total y sin código a través de la **Sala de Control**.

---

## 🌟 Características Principales

### 1. 🎛️ Sala de Control (Panel de Administración)
* **Módulo de Apariencia (Site Builder):**
  * Nombre de la tienda (predeterminado: *Demo Store*, 100% editable).
  * Subida/edición de Logo Principal, Logo Alternativo para modo oscuro y **Favicon** (foto de pestaña del navegador).
  * **Color Pickers interactivos**: Color Primario, Color Secundario (Acento), Color de Fondo y Color de Texto, aplicados en tiempo real mediante variables CSS dinámicas.
  * **Elementos UI**: Selector de bordes de botones (*Pill*, *Redondeado*, *Cuadrado*) y selección tipográfica de Google Fonts (*Inter*, *Playfair Display*, *Outfit*, *Cinzel*, *Poppins*, *Montserrat*).
  * **Marca Personal**: Editor de biografía, historia de la marca ("Sobre Mí"), fotos y video de presentación.
* **Módulo de Catálogo & Estructura:**
  * **Generador Automático de Subpáginas Aisladas**: Al crear una categoría (ej. *Caballeros*, *Calzado*, *Damas*), el sistema le asigna una ruta única segura (`/categoria/[slug]`).
  * **Creador de Atributos Dinámicos**: Creación de grupos de tallas de ropa (XS, S, M, L, XL), tallas de calzado (38 a 45) y paleta de colores visuales con código Hexadecimal.
  * **Ficha de Producto**: Formulario con nombre, precio cliente, precio mayorista (revendedores), precio tachado, galería de imágenes, stock, badges y vinculación de atributos.
* **Módulo de Billetera (Pagos y Finanzas):**
  * **Gestor de Monedas**: Moneda base USD y monedas secundarias (EUR, VES / Bs.) con tasas de cambio editables en vivo.
  * **Métodos de Pago Manuales**: Datos bancarios e instrucciones personalizadas para Pago Móvil, Zelle, Transferencia Bancaria Nacional, Binance Pay (USDT) y Efectivo.
  * **Pasarelas Automáticas**: Campos preparados para API Keys de Stripe, PayPal y MercadoPago.
* **Módulo de Gestor de Pedidos (Embudo de Ventas):**
  * Clasificación en pestañas: *Nuevos*, *Confirmados (Listos para envío)*, *Rechazados* y *Todos*.
  * **Buscador Inteligente**: Filtro en tiempo real por nombre del cliente, correo electrónico o número de WhatsApp.
  * Botones de confirmación y enlace directo de WhatsApp con mensaje personalizado pre-cargado.
* **Módulo de Usuarios, Roles y Seguridad ("Caballo de Troya"):**
  * **4 Jerarquías**:
    1. `programador` (Super Admin Oculto): Acceso total a código, BD y función "Ver como..." para auditar la web desde la perspectiva de cualquier rol.
    2. `admin` (Administrador del Negocio): Control de tienda, pedidos, catálogo y billetera.
    3. `revendedor`: Usuario con precios mayoristas en el catálogo.
    4. `cliente`: Usuario final.
  * **Regla "Caballo de Troya"**: Cuando un Admin consulta los usuarios, la cuenta del Programador aparece camuflada como un Cliente común y corriente, evitando sospechas o intentos de manipulación de permisos críticos.
* **Módulo de Redes Sociales & Pie de Página:**
  * Gestor de enlaces a redes sociales (Instagram, TikTok, WhatsApp, Facebook, X, etc.) con sus íconos.
  * Editor del Footer: Teléfono, WhatsApp, Correo, Dirección de entrega/showroom, copyright y políticas legales en ventana modal (Términos, Privacidad y Envíos).

---

### 2. 🛍️ Tienda Pública (Frontend Cliente)
* **Diseño Híbrido**: Hero section elegante de Marca Personal + vitrina de prendas y calzado destacados.
* **Subpáginas de Categoría (`/categoria/[slug]`)**: Filtros interactivos por tallas, colores y etiquetas.
* **Página de Detalle (`/producto/[slug]`)**: Galería de fotos, selectores de talla/color interactivos, precio según la moneda seleccionada y botón de consulta por WhatsApp.
* **Bolsa de Compras Flotante (Slide-over)**: Edición de cantidades, subtotales en vivo y acceso al checkout.
* **Checkout Inteligente (`/checkout`)**: Paso a paso con cálculo de moneda seleccionada, datos para transferir y reporte de comprobante.
* **Comprobante de Pedido (`/pedido/[id]`)**: Resumen de orden y botón directo para enviar el comprobante por WhatsApp al negocio.

---

## 🛠️ Tecnologías Utilizadas

* **Framework:** Next.js 14 (App Router)
* **Lenguaje:** TypeScript
* **Estilos:** Tailwind CSS con CSS Variables dinámicas
* **Base de Datos:** PostgreSQL en Supabase
* **Iconografía:** Lucide React
* **PWA:** Manifest y Service Worker listos para notificaciones Push

---

## 🚀 Puesta en Marcha Local

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configuración de Variables de Entorno (`.env.local`):**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://kifdurptvbpfmivjjmmh.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_8T02T21fZSRBdg2KbBoCVw_C8H6pZP1
   DATABASE_URL=postgresql://postgres.kifdurptvbpfmivjjmmh:tiendaderopa15demo25@aws-0-us-east-2.pooler.supabase.com:5432/postgres
   NEXT_PUBLIC_STORE_NAME="Demo Store"
   ```

3. **Inicializar y poblar la Base de Datos:**
   ```bash
   npm run db:init
   ```

4. **Iniciar Servidor de Desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) para ver la tienda pública.
   Abre [http://localhost:3000/sala-de-control](http://localhost:3000/sala-de-control) para el panel de administración.

---

## ☁️ Despliegue en Vercel

1. Sube el repositorio a GitHub o GitLab.
2. Importa el proyecto en [Vercel](https://vercel.com).
3. Añade las mismas variables de entorno de `.env.local` en el panel de Vercel.
4. ¡El proyecto se desplegará automáticamente con soporte para SSR y API Routes!


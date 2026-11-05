const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.kifdurptvbpfmivjjmmh:tiendaderopa15demo25@aws-0-us-east-2.pooler.supabase.com:5432/postgres';

async function initDB() {
  console.log('Connecting to database...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL successfully!');

    console.log('Creating tables...');

    // 1. Settings Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS store_settings (
        id VARCHAR(50) PRIMARY KEY,
        store_name VARCHAR(255) NOT NULL DEFAULT 'Demo Store',
        tagline TEXT DEFAULT 'Moda Exclusiva & Marca Personal',
        logo_url TEXT DEFAULT '',
        logo_dark_url TEXT DEFAULT '',
        favicon_url TEXT DEFAULT '',
        color_primary VARCHAR(50) DEFAULT '#0f172a',
        color_secondary VARCHAR(50) DEFAULT '#d97706',
        color_bg VARCHAR(50) DEFAULT '#f8fafc',
        color_text VARCHAR(50) DEFAULT '#0f172a',
        font_family VARCHAR(100) DEFAULT 'Inter',
        button_radius VARCHAR(50) DEFAULT '0.5rem',
        brand_bio TEXT DEFAULT 'Creador de contenido y diseñador de moda. Cada pieza refleja autenticidad, elegancia urbana y confort premium.',
        brand_story TEXT DEFAULT 'Nuestra marca nació de la pasión por transformar prendas cotidianas en declaraciones de estilo propio. Diseñamos con materiales de la más alta calidad y cortes vanguardistas para quienes no temen destacar.',
        brand_profile_img TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        brand_video_url TEXT DEFAULT '',
        contact_email VARCHAR(255) DEFAULT 'contacto@demostore.com',
        contact_phone VARCHAR(100) DEFAULT '+58 412 1234567',
        contact_address TEXT DEFAULT 'Caracas, Venezuela / Envíos a todo el país',
        copyright_text TEXT DEFAULT '© 2026 Demo Store. Todos los derechos reservados.',
        terms_content TEXT DEFAULT 'Al comprar en nuestra tienda aceptas los términos y condiciones de envío, pagos y devoluciones dentro de los primeros 7 días continuos.',
        privacy_content TEXT DEFAULT 'Tus datos están protegidos y solo se utilizan para el procesamiento de tus pedidos y envíos.',
        shipping_content TEXT DEFAULT 'Envíos nacionales a través de MRW, Zoom y Tealca. Despachos en 24-48 horas hábiles tras la confirmación de tu pago.',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Categories
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        image_url TEXT,
        banner_url TEXT,
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Attribute Groups
    await client.query(`
      CREATE TABLE IF NOT EXISTS attribute_groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) DEFAULT 'text',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Attribute Values
    await client.query(`
      CREATE TABLE IF NOT EXISTS attribute_values (
        id SERIAL PRIMARY KEY,
        group_id INT REFERENCES attribute_groups(id) ON DELETE CASCADE,
        label VARCHAR(100) NOT NULL,
        value VARCHAR(100) NOT NULL,
        sort_order INT DEFAULT 0
      );
    `);

    // 5. Products
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        category_id INT REFERENCES categories(id) ON DELETE SET NULL,
        price NUMERIC(10,2) NOT NULL,
        reseller_price NUMERIC(10,2) DEFAULT NULL,
        compare_at_price NUMERIC(10,2) DEFAULT NULL,
        images JSONB DEFAULT '[]'::jsonb,
        badge VARCHAR(50) DEFAULT NULL,
        is_featured BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        stock INT DEFAULT 10,
        attributes JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Currencies
    await client.query(`
      CREATE TABLE IF NOT EXISTS currencies (
        id VARCHAR(10) PRIMARY KEY,
        symbol VARCHAR(10) NOT NULL,
        name VARCHAR(100) NOT NULL,
        rate NUMERIC(12,4) NOT NULL DEFAULT 1.0000,
        is_default BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE
      );
    `);

    // 7. Payment Methods
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        type VARCHAR(20) NOT NULL DEFAULT 'manual',
        is_active BOOLEAN DEFAULT TRUE,
        details JSONB DEFAULT '{}'::jsonb,
        instructions TEXT DEFAULT '',
        api_keys JSONB DEFAULT '{}'::jsonb,
        sort_order INT DEFAULT 0
      );
    `);

    // 8. Orders
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        customer_name VARCHAR(150) NOT NULL,
        customer_email VARCHAR(150) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        shipping_address TEXT NOT NULL,
        city VARCHAR(100) DEFAULT '',
        notes TEXT DEFAULT '',
        items JSONB NOT NULL,
        subtotal NUMERIC(10,2) NOT NULL,
        shipping_cost NUMERIC(10,2) DEFAULT 0,
        total NUMERIC(10,2) NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'USD',
        currency_rate NUMERIC(12,4) DEFAULT 1.0,
        total_in_currency NUMERIC(12,2) NOT NULL,
        payment_method_id VARCHAR(50) NOT NULL,
        payment_reference VARCHAR(100) DEFAULT '',
        payment_receipt_url TEXT DEFAULT '',
        status VARCHAR(30) NOT NULL DEFAULT 'nuevo',
        user_id VARCHAR(50) DEFAULT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 9. Users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(30) NOT NULL DEFAULT 'cliente',
        phone VARCHAR(50) DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 10. Social Links
    await client.query(`
      CREATE TABLE IF NOT EXISTS social_links (
        id SERIAL PRIMARY KEY,
        platform VARCHAR(50) NOT NULL,
        url TEXT NOT NULL,
        icon VARCHAR(50) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0
      );
    `);

    console.log('Tables created or verified.');

    // Seed Store Settings
    await client.query(`
      INSERT INTO store_settings (id, store_name, tagline, logo_url, favicon_url, color_primary, color_secondary, color_bg, color_text, font_family, button_radius)
      VALUES (
        'general',
        'Demo Store',
        'Moda Exclusiva & Marca Personal',
        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=200&q=80',
        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=64&q=80',
        '#0f172a',
        '#d97706',
        '#f8fafc',
        '#0f172a',
        'Inter',
        '0.5rem'
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    // Seed Categories
    await client.query(`
      INSERT INTO categories (name, slug, description, image_url, sort_order)
      VALUES 
        ('Caballeros', 'caballeros', 'Prendas masculinas con cortes oversize, minimalismo y acabados de lujo.', 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80', 1),
        ('Damas', 'damas', 'Moda femenina sofisticada, vestidos versátiles y siluetas contemporáneas.', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80', 2),
        ('Calzado', 'calzado', 'Sneakers urbanos y botines hechos con materiales resistentes y diseño premium.', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80', 3),
        ('Accesorios', 'accesorios', 'Gorras bordadas, joyería discreta y complementos con el sello de la marca.', 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80', 4)
      ON CONFLICT (slug) DO NOTHING;
    `);

    // Seed Attribute Groups & Values
    const attrGroupRes = await client.query(`
      INSERT INTO attribute_groups (name, type)
      VALUES 
        ('Tallas Ropa', 'text'),
        ('Tallas Calzado', 'text'),
        ('Colores', 'color')
      ON CONFLICT DO NOTHING
      RETURNING id, name;
    `);

    // Check existing groups
    const groups = await client.query(`SELECT id, name FROM attribute_groups`);
    const groupMap = {};
    groups.rows.forEach(r => { groupMap[r.name] = r.id; });

    if (groupMap['Tallas Ropa']) {
      const gId = groupMap['Tallas Ropa'];
      const values = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
      for (let i = 0; i < values.length; i++) {
        await client.query(`
          INSERT INTO attribute_values (group_id, label, value, sort_order)
          SELECT $1::int, $2::varchar, $2::varchar, $3::int
          WHERE NOT EXISTS (SELECT 1 FROM attribute_values WHERE group_id = $1 AND label = $2);
        `, [gId, values[i], i + 1]);
      }
    }

    if (groupMap['Tallas Calzado']) {
      const gId = groupMap['Tallas Calzado'];
      const values = ['38', '39', '40', '41', '42', '43', '44', '45'];
      for (let i = 0; i < values.length; i++) {
        await client.query(`
          INSERT INTO attribute_values (group_id, label, value, sort_order)
          SELECT $1::int, $2::varchar, $2::varchar, $3::int
          WHERE NOT EXISTS (SELECT 1 FROM attribute_values WHERE group_id = $1 AND label = $2);
        `, [gId, values[i], i + 1]);
      }
    }

    if (groupMap['Colores']) {
      const gId = groupMap['Colores'];
      const colors = [
        { label: 'Negro Onyx', value: '#111827' },
        { label: 'Blanco Puro', value: '#ffffff' },
        { label: 'Beige Arena', value: '#d4b996' },
        { label: 'Azul Marino', value: '#1e3a8a' },
        { label: 'Verde Militar', value: '#3f6212' },
        { label: 'Vino Tinto', value: '#881337' }
      ];
      for (let i = 0; i < colors.length; i++) {
        await client.query(`
          INSERT INTO attribute_values (group_id, label, value, sort_order)
          SELECT $1::int, $2::varchar, $3::varchar, $4::int
          WHERE NOT EXISTS (SELECT 1 FROM attribute_values WHERE group_id = $1 AND label = $2);
        `, [gId, colors[i].label, colors[i].value, i + 1]);
      }
    }

    // Seed Currencies
    await client.query(`
      INSERT INTO currencies (id, symbol, name, rate, is_default, is_active)
      VALUES 
        ('USD', '$', 'Dólar Estadounidense (USD)', 1.0000, TRUE, TRUE),
        ('EUR', '€', 'Euro (EUR)', 0.9200, FALSE, TRUE),
        ('VES', 'Bs.', 'Bolívar Venezolano (VES)', 45.0000, FALSE, TRUE)
      ON CONFLICT (id) DO UPDATE SET rate = EXCLUDED.rate;
    `);

    // Seed Payment Methods
    await client.query(`
      INSERT INTO payment_methods (id, title, type, is_active, details, instructions, sort_order)
      VALUES 
        (
          'pago_movil',
          'Pago Móvil (Venezuela)',
          'manual',
          TRUE,
          '{"banco": "Banesco (0134)", "telefono": "0412-1234567", "documento": "V-20123456", "titular": "Carlos La Rosa"}'::jsonb,
          'Transfiere el monto total a la tasa oficial del día. Una vez realizado, ingresa el número de referencia y adjunta la captura de pantalla para confirmar tu despacho de inmediato.',
          1
        ),
        (
          'zelle',
          'Zelle (USD)',
          'manual',
          TRUE,
          '{"email": "pagos@demostore.com", "titular": "Demo Store LLC"}'::jsonb,
          'Envía el monto exacto vía Zelle al correo indicado. Especifica en la nota tu nombre completo. Recuerda guardar el comprobante para reportar tu compra.',
          2
        ),
        (
          'transferencia',
          'Transferencia Bancaria Nacional',
          'manual',
          TRUE,
          '{"banco": "Banco Mercantil", "cuenta": "0105-0012-34-1234567890", "titular": "Demo Store C.A.", "rif": "J-50123456-0"}'::jsonb,
          'Realiza la transferencia desde cualquier banco nacional. Para transferencias interbancarias, el despacho se procesará una vez se haga efectiva la transacción.',
          3
        ),
        (
          'binance',
          'Binance Pay / USDT (Cripto)',
          'manual',
          TRUE,
          '{"pay_id": "283749182", "red": "USDT - TRC20 / BSC", "wallet": "TLP382kdsj9284jksdKDFj8329kds9"}'::jsonb,
          'Envía el monto equivalente en USDT mediante Binance Pay ID o transferencia a la billetera en red TRC20. Sin comisiones usando Pay ID.',
          4
        ),
        (
          'efectivo',
          'Efectivo / Pago contra entrega',
          'manual',
          TRUE,
          '{"detalle": "Entrega personal en Caracas o retiro en showroom"}'::jsonb,
          'Paga en divisas en efectivo ($ o €) con billetes en buen estado al recibir tu pedido en la zona acordada.',
          5
        ),
        (
          'stripe',
          'Tarjeta de Crédito / Débito (Stripe)',
          'gateway',
          FALSE,
          '{}'::jsonb,
          'Procesa tu pago de forma instantánea y 100% segura con cualquier tarjeta Visa o MasterCard internacional.',
          6
        )
      ON CONFLICT (id) DO NOTHING;
    `);

    // Seed Social Links
    await client.query(`
      INSERT INTO social_links (platform, url, icon, is_active, sort_order)
      VALUES 
        ('Instagram', 'https://instagram.com/demostore', 'instagram', TRUE, 1),
        ('TikTok', 'https://tiktok.com/@demostore', 'tiktok', TRUE, 2),
        ('WhatsApp', 'https://wa.me/584121234567', 'message-circle', TRUE, 3),
        ('Facebook', 'https://facebook.com/demostore', 'facebook', TRUE, 4)
      ON CONFLICT DO NOTHING;
    `);

    // Seed Users with the 4 Roles
    // Programador (Super Admin Oculto), Admin, Revendedor, Cliente
    await client.query(`
      INSERT INTO users (id, name, email, password_hash, role, phone)
      VALUES 
        ('usr_super_01', 'Carlos Dev (Programador)', 'carlos@demo.com', 'tiendaderopa15demo25', 'programador', '+58 412 0000000'),
        ('usr_admin_01', 'Administrador Tienda', 'admin@demo.com', 'tiendaderopa15demo25', 'admin', '+58 412 1111111'),
        ('usr_resell_01', 'Boutique Aliada (Revendedor)', 'revendedor@demo.com', 'revendedor123', 'revendedor', '+58 414 2222222'),
        ('usr_client_01', 'María González', 'maria@gmail.com', 'cliente123', 'cliente', '+58 416 3333333'),
        ('usr_client_02', 'Alejandro Pérez', 'alejandro@hotmail.com', 'cliente123', 'cliente', '+58 424 4444444')
      ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
    `);

    // Seed Sample Products
    const catCaballeros = await client.query(`SELECT id FROM categories WHERE slug = 'caballeros' LIMIT 1`);
    const catDamas = await client.query(`SELECT id FROM categories WHERE slug = 'damas' LIMIT 1`);
    const catCalzado = await client.query(`SELECT id FROM categories WHERE slug = 'calzado' LIMIT 1`);
    const catAccesorios = await client.query(`SELECT id FROM categories WHERE slug = 'accesorios' LIMIT 1`);

    const cCabId = catCaballeros.rows[0]?.id || null;
    const cDamId = catDamas.rows[0]?.id || null;
    const cCalId = catCalzado.rows[0]?.id || null;
    const cAccId = catAccesorios.rows[0]?.id || null;

    const sampleProducts = [
      {
        name: 'Camisa Oversize Minimalist 2026',
        slug: 'camisa-oversize-minimalist-2026',
        description: 'Confeccionada en 100% algodón peinado de 240 GSM. Caída pesada, cuello reforzado y corte boxy fit para una estética streetwear impecable.',
        category_id: cCabId,
        price: 35.00,
        reseller_price: 24.00,
        compare_at_price: 45.00,
        badge: 'Top Ventas',
        is_featured: true,
        stock: 25,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'
        ]),
        attributes: JSON.stringify({
          tallas: ['S', 'M', 'L', 'XL'],
          colores: [
            { label: 'Negro Onyx', hex: '#111827' },
            { label: 'Blanco Puro', hex: '#ffffff' },
            { label: 'Beige Arena', hex: '#d4b996' }
          ]
        })
      },
      {
        name: 'Hoodie Signature "Brand Identity"',
        slug: 'hoodie-signature-brand-identity',
        description: 'Sudadera premium con capucha forrada, bolsillo canguro y bordado en alta densidad en el pecho con el isotipo de la marca personal.',
        category_id: cCabId,
        price: 55.00,
        reseller_price: 38.00,
        compare_at_price: 70.00,
        badge: 'Edición Limitada',
        is_featured: true,
        stock: 18,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80'
        ]),
        attributes: JSON.stringify({
          tallas: ['M', 'L', 'XL'],
          colores: [
            { label: 'Negro Onyx', hex: '#111827' },
            { label: 'Vino Tinto', hex: '#881337' }
          ]
        })
      },
      {
        name: 'Vestido Midi Satinado Elegance',
        slug: 'vestido-midi-satinado-elegance',
        description: 'Vestido fluido en satén suave con tirantes ajustables y caída asimétrica. Ideal para eventos nocturnos o salidas casuales con estilo.',
        category_id: cDamId,
        price: 48.00,
        reseller_price: 32.00,
        compare_at_price: 60.00,
        badge: 'Nuevo',
        is_featured: true,
        stock: 15,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80'
        ]),
        attributes: JSON.stringify({
          tallas: ['XS', 'S', 'M', 'L'],
          colores: [
            { label: 'Negro Onyx', hex: '#111827' },
            { label: 'Vino Tinto', hex: '#881337' },
            { label: 'Beige Arena', hex: '#d4b996' }
          ]
        })
      },
      {
        name: 'Sneaker Urbano Street Runner V1',
        slug: 'sneaker-urbano-street-runner-v1',
        description: 'Calzado urbano con suela ergonómica de amortiguación alta, inserciones de cuero vegano y plantilla con memoria de pisada.',
        category_id: cCalId,
        price: 75.00,
        reseller_price: 52.00,
        compare_at_price: 95.00,
        badge: 'Más Vendido',
        is_featured: true,
        stock: 30,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80'
        ]),
        attributes: JSON.stringify({
          tallas: ['39', '40', '41', '42', '43', '44'],
          colores: [
            { label: 'Rojo Carmesí', hex: '#dc2626' },
            { label: 'Negro Onyx', hex: '#111827' },
            { label: 'Blanco Puro', hex: '#ffffff' }
          ]
        })
      },
      {
        name: 'Botines Chelsea Cuero Vintage',
        slug: 'botines-chelsea-cuero-vintage',
        description: 'Botines clásicos con elásticos laterales y suela cosida reforzada. Un esencial atemporal para cualquier ocasión.',
        category_id: cCalId,
        price: 89.00,
        reseller_price: 65.00,
        compare_at_price: 115.00,
        badge: 'Premium',
        is_featured: false,
        stock: 12,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80'
        ]),
        attributes: JSON.stringify({
          tallas: ['40', '41', '42', '43', '44'],
          colores: [
            { label: 'Negro Onyx', hex: '#111827' },
            { label: 'Marrón Cuero', hex: '#78350f' }
          ]
        })
      },
      {
        name: 'Gorra Estructurada Bordado 3D',
        slug: 'gorra-estructurada-bordado-3d',
        description: 'Gorra de 6 paneles con visera curva, broche metálico ajustable y bordado tridimensional de la insignia de la marca.',
        category_id: cAccId,
        price: 22.00,
        reseller_price: 15.00,
        compare_at_price: 28.00,
        badge: 'Accesorio',
        is_featured: false,
        stock: 40,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80'
        ]),
        attributes: JSON.stringify({
          tallas: ['Única'],
          colores: [
            { label: 'Negro Onyx', hex: '#111827' },
            { label: 'Verde Militar', hex: '#3f6212' }
          ]
        })
      }
    ];

    for (const p of sampleProducts) {
      await client.query(`
        INSERT INTO products (name, slug, description, category_id, price, reseller_price, compare_at_price, badge, is_featured, stock, images, attributes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (slug) DO NOTHING;
      `, [p.name, p.slug, p.description, p.category_id, p.price, p.reseller_price, p.compare_at_price, p.badge, p.is_featured, p.stock, p.images, p.attributes]);
    }

    // Seed Sample Orders
    await client.query(`
      INSERT INTO orders (id, customer_name, customer_email, customer_phone, shipping_address, city, notes, items, subtotal, shipping_cost, total, currency, currency_rate, total_in_currency, payment_method_id, payment_reference, status, created_at)
      VALUES 
        (
          'ORD-2026-001',
          'Valeria Rivas',
          'valeria.rivas@gmail.com',
          '+58 414 9876543',
          'Urb. Las Mercedes, Calle París, Edif. Bella Vista, Apto 4B',
          'Caracas',
          'Favor llamar antes de entregar',
          '[{"name": "Vestido Midi Satinado Elegance", "quantity": 1, "price": 48.00, "talla": "M", "color": "Negro Onyx"}]'::jsonb,
          48.00,
          0.00,
          48.00,
          'USD',
          1.0,
          48.00,
          'pago_movil',
          'REF-894201',
          'nuevo',
          NOW() - INTERVAL '2 hours'
        ),
        (
          'ORD-2026-002',
          'Daniel Briceño',
          'danielb@empresa.com',
          '+58 412 5556677',
          'Av. Bolívar Norte, Centro Empresarial Torre A, Piso 5',
          'Valencia',
          '',
          '[{"name": "Sneaker Urbano Street Runner V1", "quantity": 1, "price": 75.00, "talla": "42", "color": "Rojo Carmesí"}, {"name": "Gorra Estructurada Bordado 3D", "quantity": 1, "price": 22.00, "talla": "Única", "color": "Negro Onyx"}]'::jsonb,
          97.00,
          5.00,
          102.00,
          'USD',
          1.0,
          102.00,
          'zelle',
          'ZLL-CONF-7749',
          'confirmado',
          NOW() - INTERVAL '1 day'
        ),
        (
          'ORD-2026-003',
          'Marcos Zambrano',
          'marcosz@yahoo.com',
          '+58 424 1122334',
          'Barquisimeto Este, Conjunto El Parral',
          'Barquisimeto',
          'Envío por Zoom',
          '[{"name": "Camisa Oversize Minimalist 2026", "quantity": 2, "price": 35.00, "talla": "L", "color": "Blanco Puro"}]'::jsonb,
          70.00,
          0.00,
          70.00,
          'USD',
          1.0,
          70.00,
          'transferencia',
          'TRANSFER-99218',
          'rechazado',
          NOW() - INTERVAL '3 days'
        )
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('Database initialization & seeding completed successfully!');
  } catch (error) {
    console.error('Error during database initialization:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initDB();

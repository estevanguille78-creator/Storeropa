import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const includeInactive = searchParams.get('include_inactive') === 'true';

    let sql = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (!includeInactive) {
      sql += ` AND p.is_active = TRUE`;
    }

    if (categorySlug) {
      params.push(categorySlug);
      sql += ` AND c.slug = $${params.length}`;
    }

    if (featured === 'true') {
      sql += ` AND p.is_featured = TRUE`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
    }

    sql += ` ORDER BY p.id DESC`;

    const res = await query(sql, params);
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      description,
      category_id,
      price,
      reseller_price,
      compare_at_price,
      images,
      badge,
      is_featured,
      is_active,
      stock,
      attributes,
    } = body;

    const safeSlug =
      slug?.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') +
        '-' +
        Date.now().toString().slice(-4);

    const res = await query(
      `
      INSERT INTO products (
        name, slug, description, category_id, price, reseller_price, compare_at_price,
        images, badge, is_featured, is_active, stock, attributes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
      `,
      [
        name,
        safeSlug,
        description || '',
        category_id || null,
        price,
        reseller_price || null,
        compare_at_price || null,
        JSON.stringify(images || []),
        badge || null,
        is_featured ?? false,
        is_active ?? true,
        stock ?? 10,
        JSON.stringify(attributes || {}),
      ]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
  }
}


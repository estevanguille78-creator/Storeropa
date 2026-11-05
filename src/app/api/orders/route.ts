import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let sql = `
      SELECT o.*, p.title as payment_method_title
      FROM orders o
      LEFT JOIN payment_methods p ON o.payment_method_id = p.id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (status && status !== 'todos') {
      params.push(status);
      sql += ` AND o.status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (
        o.customer_name ILIKE $${params.length} OR 
        o.customer_email ILIKE $${params.length} OR 
        o.customer_phone ILIKE $${params.length} OR
        o.id ILIKE $${params.length}
      )`;
    }

    sql += ` ORDER BY o.created_at DESC`;

    const res = await query(sql, params);
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      city,
      notes,
      items,
      subtotal,
      shipping_cost,
      total,
      currency,
      currency_rate,
      total_in_currency,
      payment_method_id,
      payment_reference,
      payment_receipt_url,
      user_id,
    } = body;

    const orderId = 'ORD-' + Date.now().toString().slice(-6);

    const res = await query(
      `
      INSERT INTO orders (
        id, customer_name, customer_email, customer_phone, shipping_address, city, notes,
        items, subtotal, shipping_cost, total, currency, currency_rate, total_in_currency,
        payment_method_id, payment_reference, payment_receipt_url, status, user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 'nuevo', $18)
      RETURNING *;
      `,
      [
        orderId,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        city || '',
        notes || '',
        JSON.stringify(items || []),
        subtotal,
        shipping_cost || 0,
        total,
        currency || 'USD',
        currency_rate || 1.0,
        total_in_currency || total,
        payment_method_id,
        payment_reference || '',
        payment_receipt_url || '',
        user_id || null,
      ]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Error al crear pedido' }, { status: 500 });
  }
}


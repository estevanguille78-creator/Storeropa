import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query('SELECT * FROM payment_methods ORDER BY sort_order ASC, id ASC');
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Error al obtener métodos de pago' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, type, is_active, details, instructions, api_keys, sort_order } = body;

    const res = await query(
      `
      UPDATE payment_methods
      SET
        title = COALESCE($1, title),
        type = COALESCE($2, type),
        is_active = COALESCE($3, is_active),
        details = COALESCE($4::jsonb, details),
        instructions = COALESCE($5, instructions),
        api_keys = COALESCE($6::jsonb, api_keys),
        sort_order = COALESCE($7, sort_order)
      WHERE id = $8
      RETURNING *;
      `,
      [
        title,
        type,
        is_active,
        details ? JSON.stringify(details) : null,
        instructions,
        api_keys ? JSON.stringify(api_keys) : null,
        sort_order,
        id,
      ]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Método de pago no encontrado' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Error updating payment method:', error);
    return NextResponse.json({ error: 'Error al actualizar método de pago' }, { status: 500 });
  }
}


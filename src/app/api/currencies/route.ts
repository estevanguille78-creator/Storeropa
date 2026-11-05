import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query('SELECT * FROM currencies ORDER BY is_default DESC, id ASC');
    return NextResponse.json(res.rows, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error fetching currencies:', error);
    return NextResponse.json({ error: 'Error al obtener monedas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, symbol, name, rate, is_default, is_active } = body;

    const res = await query(
      `
      INSERT INTO currencies (id, symbol, name, rate, is_default, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE
      SET
        symbol = EXCLUDED.symbol,
        name = EXCLUDED.name,
        rate = EXCLUDED.rate,
        is_default = EXCLUDED.is_default,
        is_active = EXCLUDED.is_active
      RETURNING *;
      `,
      [id.toUpperCase(), symbol, name, rate || 1.0, is_default ?? false, is_active ?? true]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating/updating currency:', error);
    return NextResponse.json({ error: 'Error al procesar moneda' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    // Batch update currencies (e.g. rate changes)
    if (Array.isArray(body)) {
      for (const cur of body) {
        await query(
          `UPDATE currencies SET rate = $1, is_active = $2, is_default = $3 WHERE id = $4`,
          [cur.rate, cur.is_active, cur.is_default, cur.id]
        );
      }
      const updated = await query('SELECT * FROM currencies ORDER BY is_default DESC, id ASC');
      return NextResponse.json(updated.rows);
    }

    const { id, rate, is_active, is_default } = body;
    const res = await query(
      `
      UPDATE currencies
      SET rate = COALESCE($1, rate),
          is_active = COALESCE($2, is_active),
          is_default = COALESCE($3, is_default)
      WHERE id = $4
      RETURNING *;
      `,
      [rate, is_active, is_default, id]
    );

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Error updating currency:', error);
    return NextResponse.json({ error: 'Error al actualizar moneda' }, { status: 500 });
  }
}

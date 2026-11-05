import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query('SELECT * FROM social_links ORDER BY sort_order ASC, id ASC');
    return NextResponse.json(res.rows, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error fetching social links:', error);
    return NextResponse.json({ error: 'Error al obtener enlaces sociales' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { platform, url, icon, is_active, sort_order } = body;

    const res = await query(
      `
      INSERT INTO social_links (platform, url, icon, is_active, sort_order)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
      `,
      [platform, url, icon || 'globe', is_active ?? true, sort_order || 0]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating social link:', error);
    return NextResponse.json({ error: 'Error al crear enlace social' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, platform, url, icon, is_active, sort_order } = body;

    const res = await query(
      `
      UPDATE social_links
      SET
        platform = COALESCE($1, platform),
        url = COALESCE($2, url),
        icon = COALESCE($3, icon),
        is_active = COALESCE($4, is_active),
        sort_order = COALESCE($5, sort_order)
      WHERE id = $6
      RETURNING *;
      `,
      [platform, url, icon, is_active, sort_order, id]
    );

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Error updating social link:', error);
    return NextResponse.json({ error: 'Error al actualizar enlace social' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }
    await query('DELETE FROM social_links WHERE id = $1', [parseInt(id, 10)]);
    return NextResponse.json({ success: true, message: 'Enlace eliminado' });
  } catch (error) {
    console.error('Error deleting social link:', error);
    return NextResponse.json({ error: 'Error al eliminar enlace social' }, { status: 500 });
  }
}

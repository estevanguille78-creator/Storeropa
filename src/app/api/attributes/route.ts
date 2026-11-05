import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const groupsRes = await query('SELECT * FROM attribute_groups ORDER BY id ASC');
    const valuesRes = await query('SELECT * FROM attribute_values ORDER BY sort_order ASC, id ASC');

    const groupsWithValues = groupsRes.rows.map((group) => ({
      ...group,
      values: valuesRes.rows.filter((val) => val.group_id === group.id),
    }));

    return NextResponse.json(groupsWithValues);
  } catch (error) {
    console.error('Error fetching attributes:', error);
    return NextResponse.json({ error: 'Error al obtener atributos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, group_name, group_type, group_id, label, value, sort_order } = body;

    // Action: create_group
    if (action === 'create_group' || group_name) {
      const res = await query(
        'INSERT INTO attribute_groups (name, type) VALUES ($1, $2) RETURNING *',
        [group_name, group_type || 'text']
      );
      return NextResponse.json(res.rows[0], { status: 201 });
    }

    // Action: add_value
    if (action === 'add_value' || (group_id && label)) {
      const res = await query(
        'INSERT INTO attribute_values (group_id, label, value, sort_order) VALUES ($1, $2, $3, $4) RETURNING *',
        [group_id, label, value || label, sort_order || 0]
      );
      return NextResponse.json(res.rows[0], { status: 201 });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    console.error('Error creating attribute/value:', error);
    return NextResponse.json({ error: 'Error al crear atributo' }, { status: 500 });
  }
}


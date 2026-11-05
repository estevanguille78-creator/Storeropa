import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone, country, age } = body;

    // Validations
    if (!name || !email || !password || !phone || !country || !age) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios: Nombre, correo, contraseña, WhatsApp, país y edad.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const parsedAge = parseInt(age, 10);

    if (isNaN(parsedAge) || parsedAge < 12 || parsedAge > 120) {
      return NextResponse.json(
        { error: 'Por favor ingresa una edad válida (mínimo 12 años).' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'Este correo electrónico ya está registrado. Por favor inicia sesión.' },
        { status: 409 }
      );
    }

    // Generate user ID
    const userId = 'usr_' + Date.now().toString().slice(-6);

    const res = await query(
      `
      INSERT INTO users (id, name, email, password_hash, role, phone, country, age)
      VALUES ($1, $2, $3, $4, 'cliente', $5, $6, $7)
      RETURNING id, name, email, role, phone, country, age, created_at;
      `,
      [userId, name.trim(), cleanEmail, password, phone.trim(), country.trim(), parsedAge]
    );

    return NextResponse.json(
      {
        message: '¡Registro exitoso!',
        user: res.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in user registration:', error);
    return NextResponse.json(
      { error: 'Error interno al registrar usuario.' },
      { status: 500 }
    );
  }
}


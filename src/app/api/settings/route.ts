import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query('SELECT * FROM store_settings WHERE id = $1 LIMIT 1', ['general']);
    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Configuración no encontrada' }, { status: 404 });
    }
    return NextResponse.json(res.rows[0], {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      store_name,
      tagline,
      logo_url,
      logo_dark_url,
      favicon_url,
      color_primary,
      color_secondary,
      color_bg,
      color_text,
      font_family,
      button_radius,
      brand_bio,
      brand_story,
      brand_profile_img,
      brand_video_url,
      contact_email,
      contact_phone,
      contact_address,
      copyright_text,
      terms_content,
      privacy_content,
      shipping_content,
    } = body;

    const res = await query(
      `
      UPDATE store_settings
      SET 
        store_name = COALESCE($1, store_name),
        tagline = COALESCE($2, tagline),
        logo_url = COALESCE($3, logo_url),
        logo_dark_url = COALESCE($4, logo_dark_url),
        favicon_url = COALESCE($5, favicon_url),
        color_primary = COALESCE($6, color_primary),
        color_secondary = COALESCE($7, color_secondary),
        color_bg = COALESCE($8, color_bg),
        color_text = COALESCE($9, color_text),
        font_family = COALESCE($10, font_family),
        button_radius = COALESCE($11, button_radius),
        brand_bio = COALESCE($12, brand_bio),
        brand_story = COALESCE($13, brand_story),
        brand_profile_img = COALESCE($14, brand_profile_img),
        brand_video_url = COALESCE($15, brand_video_url),
        contact_email = COALESCE($16, contact_email),
        contact_phone = COALESCE($17, contact_phone),
        contact_address = COALESCE($18, contact_address),
        copyright_text = COALESCE($19, copyright_text),
        terms_content = COALESCE($20, terms_content),
        privacy_content = COALESCE($21, privacy_content),
        shipping_content = COALESCE($22, shipping_content),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 'general'
      RETURNING *;
      `,
      [
        store_name,
        tagline,
        logo_url,
        logo_dark_url,
        favicon_url,
        color_primary,
        color_secondary,
        color_bg,
        color_text,
        font_family,
        button_radius,
        brand_bio,
        brand_story,
        brand_profile_img,
        brand_video_url,
        contact_email,
        contact_phone,
        contact_address,
        copyright_text,
        terms_content,
        privacy_content,
        shipping_content,
      ]
    );

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 });
  }
}

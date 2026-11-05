import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'group'; // 'group' or 'value'

    if (type === 'value') {
      await query('DELETE FROM attribute_values WHERE id = $1', [id]);
      return NextResponse.json({ success: true, message: 'Valor de atributo eliminado' });
    } else {
      await query('DELETE FROM attribute_groups WHERE id = $1', [id]);
      return NextResponse.json({ success: true, message: 'Grupo de atributos eliminado' });
    }
  } catch (error) {
    console.error('Error deleting attribute:', error);
    return NextResponse.json({ error: 'Error al eliminar atributo' }, { status: 500 });
  }
}


const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.kifdurptvbpfmivjjmmh:tiendaderopa15demo25@aws-0-us-east-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const email = 'larosagranado1111@gmail.com';
    const check = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);

    if (check.rows.length > 0) {
      await pool.query(
        'UPDATE users SET role = $1, password_hash = $2, name = $3 WHERE LOWER(email) = LOWER($4)',
        ['programador', 'tiendaderopa15demo25', 'Carlos La Rosa', email]
      );
      console.log('✅ Usuario actualizado con rol programador:', email);
    } else {
      await pool.query(
        'INSERT INTO users (id, name, email, password_hash, role, phone, country, age) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        ['usr_prog_carlos', 'Carlos La Rosa', email, 'tiendaderopa15demo25', 'programador', '+58 412 0000000', 'Venezuela', 26]
      );
      console.log('✅ Usuario creado con éxito con rol programador:', email);
    }

    const verified = await pool.query('SELECT id, name, email, role, phone, country, age FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    console.log('Datos del usuario en Supabase:', verified.rows[0]);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();

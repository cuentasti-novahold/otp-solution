import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// 🔁 Pool reutilizable para evitar exceso de conexiones
const pool = mysql.createPool({
    host: 'dev-safi.cluster-chm4dm65arlq.us-east-1.rds.amazonaws.com',
    user: 'adminsafi',
    password: 'S4F1-D3v-#SH&F*$%#SAFI',
    database: 'microfinFC',
    waitForConnections: true,
    connectionLimit: 10, // 👈 ajusta según tu capacidad
    queueLimit: 0
});

export async function POST(request: NextRequest) {
    let connection;

    try {
        console.log('[POST /api/usuario/existe] Iniciando verificación de usuario');

        const { usuario } = await request.json();
        console.log(`[POST /api/usuario/existe] Usuario recibido: ${usuario}`);

        if (!usuario || typeof usuario !== 'string') {
            console.warn('[POST /api/usuario/existe] Usuario vacío o inválido');
            return NextResponse.json({ exists: false, message: 'Usuario vacío o inválido' }, { status: 400 });
        }

        connection = await pool.getConnection();
        console.log('[POST /api/usuario/existe] Conexión a base de datos establecida');

        const query = `
            SELECT 
                UsuarioID,
                Estatus,
                FechaCancel,
                FechaBloqueo,
                MotivoBloqueo
            FROM USUARIOS
            WHERE Clave = ?
        `;
        console.log(`[POST /api/usuario/existe] Ejecutando consulta con parámetro: ${usuario.toUpperCase()}`);

        const [rows]: any = await connection.query(query, [usuario.toUpperCase()]);
        console.log(`[POST /api/usuario/existe] Resultados obtenidos: ${rows.length} fila(s)`);

        if (rows.length > 0) {
            const user = rows[0];

            console.log(`[POST /api/usuario/existe] Usuario encontrado. ID=${user.UsuarioID}, Estatus=${user.Estatus}`);

            return NextResponse.json({
                exists: true,
                usuarioID: user.UsuarioID,
                estatus: user.Estatus,
                fechaCancel: user.FechaCancel,
                fechaBloqueo: user.FechaBloqueo,
                motivoBloqueo: user.MotivoBloqueo
            });
        } else {
            console.log('[POST /api/usuario/existe] Usuario no encontrado');
            return NextResponse.json({ exists: false });
        }

    } catch (error) {
        console.error('[POST /api/usuario/existe] Error en ejecución:', error);
        return NextResponse.json({ exists: false, error: (error as Error).message }, { status: 500 });
    } finally {
        if (connection) {
            connection.release(); // ✅ Muy importante para no saturar el pool
        }
    }
}

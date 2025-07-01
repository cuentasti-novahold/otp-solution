import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request: NextRequest) {
    try {
        console.log('[POST /api/usuario/existe] Iniciando verificación de usuario');

        const { usuario } = await request.json();
        console.log(`[POST /api/usuario/existe] Usuario recibido: ${usuario}`);

        if (!usuario) {
            console.warn('[POST /api/usuario/existe] Usuario vacío recibido');
            return NextResponse.json({ exists: false, message: 'Usuario vacío' }, { status: 400 });
        }

        const connection = await mysql.createConnection({
            host: 'dev-safi.cluster-chm4dm65arlq.us-east-1.rds.amazonaws.com',
            user: 'adminsafi',
            password: 'S4F1-D3v-#SH&F*$%#SAFI',
            database: 'microfinFC',
        });

        console.log('[POST /api/usuario/existe] Conexión a base de datos exitosa');

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
        console.log(`[POST /api/usuario/existe] Ejecutando consulta: ${query} con parámetro: ${usuario.toUpperCase()}`);

        const [rows]: any = await connection.query(query, [usuario.toUpperCase()]);
        console.log(`[POST /api/usuario/existe] Resultados obtenidos: ${rows.length} fila(s)`);

        if (rows.length > 0) {
            const user = rows[0];

            console.log(`[POST /api/usuario/existe] Usuario encontrado. ID=${user.UsuarioID}, Estatus=${user.Estatus}`);

            if (user.FechaCancel) {
                console.warn(`[POST /api/usuario/existe] Usuario cancelado desde: ${user.FechaCancel}`);
            }

            if (user.FechaBloqueo) {
                console.warn(`[POST /api/usuario/existe] Usuario bloqueado desde: ${user.FechaBloqueo}, Motivo: ${user.MotivoBloqueo}`);
            }

            return NextResponse.json({
                exists: true,
                usuarioID: user.UsuarioID,
                estatus: user.Estatus,
                cancelado: !!user.FechaCancel,
                bloqueado: !!user.FechaBloqueo,
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
    }
}

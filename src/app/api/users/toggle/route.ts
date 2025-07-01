import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request: NextRequest) {
    try {
        const clientIp = request.headers.get('x-forwarded-for') || 'IP no disponible';
        const body = await request.json();
        const { usuario, estado } = body;

        if (!usuario || !estado) {
            return NextResponse.json({ error: 'Faltan parámetros.' }, { status: 400 });
        }

        const connection = await mysql.createConnection({
            host: 'dev-safi.cluster-chm4dm65arlq.us-east-1.rds.amazonaws.com',
            user: 'adminsafi',
            password: 'S4F1-D3v-#SH&F*$%#SAFI',
            database: 'microfinFC',
            multipleStatements: true,
        });

        // 🔍 Buscar UsuarioID a partir del nombre de usuario
        const [rows]: any = await connection.query(
            'SELECT UsuarioID FROM USUARIOS WHERE Usuario = ?',
            [usuario]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
        }

        const id = rows[0].UsuarioID;

        const [results]: any = await connection.query(
            `CALL microfinFC.USUARIOSACT(?, NULL, ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ?, @NumErr, @ErrMen, ?, ?, NOW(), ?, 'APP', 1, 1234567890);
             SELECT @NumErr AS NumErr, @ErrMen AS ErrMen;`,
            [
                id,
                estado === 'BLOQUEADO' ? 'A' : 'B',
                2,
                1,
                1,
                clientIp
            ]
        );

        const output = results[1][0];

        if (output.NumErr !== 0) {
            return NextResponse.json({ error: output.ErrMen }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: output.ErrMen });

    } catch (error) {
        console.error('Error al ejecutar SP USUARIOSACT:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

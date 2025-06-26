import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, estado } = body;

        if (!id || !estado) {
            return NextResponse.json({ error: 'Faltan parámetros.' }, { status: 400 });
        }

        // Crear conexión a MySQL
        const connection = await mysql.createConnection({
            host: 'TU_HOST',
            user: 'TU_USUARIO',
            password: 'TU_CONTRASEÑA',
            database: 'microfinFC',
        });

        const [results] = await connection.query(`CALL microfinFC.USUARIOSACT(?, NULL, ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ?, @NumErr, @ErrMen, ?, ?, NOW(), '127.0.0.1', 'APP', 1, 1234567890); SELECT @NumErr AS NumErr, @ErrMen AS ErrMen;`, [
            id,                       // Par_NumUsuario
            estado === 'BLOQUEADO' ? 'A' : 'B', // Cambia al estado contrario
            2,                        // Par_NumAct = bloqueo/desbloqueo
            1,                        // Par_EmpresaID
            1,                        // Aud_Usuario
        ]);

        const output = (results as any[])[1][0];

        if (output.NumErr !== 0) {
            return NextResponse.json({ error: output.ErrMen }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: output.ErrMen });
    } catch (error) {
        console.error('Error al ejecutar SP USUARIOSACT:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

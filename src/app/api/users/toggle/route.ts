import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request: NextRequest) {
    try {
        // 🔍 Obtener IP del cliente
        const clientIp = request.headers.get('x-forwarded-for') || 'IP no disponible';
        console.log('>>> IP del cliente:', clientIp);

        const body = await request.json();
        const { id, estado } = body;

        if (!id || !estado) {
            console.log('>>> Faltan parámetros');
            return NextResponse.json({ error: 'Faltan parámetros.' }, { status: 400 });
        }

        const connection = await mysql.createConnection({
            host: 'dev-safi.cluster-chm4dm65arlq.us-east-1.rds.amazonaws.com',
            user: 'adminsafi',
            password: 'TS4F1-D3v-#SH&F*$%#SAFI',
            database: 'microfinFC',
            multipleStatements: true,
        });

        const [results]: any = await connection.query(
            `CALL microfinFC.USUARIOSACT(?, NULL, ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ?, @NumErr, @ErrMen, ?, ?, NOW(), ?, 'APP', 1, 1234567890);
             SELECT @NumErr AS NumErr, @ErrMen AS ErrMen;`,
            [
                id,                                  // Par_NumUsuario
                estado === 'BLOQUEADO' ? 'A' : 'B', // Par_Estatus (se cambia)
                2,                                   // Par_NumAct
                1,                                   // Par_EmpresaID
                1,                                   // Aud_Usuario
                clientIp                             // Aud_DireccionIP (aquí lo pasamos al SP)
            ]
        );

        console.log('>>> results:', JSON.stringify(results, null, 2));

        const output = results[1][0];

        if (output.NumErr !== 0) {
            console.log('>>> Error en SP:', output.ErrMen);
            return NextResponse.json({ error: output.ErrMen }, { status: 500 });
        }

        console.log('>>> SP ejecutado correctamente:', output.ErrMen);
        return NextResponse.json({ success: true, message: output.ErrMen });

    } catch (error) {
        console.error('Error al ejecutar SP USUARIOSACT:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

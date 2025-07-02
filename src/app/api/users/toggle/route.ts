import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'dev-safi.cluster-chm4dm65arlq.us-east-1.rds.amazonaws.com',
    user: 'adminsafi',
    password: 'S4F1-D3v-#SH&F*$%#SAFI',
    database: 'microfinFC',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
});

export async function POST(request: NextRequest) {
    let connection;

    try {
        const clientIp =
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'IP no disponible';

        const body = await request.json().catch(err => {
            console.error('❌ JSON malformado:', err);
            throw new Error('Cuerpo de la solicitud mal formado.');
        });

        const { usuario, estado } = body;

        if (!usuario || !estado) {
            return NextResponse.json(
                { error: 'Faltan parámetros requeridos: usuario o estado.' },
                { status: 400 }
            );
        }

        const estadoNormalizado = estado.toUpperCase();
        const accion = estadoNormalizado === 'B' || estadoNormalizado === 'BLOQUEADO' ? 'A' : 'B';

        try {
            connection = await pool.getConnection();
        } catch (connError) {
            console.error('❌ Error al obtener conexión MySQL:', connError);
            return NextResponse.json(
                { error: 'No se pudo conectar a la base de datos.' },
                { status: 503 }
            );
        }

        let usuarioID: number;

        try {
            const [rows]: any = await connection.query(
                'SELECT UsuarioID FROM USUARIOS WHERE Clave = ?',
                [usuario]
            );

            if (!rows.length) {
                return NextResponse.json(
                    { error: 'Usuario no encontrado.' },
                    { status: 404 }
                );
            }

            usuarioID = rows[0].UsuarioID;
        } catch (queryError) {
            console.error('❌ Error al consultar usuario:', queryError);
            return NextResponse.json(
                { error: 'Error al buscar el usuario en la base de datos.' },
                { status: 500 }
            );
        }

        let output;

        try {
            // Establecer variables OUT
            await connection.query(`SET @NumErr = 0;`);
            await connection.query(`SET @ErrMen = '';`);

            // Ejecutar procedimiento sin parámetro sobrante
            await connection.query(`
                CALL microfinFC.USUARIOSACT(
                    ?, NULL, ?, '', NULL,
                    NULL, NULL, NULL, NULL, NULL ,NULL,
                    2, 'S',
                    @NumErr, @ErrMen,
                    1, 1, NOW(),
                    ?, 'APP', 1, 1234567890
                );
            `, [
                usuarioID,      // Par_NumUsuario
                accion === 'A' ? '' : 'Bloqueo manual desde app',  // Par_MotivBloq
                clientIp        // Aud_DireccionIP
            ]);

            // Obtener resultados de salida
            const [rows]: any = await connection.query(`SELECT @NumErr AS NumErr, @ErrMen AS ErrMen;`);
            output = rows?.[0];

            if (!output || output.NumErr === undefined || output.ErrMen === undefined) {
                return NextResponse.json({
                    error: 'No se recibió una respuesta válida del procedimiento almacenado.',
                    detalle: 'La salida esperada (@NumErr y @ErrMen) no fue encontrada.'
                }, { status: 500 });
            }

            if (output.NumErr !== 0) {
                return NextResponse.json(
                    { error: output.ErrMen || 'Error desconocido del procedimiento almacenado.' },
                    { status: 500 }
                );
            }

            return NextResponse.json({ success: true, message: output.ErrMen });

        } catch (callError) {
            console.error('❌ Error al ejecutar USUARIOSACT:', callError);
            return NextResponse.json(
                {
                    error: 'Error al ejecutar el procedimiento almacenado.',
                    detalle: callError.message,
                    codigo: callError.code
                },
                { status: 500 }
            );
        }

    } catch (generalError: any) {
        console.error('❌ Error general en endpoint:', generalError);
        return NextResponse.json(
            { error: 'Error interno inesperado.', detalle: generalError.message },
            { status: 500 }
        );
    } finally {
        if (connection) {
            try {
                connection.release();
            } catch (releaseError) {
                console.error('❌ Error al liberar la conexión:', releaseError);
            }
        }
    }
}

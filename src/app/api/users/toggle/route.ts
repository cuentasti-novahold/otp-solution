import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Arnova (microfinFC)
const poolArnova = mysql.createPool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: Number(process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
});

// Guatemala
const poolGuatemala = mysql.createPool({
    host: process.env.DB_GUATEMALA_HOST,
    database: process.env.DB_GUATEMALA_NAME,
    user: process.env.DB_GUATEMALA_USER,
    password: process.env.DB_GUATEMALA_PASS,
    port: Number(process.env.DB_GUATEMALA_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
});

// Solvia (microfinFS)
const poolSolvia = mysql.createPool({
    host: process.env.DB_SOLVIA_HOST,
    database: process.env.DB_SOLVIA_NAME,
    user: process.env.DB_SOLVIA_USER,
    password: process.env.DB_SOLVIA_PASS,
    port: Number(process.env.DB_SOLVIA_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
});

// Función auxiliar para escoger pool
function getPoolByPais(pais?: string) {

    switch ((pais || '').toLowerCase()) {

        case 'solvia':
            return poolSolvia;

        case 'guatemala':
            return poolGuatemala;

        case 'arnova':
        default:
            return poolArnova;
    }
}

// Función para schema
function getSchemaByPais(pais?: string) {

    switch ((pais || '').toLowerCase()) {

        case 'solvia':
            return 'microfinFS';

        case 'guatemala':
            return 'microfinFS';

        case 'arnova':
        default:
            return 'microfinFC';
    }
}

export async function POST(request: NextRequest) {

    let connection;

    try {

        const clientIp =
            request.headers
                .get('x-forwarded-for')
                ?.split(',')[0]
                ?.trim() || 'IP no disponible';

        const body = await request.json();

        const {
            usuario,
            pais
        } = body;

        if (!usuario) {

            return NextResponse.json(
                {
                    error: 'Falta el parámetro requerido: usuario.'
                },
                { status: 400 }
            );
        }

        // Pool dinámico
        const pool = getPoolByPais(pais);

        connection = await pool.getConnection();

        // Buscar usuario
        const [rows]: any = await connection.query(
            `
                SELECT
                    UsuarioID,
                    Clave,
                    Estatus
                FROM USUARIOS
                WHERE Clave = ?
            `,
            [usuario]
        );

        if (!rows.length) {

            return NextResponse.json(
                {
                    error: 'Usuario no encontrado.'
                },
                { status: 404 }
            );
        }

        const usuarioID = rows[0].UsuarioID;
        const claveUsuario = rows[0].Clave;
        const estadoActual = rows[0].Estatus;

        const nuevoEstado =
            estadoActual === 'A'
                ? 'B'
                : 'A';

        const motivoBloqueo =
            nuevoEstado === 'B'
                ? 'Bloqueo manual desde app'
                : '';

        const fechaBloqueo =
            nuevoEstado === 'B'
                ? new Date()
                : null;

        // Variables salida SP
        await connection.query(`
            SET @NumErr = 0;
        `);

        await connection.query(`
            SET @ErrMen = '';
        `);

        // Schema dinámico
        const schema = getSchemaByPais(pais);

        // Stored Procedure
        await connection.query(
            `
                CALL ${schema}.USUARIOSACT(
                    ?, NULL, ?, ?, ?,
                    NULL, NULL, NULL, NULL, NULL, NULL,
                    2, 'S',
                    @NumErr, @ErrMen,
                    1, 1, NOW(),
                    ?, 'APP', 1, 1234567890
                );
            `,
            [
                usuarioID,
                nuevoEstado,
                motivoBloqueo,
                fechaBloqueo,
                clientIp
            ]
        );

        const [result]: any = await connection.query(`
            SELECT
                @NumErr AS NumErr,
                @ErrMen AS ErrMen;
        `);

        const output = result?.[0];

        if (
            !output ||
            output.NumErr === undefined
        ) {

            return NextResponse.json(
                {
                    error:
                        'No se recibió una respuesta válida del procedimiento almacenado.',
                    detalle:
                        'La salida esperada (@NumErr y @ErrMen) no fue encontrada.'
                },
                { status: 500 }
            );
        }

        if (output.NumErr !== 0) {

            return NextResponse.json(
                {
                    error:
                        output.ErrMen ||
                        'Error del procedimiento almacenado.'
                },
                { status: 500 }
            );
        }

        // Log
        await connection.query(
            `
                INSERT INTO BLOQUEO_USUARIO_LOG
                (
                    UsuarioID,
                    ClaveUsuario,
                    Accion,
                    IP,
                    Motivo,
                    FechaAccion
                )
                VALUES
                (
                    ?, ?, ?, ?, ?, NOW()
                )
            `,
            [
                usuarioID,
                claveUsuario,
                nuevoEstado === 'A'
                    ? 'DESBLOQUEO'
                    : 'BLOQUEO',
                clientIp,
                motivoBloqueo ||
                'Desbloqueo manual desde app'
            ]
        );

        return NextResponse.json({

            success: true,

            message:
                nuevoEstado === 'A'
                    ? 'Usuario desbloqueado correctamente.'
                    : 'Usuario bloqueado correctamente.',

            pais: pais || 'arnova'
        });

    } catch (err: any) {

        console.error(
            'Error general:',
            err
        );

        return NextResponse.json(
            {
                error:
                    'Error interno inesperado.',
                detalle: err.message
            },
            { status: 500 }
        );

    } finally {

        if (connection) {
            connection.release();
        }
    }
}
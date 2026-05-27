import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Pool Arnova
const poolArnova = mysql.createPool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: Number(process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Pool Guatemala
const poolGuatemala = mysql.createPool({
    host: process.env.DB_GUATEMALA_HOST,
    database: process.env.DB_GUATEMALA_NAME,
    user: process.env.DB_GUATEMALA_USER,
    password: process.env.DB_GUATEMALA_PASS,
    port: Number(process.env.DB_GUATEMALA_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Pool Solvia
const poolSolvia = mysql.createPool({
    host: process.env.DB_SOLVIA_HOST,
    database: process.env.DB_SOLVIA_NAME,
    user: process.env.DB_SOLVIA_USER,
    password: process.env.DB_SOLVIA_PASS,
    port: Number(process.env.DB_SOLVIA_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Default pool
const poolDefault = poolArnova;

export async function POST(request: NextRequest) {

    let connection;

    try {

        const { usuario, pais } = await request.json();

        console.log(
            `[POST /api/usuario/existe] Usuario=${usuario}, País=${pais || 'default'}`
        );

        if (!usuario || typeof usuario !== 'string') {

            return NextResponse.json(
                {
                    exists: false,
                    message: 'Usuario vacío o inválido'
                },
                { status: 400 }
            );
        }

        // Selección de pool
        let pool;

        switch ((pais || '').toLowerCase()) {

            case 'solvia':
                pool = poolSolvia;
                break;

            case 'guatemala':
                pool = poolGuatemala;
                break;

            case 'arnova':
                pool = poolArnova;
                break;

            default:
                pool = poolDefault;
        }

        connection = await pool.getConnection();

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

        const [rows]: any = await connection.query(
            query,
            [usuario.toUpperCase()]
        );

        if (rows.length > 0) {

            const user = rows[0];

            return NextResponse.json({
                exists: true,
                usuarioID: user.UsuarioID,
                estatus: user.Estatus,
                fechaCancel: user.FechaCancel,
                fechaBloqueo: user.FechaBloqueo,
                motivoBloqueo: user.MotivoBloqueo,
                pais: pais || 'default',
            });
        }

        return NextResponse.json({
            exists: false,
            pais: pais || 'default'
        });

    } catch (error) {

        console.error(
            '[POST /api/usuario/existe] Error en ejecución:',
            error
        );

        return NextResponse.json(
            {
                exists: false,
                error: (error as Error).message
            },
            { status: 500 }
        );

    } finally {

        if (connection) {
            connection.release();
        }
    }
}
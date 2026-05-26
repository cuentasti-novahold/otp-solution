import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

function createPool(config: {
    host?: string;
    database?: string;
    user?: string;
    password?: string;
    port?: string;
}) {
    return mysql.createPool({
        host: config.host,
        database: config.database,
        user: config.user,
        password: config.password,
        port: Number(config.port || 3306),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        dateStrings: true,
    });
}

// ======================================
// POOLS
// ======================================

// Replica Default
const poolReportDefault = createPool({
    host: process.env.DB_REPORT_HOST,
    database: process.env.DB_REPORT_NAME,
    user: process.env.DB_REPORT_USER,
    password: process.env.DB_REPORT_PASS,
    port: process.env.DB_REPORT_PORT,
});

// Solvia
const poolReportSolvia = createPool({
    host: process.env.DB_REPORT_SOLVIA_HOST,
    database: process.env.DB_REPORT_SOLVIA_NAME,
    user: process.env.DB_REPORT_SOLVIA_USER,
    password: process.env.DB_REPORT_SOLVIA_PASS,
    port: process.env.DB_REPORT_SOLVIA_PORT,
});

// Arnova Guatemala
const poolReportArnova = createPool({
    host: process.env.DB_REPORT_ARNOVA_HOST,
    database: process.env.DB_REPORT_ARNOVA_NAME,
    user: process.env.DB_REPORT_ARNOVA_USER,
    password: process.env.DB_REPORT_ARNOVA_PASS,
    port: process.env.DB_REPORT_ARNOVA_PORT,
});

export async function GET(request: NextRequest) {
    let connection;

    try {
        const { searchParams } = new URL(request.url);

        const pais = (searchParams.get('pais') || '')
            .trim()
            .toLowerCase();

        console.log(`[GET /api/codigos-otp] Pais=${pais || 'default'}`);

        let pool = poolReportDefault;

        switch (pais) {
            case 'solvia':
                pool = poolReportSolvia;
                break;

            case 'arnova':
                pool = poolReportDefault;
                break;
            case 'guatemala':
                pool = poolReportArnova;
                break;

            default:
                pool = poolReportDefault;
                break;
        }

        connection = await pool.getConnection();

        const [rows]: any = await connection.query(`
            SELECT 
                Fecha,
                CodigoOTP,
                Estatus,
                OrigenOperacion,
                TiempoExpiracion,
                TelefonoCelular
            FROM CODIGOS_OTP_V
            ORDER BY Fecha DESC
        `);

        const formatted = rows.map((row: any) => ({
            fecha: row.Fecha,
            codigoOtp: row.CodigoOTP,
            estatus: row.Estatus,
            origenOperacion: row.OrigenOperacion,
            tiempoExpiracion: row.TiempoExpiracion,
            telefonoCelular: row.TelefonoCelular,
        }));

        return NextResponse.json(formatted, {
            status: 200,
            headers: {
                'Cache-Control':
                    'no-store, no-cache, must-revalidate, proxy-revalidate',
                Pragma: 'no-cache',
                Expires: '0',
                'Surrogate-Control': 'no-store',
            },
        });
    } catch (error) {
        console.error('[GET /api/codigos-otp] Error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Error consultando OTP',
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        if (connection) {
            connection.release();
        }
    }
}
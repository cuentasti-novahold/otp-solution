import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// 🔁 Pool Reporting Arnova (usa microfinFC → DW)
const poolReportArnova = mysql.createPool({
    host: process.env.DB_REPORT_FC_HOST,
    database: process.env.DB_REPORT_FC_NAME,
    user: process.env.DB_REPORT_FC_USER,
    password: process.env.DB_REPORT_FC_PASS,
    port: Number(process.env.DB_REPORT_FC_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true,
});

// 🔁 Pool Reporting Solvia (usa microfinFS → DWS)
const poolReportSolvia = mysql.createPool({
    host: process.env.DB_REPORT_SOLVIA_HOST,
    database: process.env.DB_REPORT_SOLVIA_NAME,
    user: process.env.DB_REPORT_SOLVIA_USER,
    password: process.env.DB_REPORT_SOLVIA_PASS,
    port: Number(process.env.DB_REPORT_SOLVIA_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true,
});

// 🔁 Pool Reporting Default (Replica → DW)
const poolReportDefault = mysql.createPool({
    host: process.env.DB_REPORT_HOST,
    database: process.env.DB_REPORT_NAME,
    user: process.env.DB_REPORT_USER,
    password: process.env.DB_REPORT_PASS,
    port: Number(process.env.DB_REPORT_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true,
});

export async function GET(request: NextRequest) {
    let connection;

    try {
        const { searchParams } = new URL(request.url);
        const pais = (searchParams.get('pais') || '').toLowerCase();

        console.log(`[GET /api/codigos-otp] Pais=${pais || 'default'}`);

        // Selección de pool según país
        let pool;
        switch (pais) {
            case 'solvia':
                pool = poolReportSolvia;
                break;
            case 'arnova': // 👈 usa mismo DW que microfinFC
                pool = poolReportArnova;
                break;
            default: // 👈 por defecto replica
                pool = poolReportDefault;
        }

        connection = await pool.getConnection();

        const [rows]: any = await connection.query('SELECT * FROM CODIGOS_OTP_V');

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
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Surrogate-Control': 'no-store',
            },
        });
    } catch (error) {
        console.error('[GET /api/codigos-otp] Error en ejecución:', error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}

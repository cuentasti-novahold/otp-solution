import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import mysql from 'mysql2/promise';

// 👇 Fuerza que la función sea dinámica en Next.js (importante para Vercel)
export const dynamic = 'force-dynamic';

const pool = mysql.createPool({
    host: process.env.DB_REPORT_HOST,
    port: Number(process.env.DB_REPORT_PORT),
    user: process.env.DB_REPORT_USER,
    password: process.env.DB_REPORT_PASS,
    database: process.env.DB_REPORT_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export async function GET(request: NextRequest) {
    let connection;

    try {
        connection = await pool.getConnection();

        const [rows]: any[] = await connection.query('SELECT * FROM DW.CODIGOS_OTP_V');

        const formatted = rows.map((row: any) => ({
            fecha: row.Fecha,
            codigoOtp: row.CodigoOTP,
            estatus: row.Estatus,
            origenOperacion: row.OrigenOperacion,
            tiempoExpiracion: row.TiempoExpiracion,
            telefonoCelular: row.TelefonoCelular,
        }));

        // 👇 Respuesta con headers que deshabilitan caché
        return new NextResponse(JSON.stringify(formatted), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Surrogate-Control': 'no-store',
            },
        });
    } catch (error) {
        console.error('❌ Error al consultar CODIGOS_OTP_V:', error);
        return NextResponse.json(
            { error: 'Error al obtener los códigos OTP desde la base de datos.' },
            { status: 500 }
        );
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

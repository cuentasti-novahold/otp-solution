import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'alb-bikleek-bd-confiadora-0705ba8529a5cb41.elb.us-west-2.amazonaws.com',
    port: 13306,
    user: 'lecturaPowerBIReplica',
    password: 'L3ct$r4=P0w3r.B!/r34d0TP#s&r',
    database: 'DW',
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

        return NextResponse.json(formatted);
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

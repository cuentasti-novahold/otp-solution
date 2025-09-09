"use client"

import React, { useEffect, useState } from 'react';
import DataTable from './DataTable';
import ActiveUsers from './ActiveUsers';
import { fetchUsers } from '@/app/api/service';

export interface OTP {
    fecha: string;
    telefonoCelular: string;
    codigoOtp: string;
    origenOperacion: string;
    estatus: string;
    tiempoExpiracion: string;
}

interface HomeProps {
    pais: "fc" | "fs"; // 👈 El Salvador o Brasil
}

export default function Home({ pais }: HomeProps) {
    const [data, setData] = useState<OTP[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showOtp, setShowOtp] = useState<boolean>(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const users = await fetchUsers(); // ✅ uso del servicio centralizado
            setData(users);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (showOtp) loadData();
    }, [showOtp]);

    return (
        <main className="w-full bg-white min-h-screen">
            <div className="p-5">
                <h1 className="text-3xl font-bold mb-6 text-black text-center">
                    {pais === "fc"
                        ? "VERIFICACIÓN OTP Y DESBLOQUEO – EL SALVADOR"
                        : "VERIFICACIÓN OTP Y DESBLOQUEO – BRASIL"}
                </h1>

                {/* Botones */}
                <div className="flex justify-center gap-4 mb-6">
                    <button
                        onClick={() => {
                            setShowOtp(true);
                            loadData();
                        }}
                        className={`font-bold py-3 px-6 rounded-full shadow-md transition duration-300 ${showOtp
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-200 text-black hover:bg-gray-300'
                            }`}
                    >
                        CÓDIGO OTP
                    </button>
                    <button
                        onClick={() => setShowOtp(false)}
                        className={`font-bold py-3 px-6 rounded-full shadow-md transition duration-300 ${!showOtp
                            ? 'bg-lime-500 text-white hover:bg-lime-600'
                            : 'bg-gray-200 text-black hover:bg-gray-300'
                            }`}
                    >
                        DESBLOQUEO USUARIO SAFI
                    </button>
                </div>

                {/* Texto explicativo */}
                <p className="text-center text-gray-700 mb-4">
                    {showOtp
                        ? 'En esta pantalla puedes visualizar los códigos generados en los últimos 10 minutos'
                        : 'Aquí puedes desbloquear usuarios bloqueados del sistema SAFI'}
                </p>

                {/* Tabla de datos */}
                <div className="overflow-x-auto">
                    {showOtp ? (
                        <DataTable users={data} loading={loading} />
                    ) : (
                        <ActiveUsers />
                    )}
                </div>
            </div>
        </main>
    );
}

"use client"

import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable';
import { fetchUsers } from '@/app/api/service';
import ActiveUsers from '../../components/ActiveUsers';

export interface OTP {
  fecha: string;
  telefonoCelular: string;
  codigoOtp: string;
  origenOperacion: string;
  estatus: string;
  tiempoExpiracion: string;
}

export default function Home() {
  const [data, setData] = useState<OTP[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const users = await fetchUsers();
      setData(users);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <main className="w-full bg-white min-h-screen">
      <div className="p-5">
        <h1 className="text-3xl font-bold mb-6 text-black text-center">
          VERIFICACIÓN OTP Y DESBLOQUEO DE USUARIO SAFI
        </h1>

        {/* Botones */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={loadData}
            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-md hover:bg-blue-700 transition duration-300"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'CÓDIGO OTP'}
          </button>
          <button
            className="bg-lime-500 text-white font-bold py-3 px-6 rounded-full shadow-md hover:bg-lime-600 transition duration-300"
            onClick={() => alert('Desbloqueo en construcción')}
          >
            DESBLOQUEO USUARIO SAFI
          </button>
        </div>

        {/* Texto explicativo */}
        <p className="text-center text-gray-700 mb-4">
          En esta pantalla puedes visualizar los códigos generados en los últimos 10 minutos
        </p>

        {/* Tabla + usuarios activos */}
        <div className="overflow-x-auto">
          <DataTable users={data} loading={loading} />
          <ActiveUsers />
        </div>
      </div>
    </main>
  );
}

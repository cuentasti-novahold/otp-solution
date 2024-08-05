"use client"

import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable';
import { fetchUsers } from '@/api/service';


interface OTP {
  fecha: string;
  telefonocelular: string;
  codigootp: string;
  origenoperacion: string
  estatus: string;
  tiempoexpiracion: string;
}

export default function Home() {

  const [data, setData] = useState<OTP[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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
    <main className="w-full bg-white">

      <div className="p-5">
        <h1 className="text-3xl font-bold mb-4 text-black">Consulta OTP del Usuario</h1>
        <button
          onClick={loadData}
          className="mb-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Actualizar'}
        </button>
        <div className="overflow-x-auto">
          <DataTable data={data} />
        </div>
      </div>

    </main>
  );
}

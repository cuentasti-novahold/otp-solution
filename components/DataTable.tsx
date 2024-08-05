import React from 'react';

interface User {
  fecha: string;
  telefonocelular: string;
  codigootp: string;
  origenoperacion: string
  estatus: string;
  tiempoexpiracion: string;
}

interface DataTableProps {
  data: User[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  return (
    <table className="min-w-full bg-white border border-gray-200">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b">Fecha</th>
          <th className="py-2 px-4 border-b">N° Celular</th>
          <th className="py-2 px-4 border-b">OTP</th>
          <th className="py-2 px-4 border-b">Origen</th>
          <th className="py-2 px-4 border-b">Estado</th>
          <th className="py-2 px-4 border-b">Expiración</th>
        </tr>
      </thead>
      <tbody>
        {data.map((user) => (
          <tr key={user.telefonocelular}>
            <td className="py-2 px-4 border-b">{user.fecha}</td>
            <td className="py-2 px-4 border-b">{user.telefonocelular}</td>
            <td className="py-2 px-4 border-b">{user.codigootp}</td>
            <td className="py-2 px-4 border-b">{user.origenoperacion}</td>
            <td className="py-2 px-4 border-b">{user.estatus}</td>
            <td className="py-2 px-4 border-b">{user.tiempoexpiracion}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;

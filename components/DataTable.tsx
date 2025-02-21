// components/UserTable.tsx
import { fetchUsers, User } from '@/api/service';
import React, { useEffect, useState } from 'react';

const formatDate = (isoString:string) => {
  const date = new Date(isoString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses son 0-11
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};


interface UserTableProps {
  users: User[];
  loading: boolean;
}

const UserTable: React.FC<UserTableProps> = ({ users, loading }) => {
  return (
    <div className="overflow-x-auto">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Fecha</th>
              <th className="py-2 px-4 border-b">Teléfono Celular</th>
              <th className="py-2 px-4 border-b">Código OTP</th>
              <th className="py-2 px-4 border-b">Origen Operación</th>
              <th className="py-2 px-4 border-b">Estatus</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={`${user.codigoOtp}-${index}`}>
                <td className="py-2 px-4 border-b">{user.fecha}</td>
                <td className="py-2 px-4 border-b">{user.telefonoCelular}</td>
                <td className="py-2 px-4 border-b">{user.codigoOtp}</td>
                <td className="py-2 px-4 border-b">{user.origenOperacion}</td>
                <td className="py-2 px-4 border-b">{user.estatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserTable;

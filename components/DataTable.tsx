// components/UserTable.tsx
import { fetchUsers, User } from '@/app/api/service';
import React, { useEffect, useState } from 'react';

const formatDate = (isoString: string) => {
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
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Teléfono Celular</th>
                <th>Código OTP</th>
                <th>Origen Operación</th>
                <th>Estatus</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={`${user.codigoOtp}-${index}`}>
                  <td data-label="Fecha">
                    {new Date(user.fecha).toLocaleString('es-CO', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                  </td>
                  <td data-label="Teléfono Celular">{user.telefonoCelular}</td>
                  <td data-label="Código OTP">{user.codigoOtp}</td>
                  <td data-label="Origen Operación">{user.origenOperacion}</td>
                  <td data-label="Estatus">{user.estatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


      )}
    </div>
  );
};

export default UserTable;

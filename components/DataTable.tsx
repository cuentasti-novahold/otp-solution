// components/UserTable.tsx
import { fetchUsers, User } from '@/app/api/service';
import React, { useEffect, useState } from 'react';

function formatearFechaPlano(fechaStr: any) {
  // Reemplazamos la T por espacio si existe
  const limpio = fechaStr.replace("T", " ").split(".")[0]; // quita milisegundos si hay
  const [fecha, hora] = limpio.split(" ");
  const [anio, mes, dia] = fecha.split("-");
  const [hh, mm] = hora.split(":");

  return `${dia}/${mes}/${anio} ${hh}:${mm}`;
}


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
                    {formatearFechaPlano(user.fecha)}
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

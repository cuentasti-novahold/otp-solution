'use client';
import { toggleUserStatus } from '@/app/api/service';
import React, { useState, useEffect } from 'react';

interface AdminUser {
    id: number;
    nombre: string;
    estado: string;
    fechaModificacion: string;
}

const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
        date.getDate()
    ).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(
        date.getMinutes()
    ).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
};

const dummyAdminUsers: AdminUser[] = [
    { id: 1, nombre: 'Juan Pérez', estado: 'ACTIVO', fechaModificacion: '2024-06-01 10:00:00' },
    { id: 2, nombre: 'Ana Gómez', estado: 'BLOQUEADO', fechaModificacion: '2024-06-02 15:30:00' },
];

const ActiveUsers: React.FC = () => {
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

    useEffect(() => {
        // Reemplazar por fetch real más adelante
        setAdminUsers(dummyAdminUsers);
    }, []);

    const toggleEstado = async (userId: number) => {
        const user = adminUsers.find(u => u.id === userId);
        if (!user) return;

        const nuevoEstado = user.estado === 'ACTIVO' ? 'BLOQUEADO' : 'ACTIVO';

        try {
            await toggleUserStatus(userId, user.estado); // Llama el endpoint de Next.js

            // Actualiza localmente
            const updatedUsers = adminUsers.map(u =>
                u.id === userId
                    ? { ...u, estado: nuevoEstado, fechaModificacion: formatDate(new Date().toISOString()) }
                    : u
            );
            setAdminUsers(updatedUsers);
        } catch (error) {
            console.error('Error al cambiar estado del usuario:', error);
        }
    };

    return (
        <div className="overflow-x-auto">
            <h2 className="text-xl font-semibold mb-2">Administrador de Usuarios</h2>
            <table className="min-w-full bg-white border border-gray-200">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">ID</th>
                        <th className="py-2 px-4 border-b">Nombre</th>
                        <th className="py-2 px-4 border-b">Estado</th>
                        <th className="py-2 px-4 border-b">Última Modificación</th>
                        <th className="py-2 px-4 border-b">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {adminUsers.map((user) => (
                        <tr key={user.id}>
                            <td className="py-2 px-4 border-b">{user.id}</td>
                            <td className="py-2 px-4 border-b">{user.nombre}</td>
                            <td className="py-2 px-4 border-b">{user.estado}</td>
                            <td className="py-2 px-4 border-b">{user.fechaModificacion}</td>
                            <td className="py-2 px-4 border-b">
                                <button
                                    className="px-3 py-1 rounded text-white"
                                    style={{
                                        backgroundColor: user.estado === 'ACTIVO' ? '#ef4444' : '#16a34a',
                                        color: '#fff',
                                        opacity: 1,
                                        border: 'none',
                                    }}
                                    onClick={() => toggleEstado(user.id)}
                                >
                                    {user.estado === 'ACTIVO' ? 'Bloquear' : 'Desbloquear'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ActiveUsers;

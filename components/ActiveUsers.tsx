'use client';
import React, { useState } from 'react';
import { toggleUserStatus } from '@/app/api/service';

const ActiveUsers: React.FC = () => {
    const [username, setUsername] = useState('');
    const [unlocked, setUnlocked] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleUnlock = async () => {
        if (!username) return;

        try {
            setLoading(true);
            // Simula la lógica de desbloqueo (puedes llamar tu API real aquí)
            await toggleUserStatus(username); // Aquí debes usar tu backend real
            setUnlocked(true);
        } catch (error) {
            console.error('Error al desbloquear usuario:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4 mt-10">
            <label className="text-gray-700 text-lg font-medium">
                Ingrese el usuario de acceso a SAFI
            </label>

            <input
                type="text"
                placeholder="Ej: FCYHOYOS"
                value={username}
                onChange={(e) => setUsername(e.target.value.toUpperCase())}
                className="input-bordered"
            />


            <button
                onClick={handleUnlock}
                disabled={loading || !username}
            >
                {loading ? 'Desbloqueando...' : 'DESBLOQUEAR'}
            </button>

            {unlocked && (
                <div className="mt-6 px-4 py-3 border border-gray-400 text-gray-800 rounded shadow-md bg-gray-100">
                    Su usuario ha sido desbloqueado
                </div>
            )}
        </div>
    );
};

export default ActiveUsers;

'use client';
import React, { useState, useEffect } from 'react';
import { toggleUserStatus } from '@/app/api/service';

const ActiveUsers: React.FC = () => {
    const [username, setUsername] = useState('');
    const [unlocked, setUnlocked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [userValid, setUserValid] = useState(false);
    const [estadoUsuario, setEstadoUsuario] = useState<'ACTIVO' | 'BLOQUEADO' | null>(null);

    // Verifica si el usuario existe y obtiene su estado
    useEffect(() => {
        const checkUser = async () => {
            const trimmed = username.trim().toUpperCase();
            if (!trimmed) {
                setUserValid(false);
                setEstadoUsuario(null);
                return;
            }

            setChecking(true);
            try {
                const res = await fetch('/api/users/check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario: trimmed }),
                });

                const data = await res.json();
                setUserValid(data.exists);
                setEstadoUsuario(data.estado || null);
            } catch (error) {
                console.error('Error verificando usuario:', error);
                setUserValid(false);
                setEstadoUsuario(null);
            } finally {
                setChecking(false);
            }
        };

        const delay = setTimeout(checkUser, 500); // debounce
        return () => clearTimeout(delay);
    }, [username]);

    const handleToggle = async () => {
        if (!userValid || !estadoUsuario) return;

        try {
            setLoading(true);
            await toggleUserStatus(username, estadoUsuario); // Aquí se espera que backend cambie el estado
            setUnlocked(true);

            // Simula el cambio de estado local
            setEstadoUsuario(estadoUsuario === 'ACTIVO' ? 'BLOQUEADO' : 'ACTIVO');
        } catch (error) {
            console.error('Error al cambiar estado del usuario:', error);
        } finally {
            setLoading(false);
        }
    };

    const label = estadoUsuario === 'ACTIVO' ? 'BLOQUEAR' : 'DESBLOQUEAR';

    return (
        <div className="flex flex-col items-center justify-center gap-4 mt-10">
            <label className="text-gray-700 text-lg font-medium">
                Ingrese el usuario de acceso a SAFI
            </label>

            <input
                type="text"
                placeholder="Ej: FCYHOYOS"
                value={username}
                onChange={(e) => {
                    setUsername(e.target.value.toUpperCase());
                    setUnlocked(false);
                }}
                className="input-bordered "
            />

            {!checking && username && !userValid && (
                <p className="text-red-500 text-sm">⚠️ Usuario no encontrado</p>
            )}

            <button
                onClick={handleToggle}
                disabled={loading || !userValid || !estadoUsuario}
                className={`px-6 py-2 rounded-full font-semibold shadow-md transition duration-300 ${userValid
                    ? estadoUsuario === 'ACTIVO'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-400 text-white cursor-not-allowed'
                    }`}
            >
                {loading ? `${label}...` : label}
            </button>

            {unlocked && (
                <div className="mt-6 px-4 py-3 border border-gray-400 text-gray-800 rounded shadow-md bg-gray-100">
                    ✅ El estado del usuario fue actualizado correctamente.
                </div>
            )}
        </div>
    );
};

export default ActiveUsers;

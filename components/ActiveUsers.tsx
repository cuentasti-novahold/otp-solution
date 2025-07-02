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

                // 🎯 Aquí traducimos la letra a nombre de estado
                const estado =
                    data.estatus === 'A' ? 'ACTIVO' :
                        data.estatus === 'B' ? 'BLOQUEADO' :
                            null;

                setEstadoUsuario(estado);
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


        try {
            setLoading(true);
            await toggleUserStatus(username, estadoUsuario);
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
                style={{
                    padding: '0.5rem 1.5rem',
                    borderRadius: '9999px',
                    fontWeight: '600',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    transition: 'background-color 0.3s',
                    backgroundColor: !userValid
                        ? '#9CA3AF' // gray-400
                        : estadoUsuario === 'ACTIVO'
                            ? '#DC2626' // red-600
                            : '#16A34A', // green-600
                    color: 'white',
                    cursor: !userValid ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                    if (!userValid) return;
                    e.currentTarget.style.backgroundColor =
                        estadoUsuario === 'ACTIVO' ? '#B91C1C' : '#15803D'; // hover colors
                }}
                onMouseLeave={(e) => {
                    if (!userValid) return;
                    e.currentTarget.style.backgroundColor =
                        estadoUsuario === 'ACTIVO' ? '#DC2626' : '#16A34A'; // normal colors
                }}
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

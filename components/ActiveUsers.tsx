'use client';
import React, { useState, useEffect } from 'react';
import { toggleUserStatus } from '@/app/api/service';

const ActiveUsers: React.FC = () => {
    const [username, setUsername] = useState('');
    const [unlocked, setUnlocked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [userValid, setUserValid] = useState(false);
    const [estadoUsuario, setEstadoUsuario] = useState<string | null>(null);

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

                // 🎯 Mapear todos los posibles estados
                let estadoDesc = null;
                switch (data.estatus) {
                    case 'A': estadoDesc = 'ACTIVO'; break;
                    case 'B': estadoDesc = 'BLOQUEADO'; break;
                    case 'I': estadoDesc = 'INACTIVO'; break;
                    case 'C': estadoDesc = 'CANCELADO'; break;
                    default: estadoDesc = `ESTADO DESCONOCIDO (${data.estatus})`;
                }

                setEstadoUsuario(estadoDesc);
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
        if (estadoUsuario !== 'BLOQUEADO') return;

        try {
            setLoading(true);

            const res = await fetch('/api/users/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario: username })
            });

            const data = await res.json();
            if (!data.exists || data.estatus !== 'B') {
                throw new Error('Solo se puede desbloquear usuarios bloqueados.');
            }

            await toggleUserStatus(username, 'B');

            setUnlocked(true);
            setEstadoUsuario('ACTIVO');
        } catch (error) {
            console.error('Error al intentar desbloquear usuario:', error);
        } finally {
            setLoading(false);
        }
    };

    const label = estadoUsuario === 'BLOQUEADO' ? 'DESBLOQUEAR' : 'SIN ACCIÓN';
    const botonHabilitado = userValid && estadoUsuario === 'BLOQUEADO';

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
                className="input-bordered"
            />

            {!checking && username && !userValid && (
                <p className="text-red-500 text-sm">⚠️ Usuario no encontrado</p>
            )}

            {userValid && estadoUsuario && (
                <p className="text-blue-600 text-sm font-semibold">
                    Estado actual del usuario: {estadoUsuario}
                </p>
            )}

            <button
                onClick={handleToggle}
                disabled={!botonHabilitado}
                className={`button-toggle ${!botonHabilitado ? 'button-disabled' : 'button-blocked'}`}
            >
                {loading ? `${label}...` : label}
            </button>

            {unlocked && (
                <div className="mt-6 px-4 py-3 border border-gray-400 text-gray-800 rounded shadow-md bg-gray-100">
                    ✅ El usuario fue desbloqueado correctamente.
                </div>
            )}
        </div>
    );
};

export default ActiveUsers;

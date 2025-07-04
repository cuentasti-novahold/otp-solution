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
        <div className="container-column-center">
            <label className="label-text">
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
                className="input-box"
            />

            {!checking && username && !userValid && (
                <p className="label-text">⚠️ Usuario no encontrado</p>
            )}

            {userValid && estadoUsuario && (
                <p className="estado-usuario">
                    Estado actual del usuario: {estadoUsuario}
                </p>
            )}

            <button
                onClick={handleToggle}
                disabled={!botonHabilitado}
                className={`boton-toggle ${botonHabilitado ? 'boton-toggle-habilitado' : 'boton-toggle-deshabilitado'}`}

                onMouseEnter={(e) => {
                    if (!botonHabilitado) return;
                    e.currentTarget.style.backgroundColor = '#15803D'; // hover green
                }}
                onMouseLeave={(e) => {
                    if (!botonHabilitado) return;
                    e.currentTarget.style.backgroundColor = '#16A34A'; // normal green
                }}
            >
                {loading ? `${label}...` : label}
            </button>

            {unlocked && (
                <div className="mensaje-confirmacion">
                    ✅ El usuario fue desbloqueado correctamente.
                </div>
            )}
        </div>
    );
};

export default ActiveUsers;

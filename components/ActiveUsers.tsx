'use client';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { checkUser, toggleUserStatusByCountry, toggleUserStatus, checkUserByCountry } from '@/app/api/service';


const ActiveUsers: React.FC = () => {
    const pathname = usePathname();
    const segment = pathname.split('/')[1]; // '' | 'arnova' | 'solvia'

    const isCountryRoute = segment === 'arnova' || segment === 'solvia';
    const pais = isCountryRoute ? (segment as 'arnova' | 'solvia') : null;

    const [username, setUsername] = useState('');
    const [unlocked, setUnlocked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [userValid, setUserValid] = useState(false);
    const [estadoUsuario, setEstadoUsuario] = useState<string | null>(null);

    useEffect(() => {
        const check = async () => {
            const trimmed = username.trim().toUpperCase();
            if (!trimmed) {
                setUserValid(false);
                setEstadoUsuario(null);
                return;
            }

            setChecking(true);
            try {
                // ✅ si hay país → usa la función por país
                const data = pais
                    ? await checkUserByCountry(trimmed, pais)
                    : await checkUser(trimmed);

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

        const delay = setTimeout(check, 500); // debounce
        return () => clearTimeout(delay);
    }, [username, pais]);

    const handleToggle = async () => {
        if (estadoUsuario !== 'BLOQUEADO') return;

        try {
            setLoading(true);

            const data = pais
                ? await checkUserByCountry(username, pais)
                : await checkUser(username);

            if (!data.exists || data.estatus !== 'B') {
                throw new Error('Solo se puede desbloquear usuarios bloqueados.');
            }

            if (pais) {
                await toggleUserStatusByCountry(username, 'B', pais);
            } else {
                await toggleUserStatus(username, 'B');
            }

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
    const isSolvia = pathname.includes("solvia");
    return (
        <div className="container-column-center">
            <label className="label-text">
                Ingrese el usuario de acceso a SAFI {pais ? `(${pais.toUpperCase()})` : ''}
            </label>

            <input
                type="text"
                placeholder={isSolvia ? "Ej: FSJSUAREZ" : "Ej: FCAMONTOYA"}
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
                className={`boton-toggle ${botonHabilitado
                    ? 'boton-toggle-habilitado'
                    : 'boton-toggle-deshabilitado'
                    }`}
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



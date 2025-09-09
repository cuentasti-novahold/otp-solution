// lib/api.ts
export interface User {
  fecha: string;
  telefonoCelular: string;
  codigoOtp: string;
  origenOperacion: string;
  estatus: string;
  tiempoExpiracion: string;
}

export const fetchUsers = async (): Promise<User[]> => {
  const endpointotp = '/api/otp/view';

  try {
    const response = await fetch(endpointotp, {
      cache: 'no-store', // ⛔ Evita cualquier tipo de caché
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!response.ok) {
      throw new Error('Error fetching otps');
    }

    const data: User[] = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};


// ✅ Función agregada para cambiar el estado del usuario (bloqueo/desbloqueo)
// lib/api.ts

export const toggleUserStatus = async (usuario: string, estadoActual: string) => {
  try {
    // Invertir estado: si está activo ('A'), se cambia a bloqueado ('B'), y viceversa
    const nuevoEstado = estadoActual === 'A' ? 'B' : 'A';

    const response = await fetch('/api/users/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ usuario, estado: nuevoEstado }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error || 'Error al cambiar estado del usuario');
    }

    return await response.json(); // opcional si quieres usar el mensaje de éxito
  } catch (error) {
    console.error('Error al bloquear/desbloquear:', error);
    throw error;
  }
};

// 🚀 NUEVA FUNCIÓN → para /arnova y /solvia
export const toggleUserStatusByCountry = async (
  usuario: string,
  estadoActual: string,
  pais: 'arnova' | 'solvia'
) => {
  try {
    const nuevoEstado = estadoActual === 'A' ? 'B' : 'A';

    // endpoint dinámico según país
    const endpoint = `/api/${pais}/users/toggle`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ usuario, estado: nuevoEstado }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData?.error ||
        `Error al cambiar estado del usuario (${pais})`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en toggleUserStatusByCountry (${pais}):`, error);
    throw error;
  }
};


// ✅ Verificar usuario
export const checkUser = async (usuario: string) => {
  try {
    const response = await fetch('/api/users/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario }),
    });

    if (!response.ok) {
      throw new Error('Error al verificar usuario');
    }

    return await response.json(); // { exists: boolean, estatus: string }
  } catch (error) {
    console.error('Error en checkUser:', error);
    throw error;
  }
};


// ✅ Verificar usuario por país
export const checkUserByCountry = async (
  usuario: string,
  pais: 'arnova' | 'solvia'
) => {
  try {
    const endpoint = `/api/${pais}/users/check`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario }),
    });

    if (!response.ok) {
      throw new Error(`Error al verificar usuario (${pais})`);
    }

    return await response.json(); // { exists: boolean, estatus: string }
  } catch (error) {
    console.error(`Error en checkUserByCountry (${pais}):`, error);
    throw error;
  }
};

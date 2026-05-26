// lib/api.ts
export interface User {
  fecha: string;
  telefonoCelular: string;
  codigoOtp: string;
  origenOperacion: string;
  estatus: string;
  tiempoExpiracion: string;
}

// ----------------------
// 🔹 Funciones NORMALES (no llevan país)
// ----------------------

export const fetchUsers = async (): Promise<User[]> => {
  const endpointotp = '/api/otp/view';

  try {
    const response = await fetch(endpointotp, {
      cache: 'no-store',
      headers: { 'ngrok-skip-browser-warning': 'true' },
    });

    if (!response.ok) throw new Error('Error fetching otps');

    return (await response.json()) as User[];
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

export const toggleUserStatus = async (
  usuario: string,
  estadoActual: string
) => {
  try {
    const nuevoEstado = estadoActual === 'A' ? 'B' : 'A';

    const response = await fetch('/api/users/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, estado: nuevoEstado }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || 'Error al cambiar estado del usuario');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en toggleUserStatus:', error);
    throw error;
  }
};

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

// ----------------------
// Funciones CON PAÍS (nuevas, extendidas)
// ----------------------
type CountryService = 'arnova' | 'solvia' | 'guatemala';

export const fetchUsersByCountry = async (
  pais: CountryService
): Promise<User[]> => {

  const endpointotp = `/api/otp/view?pais=${pais}`;

  try {

    const response = await fetch(endpointotp, {
      cache: 'no-store',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching otps (${pais})`);
    }

    return (await response.json()) as User[];

  } catch (error) {

    console.error(`Fetch error (${pais}):`, error);

    throw error;
  }
};

export const toggleUserStatusByCountry = async (
  usuario: string,
  estadoActual: string,
  pais: 'arnova' | 'guatemala' | 'solvia'
) => {

  try {

    const nuevoEstado =
      estadoActual === 'A'
        ? 'B'
        : 'A';

    const response = await fetch(
      '/api/users/toggle',
      {

        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          usuario,
          estado: nuevoEstado,
          pais
        }),
      }
    );

    if (!response.ok) {

      const errorData =
        await response
          .json()
          .catch(() => ({}));

      throw new Error(
        errorData?.error ||
        `Error al cambiar estado del usuario (${pais})`
      );
    }

    return await response.json();

  } catch (error) {

    console.error(
      `Error en toggleUserStatusByCountry (${pais}):`,
      error
    );

    throw error;
  }
};

export const checkUserByCountry = async (
  usuario: string,
  pais: 'arnova' | 'guatemala' | 'solvia'
) => {

  try {

    const response = await fetch('/api/users/check', {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        usuario,
        pais
      }),
    });

    if (!response.ok) {

      throw new Error(
        `Error al verificar usuario (${pais})`
      );
    }

    return await response.json();

  } catch (error) {

    console.error(
      `Error en checkUserByCountry (${pais}):`,
      error
    );

    throw error;
  }
};

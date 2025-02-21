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
  // const endpointotp = 'https://e5e6-167-0-170-94.ngrok-free.app/api/otp/view';
  // const endpointotp = 'https://0a82-167-0-170-94.ngrok-free.app/api/otp/view';
  // const endpointotp = 'https://65cc-167-0-170-94.ngrok-free.app/api/otp/view';
  // const baseUrl = 'https://f0e7-2800-484-9d0a-7000-e9cf-87c7-df70-232a.ngrok-free.app';
  // const baseUrl = 'http://ec2-52-90-88-192.compute-1.amazonaws.com';
  const baseUrl = 'https://otpsafi.bikleek.com';
  const endpointotp = '/api/otp/view';
  console.error(baseUrl);
  try {
    const response = await fetch(baseUrl+endpointotp, {
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

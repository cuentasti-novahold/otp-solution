// lib/api.ts
export interface User {
  fecha: string;
  telefonocelular: string;
  codigootp: string;
  origenoperacion: string
  estatus: string;
  tiempoexpiracion: string;
}
  
  export const fetchUsers = async (): Promise<User[]> => {
    const response = await fetch('https://e698-167-0-170-94.ngrok-free.app/api/otp/view');
    if (!response.ok) {
      throw new Error('Error fetching users');
    }
    const data: User[] = await response.json();
    return data;
  };
  
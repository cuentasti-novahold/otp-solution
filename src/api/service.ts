// lib/api.ts
export interface User {
    id: number;
    name: string;
    email: string;
  }
  
  export const fetchUsers = async (): Promise<User[]> => {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    if (!response.ok) {
      throw new Error('Error fetching users');
    }
    const data: User[] = await response.json();
    return data;
  };
  
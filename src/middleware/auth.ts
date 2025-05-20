interface JwtPayload {
  exp: number;
  [key: string]: any;
}

export function isAuthenticated(): boolean {
  // Ejecutar solo en el cliente
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  
  try {
    // Verificar que el token no esté expirado
    const payload = JSON.parse(atob(token.split('.')[1])) as JwtPayload;
    const expiry = payload.exp * 1000; // Convertir a milisegundos
    
    if (Date.now() >= expiry) {
      // Token expirado, limpiamos localStorage
      localStorage.removeItem('authToken');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error al verificar el token:', error);
    localStorage.removeItem('authToken');
    return false;
  }
}

// Función para obtener el token para peticiones a la API
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

// Función para cerrar sesión
export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
  window.location.href = '/auth';
}
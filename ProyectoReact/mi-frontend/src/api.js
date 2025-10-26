import axios from 'axios';

const GATEWAY_URL = 'http://localhost:8080'; // URL base del Gateway

const api = axios.create({
  baseURL: GATEWAY_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    const isPublicPath = config.url.includes('/public/');
    const isAuthPath = config.url.includes('/auth/');

    if (token && !isPublicPath && !isAuthPath) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("[API Interceptor] Error en config:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[API Interceptor] Error en respuesta:", error.response || error.message);
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn(`[API Interceptor] Error ${error.response.status} detectado para ${error.config.url}. El componente debería manejar el logout.`);
      // Considera disparar un evento global aquí si necesitas deslogueo automático centralizado
      // window.dispatchEvent(new CustomEvent('auth-error'));
    }
    return Promise.reject(error);
  }
);

export default api;
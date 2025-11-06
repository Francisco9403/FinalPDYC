import React, { useState } from 'react';
import api from '../api';

function LoginPage({ onLoginSuccess, onViewRegister, onGoBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault(); setError(null); setLoading(true);
    try {
      const LOGIN_ENDPOINT = '/api/auth/login';
      const loginPayload = { email, password };
      const response = await api.post(LOGIN_ENDPOINT, loginPayload);
      const token = response.data.token;
      if (token) {
        onLoginSuccess(token);
      } else {
        setError('Respuesta inesperada del servidor.');
      }
    } catch (err) {
      console.error("Error de login:", err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Credenciales incorrectas o error.');
    } finally { setLoading(false); }
  };

  return (
    <div className="form-container page-container">    
      <button onClick={onGoBack} className="link-button" disabled={loading}> 
        Volver
      </button>

      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleLogin}>
        <div><input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field"/></div>
        <div><input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field"/></div>
        <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        {error && <p className="error">{error}</p>}
      </form>

      <button onClick={onViewRegister} className="link-button" disabled={loading}>
        ¿No tienes cuenta? Regístrate
      </button>

    </div>
  );
}
export default LoginPage;

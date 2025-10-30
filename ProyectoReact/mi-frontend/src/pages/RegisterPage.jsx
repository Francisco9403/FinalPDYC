import React, { useState } from 'react';
import api from '../api';

function RegisterPage({ onViewLogin }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault(); setError(null); setSuccess(null); setLoading(true);
    try {
      const REGISTER_ENDPOINT = '/api/public/registrarUsuario';
      if (password.length < 8) { setError('Contraseña mínima 8 caracteres.'); setLoading(false); return; }
      const registerPayload = { nombre, email, password };
      const response = await api.post(REGISTER_ENDPOINT, registerPayload);
      setSuccess(response.data.message || "¡Registro exitoso! Ahora puedes iniciar sesión.");
      setNombre(''); setEmail(''); setPassword('');
    } catch (err) {
      console.error("Error de registro:", err);
      if (err.response?.data?.error?.includes("Nombre en uso")) { setError("Nombre de usuario en uso."); }
      else if (err.response?.data?.error?.includes("Email en uso")) { setError("Email ya registrado."); }
      else { setError(err.response?.data?.error || 'Error al registrarse.'); }
    } finally { setLoading(false); }
  };

  return (
    <div className="form-container page-container">
      <h2>Registrarse</h2>
      <form onSubmit={handleRegister}>
        <div><input type="text" placeholder="Nombre (3-30 car.)" value={nombre} onChange={(e) => setNombre(e.target.value)} required minLength="3" maxLength="30" className="input-field"/></div>
        <div><input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field"/></div>
        <div><input type="password" placeholder="Contraseña (mín. 8 car.)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="8" className="input-field"/></div>
        <button type="submit" disabled={loading}>{loading ? 'Creando...' : 'Crear Cuenta'}</button>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </form>
      <button onClick={onViewLogin} className="link-button" disabled={loading}>
        ¿Ya tienes cuenta? Inicia sesión
      </button>
    </div>
  );
}
export default RegisterPage;
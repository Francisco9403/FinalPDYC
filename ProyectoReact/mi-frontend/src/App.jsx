// Ruta: src/App.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext'; // Usa el hook de autenticación

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ArtistListPage from './pages/ArtistListPage';
import EventDetailsPage from './pages/EventDetailsPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import ArtistEditPage from './pages/ArtistEditPage';
import EventEditPage from './pages/EventEditPage';

import './App.css';

function App() {
  // Obtiene token, user (con roles) y funciones del contexto
  const { token, user, login, logout } = useAuth();
  // Estado para la vista actual y el ID (para detalles/edición)
  // Inicia en 'dashboard' si hay token, si no en 'home'
  const [currentView, setCurrentView] = useState(() => token ? 'dashboard' : 'home');
  const [currentId, setCurrentId] = useState(null);

  // Efecto para sincronizar estado con localStorage (si cambia externamente)
  // y asegurar la vista correcta al cargar o si el token desaparece.
  useEffect(() => {
      const handleStorageChange = () => {
          const storedToken = localStorage.getItem('jwtToken');
          if (!storedToken && token) { // Se borró el token externamente
              console.warn("[App] Token desaparecido de localStorage, forzando logout.");
              logout();
          } else if (storedToken && !token) { // Se añadió token externamente
               console.warn("[App] Token aparecido en localStorage, sincronizando.");
               login(storedToken);
          }
      };
       // Define la vista inicial basada en el token actual del estado
       // Evita cambiar la vista si ya está en una pública permitida sin token
       if (token && currentView !== 'dashboard' && currentView !== 'admin' && currentView !== 'editArtist' && currentView !== 'editEvent' && currentView !== 'artists' && currentView !== 'eventDetails') {
            setCurrentView('dashboard');
       } else if (!token && currentView !== 'home' && currentView !== 'login' && currentView !== 'register' && currentView !== 'artists' && currentView !== 'eventDetails'){
            setCurrentView('home');
       }


      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, login, logout]); // Depende del estado del token y las funciones


  // Función de login (llama al contexto y navega al dashboard)
  const handleLoginSuccess = useCallback((newToken) => {
    console.log("[App] handleLoginSuccess llamado.");
    login(newToken);
    setCurrentView('dashboard'); // Navega explícitamente al dashboard
    setCurrentId(null);
  }, [login]); // Depende de la función login del contexto (estable)

  // Función de logout (llama al contexto y navega a home)
  const handleLogout = useCallback(() => {
    console.log("[App] handleLogout llamado.");
    logout();
    setCurrentView('home'); // Navega explícitamente a home
    setCurrentId(null);
  }, [logout]); // Depende de la función logout del contexto (estable)

  // Función de navegación (memoizada)
  const navigate = useCallback((view, id = null) => {
    console.log(`[App] Navegando a: ${view} ${id ? `(ID: ${id})` : ''}`);
    const isAdmin = user?.roles?.includes('ROLE_ADMIN') ?? false;

    let targetView = view;
    let targetId = id;

    // --- Lógica de Redirección ---
    if (token && (targetView === 'login' || targetView === 'register')) {
      console.log("Redirigiendo login/register a dashboard (logueado)");
      targetView = 'dashboard'; targetId = null;
    }
    else if (!token && ['dashboard', 'admin', 'editArtist', 'editEvent'].includes(targetView)) {
       console.log("Redirigiendo vista protegida a login (no logueado)");
       targetView = 'login'; targetId = null;
    }
    else if (token && ['admin', 'editArtist', 'editEvent'].includes(targetView) && !isAdmin) {
        console.warn("Acceso no autorizado a ruta admin."); alert("Acceso denegado.");
        targetView = 'dashboard'; targetId = null;
    }

    setCurrentView(targetView);
    setCurrentId(targetId);

  }, [token, user]); // Depende de token y user (que viene del contexto)

  // Función para requerir login (memoizada)
  const requireLogin = useCallback(() => {
      alert("Necesitas iniciar sesión para realizar esta acción.");
      navigate('login');
  }, [navigate]); // Depende de navigate (estable)

  // --- Renderizado principal ---
  console.log(`[App] Renderizando. Vista: ${currentView}, Token: ${token ? 'Sí' : 'No'}, ID: ${currentId}`);

  let content;
  if (!token) {
    // Vistas públicas
    switch (currentView) {
case 'login': 
        content = <LoginPage 
          onLoginSuccess={handleLoginSuccess} 
          onViewRegister={() => navigate('register')} 
          onGoBack={() => navigate('home')} 
        />; 
        break;
      case 'register': 
        content = <RegisterPage 
          onViewLogin={() => navigate('login')} 
          onGoBack={() => navigate('home')} 
        />; 
        break;
      case 'artists': content = <ArtistListPage onNavigate={navigate} onRequireLogin={requireLogin} />; break; 
      case 'eventDetails': content = <EventDetailsPage eventId={currentId} onBack={() => navigate('home')} onRequireLogin={requireLogin} />; break; 
      case 'home': default: content = <HomePage onNavigate={navigate} />; break; 
    }
  } else {
    // Vistas privadas (usuario logueado)
    const isAdmin = user?.roles?.includes('ROLE_ADMIN') ?? false;
    switch (currentView) {
       case 'dashboard':
         content = <DashboardPage onNavigate={navigate} />; // Obtiene user/logout de useAuth()
         break;
       case 'admin':
         content = isAdmin ? <AdminPage onNavigate={navigate} /> : <DashboardPage onNavigate={navigate} />; // Fallback a Dashboard si no es admin
         break;
       case 'editArtist':
         content = isAdmin && currentId ? <ArtistEditPage artistId={currentId} onNavigate={navigate} /> : <DashboardPage onNavigate={navigate} />; // Fallback
         break;
       case 'editEvent':
         content = isAdmin && currentId ? <EventEditPage eventId={currentId} onNavigate={navigate} /> : <DashboardPage onNavigate={navigate} />; // Fallback
         break;
       case 'artists':
         // Pasamos token/logout porque ArtistList SÍ tiene acciones protegidas (Seguir)
         content = <ArtistListPage token={token} onNavigate={navigate} onRequireLogin={requireLogin} />;
         break;
       case 'eventDetails':
         // Pasamos token/logout porque EventDetails SÍ tiene acciones protegidas (Favorito)
         content = <EventDetailsPage eventId={currentId} token={token} onBack={() => navigate('dashboard')} onRequireLogin={requireLogin} />;
         break;
       case 'home': // Permitir ir a home público aunque esté logueado
         content = <HomePage onNavigate={navigate} onRequireLogin={requireLogin} />;
         break;
       // Si intenta ir a login/register o vista desconocida -> Dashboard
       case 'login': case 'register': default:
         console.warn(`[App] Vista ${currentView} no permitida/desconocida para usuario logueado. Mostrando Dashboard.`);
         content = <DashboardPage onNavigate={navigate} />;
         break;
    }
  }

  return (
    <div className="AppContainer">
      {content}
    </div>
  );
}

export default App;
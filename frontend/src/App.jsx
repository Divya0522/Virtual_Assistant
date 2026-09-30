import { Route, Routes, Navigate } from 'react-router-dom';
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Customize from './pages/Customize';
import { useContext } from 'react';
import { userDataContext } from './context/UserContext';
import Assistant from './pages/Assistant';
import Customize2 from './pages/Customize2';
import History from './pages/History';

const App = () => {
  const { userData, isAuthLoading } = useContext(userDataContext);

  if (isAuthLoading) {
    return (
      <div className="w-full h-screen bg-[#F7F5F0] flex flex-col justify-center items-center gap-3 text-[#252525] select-none">
        <div className="w-8 h-8 border-2 border-[#C96F5A] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#6B6862] text-xs tracking-wider uppercase font-medium">Initializing Assistant...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Direct landing on Assistant conversational workspace */}
      <Route
        path="/"
        element={
          !userData ? (
            <Navigate to="/signin" replace />
          ) : userData.assistantImage && userData.assistantName ? (
            <Assistant />
          ) : (
            <Navigate to="/customize" replace />
          )
        }
      />

      <Route
        path="/assistant"
        element={
          !userData ? (
            <Navigate to="/signin" replace />
          ) : userData.assistantImage && userData.assistantName ? (
            <Assistant />
          ) : (
            <Navigate to="/customize" replace />
          )
        }
      />

      <Route
        path="/signup"
        element={!userData ? <SignUp /> : <Navigate to="/" replace />}
      />

      <Route
        path="/signin"
        element={!userData ? <SignIn /> : <Navigate to="/" replace />}
      />

      <Route
        path="/customize"
        element={userData ? <Customize /> : <Navigate to="/signin" replace />}
      />

      <Route
        path="/customize2"
        element={userData ? <Customize2 /> : <Navigate to="/signin" replace />}
      />

      <Route
        path="/history"
        element={userData ? <History /> : <Navigate to="/signin" replace />}
      />

      <Route
        path="*"
        element={<Navigate to={userData ? "/" : "/signin"} replace />}
      />
    </Routes>
  );
};

export default App;
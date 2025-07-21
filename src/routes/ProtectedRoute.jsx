// src/routes/ProtectedRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

export default function ProtectedRoute({ children }) {
  const { carregando, usuario } = useContext(UserContext);

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Carregando...
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  return children;
}
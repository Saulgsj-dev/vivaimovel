// src/routes/AppRouter.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Perfil from "../pages/Perfil";
import CadastrarImovel from "../pages/CadastrarImovel";
import ComprarCreditos from "../pages/ComprarCreditos";
import Layout from "../components/Layout";
import Termos from "../pages/Termos";
import Privacidade from "../pages/Privacidade";
import Sucesso from "../pages/Sucesso";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />

          {/* Rotas protegidas */}
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cadastrar-imovel"
            element={
              <ProtectedRoute>
                <CadastrarImovel />
              </ProtectedRoute>
            }
          />

          <Route
            path="/comprar-creditos"
            element={
              <ProtectedRoute>
                <ComprarCreditos />
              </ProtectedRoute>
            }
          />

          <Route path="/sucesso" element={<Sucesso />} />
          <Route path="/termos" element={<Termos />} />
          <Route path="/privacidade" element={<Privacidade />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
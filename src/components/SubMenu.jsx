// src/components/SubMenu.jsx
import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";

export default function SubMenu() {
  const { usuario } = useContext(UserContext);

  if (!usuario) return null;

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm py-2 px-4 sm:px-6 fixed top-[70px] sm:top-[64px] w-full z-40">
      <div className="flex gap-4 justify-center sm:justify-end text-sm text-gray-800">
        <Link to="/cadastrar-imovel" className="hover:text-green-700">
          Cadastrar Imóvel
        </Link>
        <Link to="/comprar-creditos" className="hover:text-green-700">
          Comprar Créditos
        </Link>
        <Link to="/perfil" className="hover:text-green-700">
          Perfil
        </Link>
      </div>
    </div>
  );
}

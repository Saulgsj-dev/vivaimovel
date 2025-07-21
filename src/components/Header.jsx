import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import ModalLogin from "./ModalLogin";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import logo from "../assets/logo.png";

export default function Header() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const { usuario } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const primeiroNome = usuario?.nome?.split(" ")[0] || "";

  return (
    <>
      <header className="w-full fixed top-0 left-0 z-50 bg-black shadow px-4 sm:px-6 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative">

          {/* TOPO: logo + nome/sair ou login (mobile) */}
          <div className="w-full sm:w-auto">
            {/* Mobile: logo + nome/sair ou login lado a lado */}
            <div className="flex justify-between items-center sm:hidden">
              {/* Logo */}
              <Link to="/" className="shrink-0">
                <img
                  src={logo}
                  alt="Tafin"
                  className="h-16 object-contain"
                />
              </Link>

              {/* Mobile: nome + sair OU botão de login */}
              <div className="flex items-center gap-2 text-sm text-white">
                {usuario ? (
                  <>
                    <span>{primeiroNome}</span>
                    <button
                      onClick={handleLogout}
                      className="text-red-400 hover:underline"
                    >
                      Sair
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setMostrarModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                  >
                    Entre ou Cadastre-se
                  </button>
                )}
              </div>
            </div>

            {/* Desktop: só o logo */}
            <div className="hidden sm:block">
              <Link to="/" className="shrink-0">
                <img
                  src={logo}
                  alt="Tafin"
                  className="h-16 sm:h-16 object-contain"
                />
              </Link>
            </div>
          </div>

          {/* Frase central (desktop e mobile) */}
          <div className="text-1xl text-center text-white md:text-3xl font-extrabold mb-2">
  Venda seu imóvel até <span className="text-yellow-400">3x mais rápido</span> com a vitrine certa!
</div>

          {/* Desktop: nome + sair ou botão login */}
          <div className="hidden sm:flex text-white text-sm items-center gap-4 justify-end">
            {usuario ? (
              <>
                <span>{primeiroNome}</span>
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:underline"
                >
                  Sair
                </button>
              </>
            ) : (
              <button
                onClick={() => setMostrarModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded"
              >
                Entre ou Cadastre-se
              </button>
            )}
          </div>
        </div>
      </header>

      {mostrarModal && <ModalLogin fechar={() => setMostrarModal(false)} />}
    </>
  );
}

// src/components/Footer.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import ModalTermos from "./ModalTermos";

const Footer = () => {
  const [mostrarTermos, setMostrarTermos] = useState(false);

  return (
    <footer className="w-full bg-black text-gray-400 text-sm mt-12 border-t border-green-600 shadow-inner">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs md:text-sm">
          © 2025 Viva Imovel. Todos os direitos reservados.
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm">
          {/* Botão para abrir os termos */}
          <button
            type="button"
            onClick={() => setMostrarTermos(true)}
            className="hover:text-green-400 transition-colors duration-200"
          >
            Termos de Uso
          </button>

          <a
            href="https://github.com/Saulgsj-dev "
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-400 transition-colors duration-200"
          >
            GitHub
          </a>
        </div>
      </div>

      {/* Modal de Termos */}
      {mostrarTermos && <ModalTermos fechar={() => setMostrarTermos(false)} />}
    </footer>
  );
};

export default Footer;
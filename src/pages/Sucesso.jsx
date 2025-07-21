import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Footer from "../components/Footer";
// import { UserContext } from "../contexts/UserContext"; // Pode remover

export default function Sucesso() {
  const location = useLocation();
  const [creditos, setCreditos] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qtd = params.get("qtd");
    if (qtd) setCreditos(qtd);
  }, [location]);

  return (
    <div className="w-full pt-36 px-4 sm:px-6 text-center">
      <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md">
        <h1 className="text-3xl font-bold mb-4 text-green-700">Pagamento Aprovado!</h1>
        <p className="text-gray-700 text-lg mb-6">
          Obrigado por sua compra. Seus créditos foram adicionados com sucesso!
        </p>
        {creditos && (
          <p className="text-green-700 text-xl font-semibold mb-6">
            +{creditos} crédito(s) disponíveis!
          </p>
        )}
        <div className="flex flex-col gap-3 items-center">
          <Link
            to="/perfil"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition"
          >
            Ir para o Perfil
          </Link>
          <Link
            to="/"
            className="text-sm text-blue-600 hover:underline"
          >
            Voltar para Home
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

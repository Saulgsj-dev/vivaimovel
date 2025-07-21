// frontend/tafin/src/pages/ComprarCreditos.jsx
import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../contexts/UserContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ComprarCreditos() {
  const { usuario, carregando: carregandoUsuario } = useContext(UserContext);
  const navigate = useNavigate();
  const [carregandoPagamento, setCarregandoPagamento] = useState(false);
  const [preferenceId, setPreferenceId] = useState(null);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState(null);
  const [mpLoaded, setMpLoaded] = useState(false); // Verifica se o SDK foi carregado

  const opcoes = [
    { creditos: 1, valor: 10 },
    { creditos: 20, valor: 100 },
    { creditos: 50, valor: 150 },
    { creditos: 100, valor: 200 },
  ];

  // Verifica se o Mercado Pago está carregado
  useEffect(() => {
    if (window.MercadoPago) {
      setMpLoaded(true);
    } else {
      const checkInterval = setInterval(() => {
        if (window.MercadoPago) {
          clearInterval(checkInterval);
          setMpLoaded(true);
        }
      }, 500);
      return () => clearInterval(checkInterval);
    }
  }, []);

  const iniciarCheckout = async (opcao) => {
    if (!usuario || !mpLoaded) return;

    setCarregandoPagamento(true);
    setOpcaoSelecionada(opcao);
    setPreferenceId(null);

    const loadingToastId = toast.loading("Preparando pagamento...");

    try {
      const response = await api.post("/create_preference", {
        description: `Compra de ${opcao.creditos} créditos`,
        price: opcao.valor,
        quantity: 1,
        userId: usuario.id,
        creditos: opcao.creditos,
      });

      const { id } = response.data;
      if (!id) throw new Error("Preferência não recebida");

      const container = document.getElementById("botao-mercado-pago");
      if (container) container.innerHTML = "";
      setPreferenceId(id);

      const mp = new window.MercadoPago("APP_USR-1fa957e9-938c-4229-976e-321a1a9dc54a", {
        locale: "pt-BR",
      });

      mp.checkout({
        preference: { id },
        render: {
          container: "#botao-mercado-pago",
          label: "Pagar com Mercado Pago",
        },
      });

      toast.dismiss(loadingToastId);
      toast.success("Pronto! Clique no botão para pagar.");
    } catch (err) {
      console.error("Erro ao iniciar pagamento:", err);
      toast.dismiss(loadingToastId);
      toast.error("Erro ao preparar o pagamento. Tente novamente.");
    } finally {
      setCarregandoPagamento(false);
    }
  };

  if (carregandoUsuario)
    return <div className="p-6">Carregando usuário...</div>;
  if (!usuario) {
    navigate("/");
    return null;
  }

  return (
    <>
      <div className="w-full pt-36 px-4 sm:px-6">
        {/* Navegação */}
        <div className="mb-6 flex flex-wrap justify-center sm:justify-start gap-4 text-sm">
          <Link to="/cadastrar-imovel" className="text-blue-700 hover:underline">
            Cadastrar Imóvel
          </Link>
          <span className="font-semibold text-yellow-600">Comprar Créditos</span>
          <Link to="/perfil" className="text-blue-700 hover:underline">
            Perfil
          </Link>
        </div>

        <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-yellow-600">
            Comprar Créditos
          </h1>
          <p className="mb-6 text-center text-gray-600 text-sm">
            Escolha uma das opções abaixo:
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {opcoes.map((op, i) => (
              <button
                key={i}
                onClick={() => {
                  setOpcaoSelecionada(op);
                  setPreferenceId(null);
                  setCarregandoPagamento(true);
                  setTimeout(() => {
                    iniciarCheckout(op);
                  }, 200);
                }}
                disabled={carregandoPagamento}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-3 rounded shadow transition text-sm"
              >
                {op.creditos} crédito(s) <br /> R$ {op.valor},00
              </button>
            ))}
          </div>

          {carregandoPagamento && (
            <div className="text-center py-4">
              <div className="animate-spin h-6 w-6 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Carregando botão de pagamento...</p>
            </div>
          )}

          {!carregandoPagamento && opcaoSelecionada && !preferenceId && (
            <div className="mt-6 text-center">
              <p className="text-gray-700 mb-2">Você selecionou:</p>
              <p className="text-xl font-bold text-green-600 mb-4">
                {opcaoSelecionada.creditos} crédito(s) por R$ {opcaoSelecionada.valor},00
              </p>
              <p className="text-gray-700">Aguarde enquanto preparamos o pagamento...</p>
            </div>
          )}

          {preferenceId && (
            <div className="mt-6 text-center">
              <p className="text-gray-700 mb-2">
                Você está prestes a comprar:
              </p>
              <p className="text-xl font-bold text-green-600 mb-4">
                {opcaoSelecionada?.creditos} crédito(s) por R$ {opcaoSelecionada?.valor},00
              </p>
              <p className="text-gray-700 mb-4">
                Clique no botão abaixo para efetuar o pagamento:
              </p>
              <div id="botao-mercado-pago" className="flex justify-center"></div>
            </div>
          )}
        </div>
      </div>

      {/* Container para os toasts */}
      <ToastContainer />
    </>
  );
}
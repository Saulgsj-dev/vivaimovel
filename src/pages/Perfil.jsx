// src/pages/Perfil.jsx
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../contexts/UserContext";
import { useNavigate, Link } from "react-router-dom";
import {
  doc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../services/firebase";
import ModalEditarImovel from "../components/ModalEditarImovel";
import supabase from "../services/supabase";

// Fallback seguro com SVG em base64
const fallbackImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTBlMGUwIiAvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkltYWdlbSBubyBkaXNwb25pdmVsPC90ZXh0Pjwvc3ZnPg==";

export default function Perfil() {
  const { usuario, carregando } = useContext(UserContext);
  const navigate = useNavigate();

  const [contatos, setContatos] = useState(usuario?.contatosVistos || []);
  const [imoveis, setImoveis] = useState([]);
  const [editingImovel, setEditingImovel] = useState(null);
  const [formData, setFormData] = useState({});
  const [showModal, setShowModal] = useState(false);

  // Carregar imóveis do usuário
  useEffect(() => {
    const carregarImoveis = async () => {
      if (!usuario) return;
      try {
        const snap = await getDocs(collection(db, "imoveis"));
        const lista = snap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((imovel) => imovel.usuarioId === usuario.id);
        setImoveis(lista);
      } catch (error) {
        console.error("Erro ao carregar imóveis:", error);
      }
    };
    carregarImoveis();
  }, [usuario]);

  // Função para remover contato
  const removerContato = async (index) => {
    const novosContatos = [...contatos];
    novosContatos.splice(index, 1);
    const usuarioRef = doc(db, "usuarios", usuario.id);
    await updateDoc(usuarioRef, {
      contatosVistos: novosContatos,
    });
    setContatos(novosContatos);
  };

  // Função para remover imóvel + imagens no Supabase
  const removerImovel = async (id, imagens) => {
    const confirmar = window.confirm("Tem certeza que deseja excluir este imóvel?");
    if (!confirmar) return;

    try {
      // Extrair caminhos das URLs
      const paths = imagens.map(url => {
        try {
          const urlObj = new URL(url);
          const pathParts = urlObj.pathname.split('/').slice(3).join('/');
          return pathParts;
        } catch (err) {
          console.warn("URL inválida:", url);
          return null;
        }
      }).filter(Boolean);

      // Deletar imagens no Supabase
      if (paths.length > 0) {
        const { error: deleteError } = await supabase
          .storage
          .from("imoveis")
          .remove(paths);

        if (deleteError) {
          console.warn("Erro ao deletar imagens no Supabase:", deleteError.message);
        }
      }

      // Deletar documento no Firestore
      await deleteDoc(doc(db, "imoveis", id));
      setImoveis(imoveis.filter(imovel => imovel.id !== id));

      alert("Imóvel excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir imóvel:", error);
      alert("Erro ao excluir o imóvel.");
    }
  };

  // Abrir modal de edição
  const abrirEdicao = (imovel) => {
    setFormData({ ...imovel });
    setEditingImovel(imovel.id);
    setShowModal(true);
  };

  // Salvar edição
  const salvarEdicao = async (dadosAtualizados) => {
    try {
      const imovelRef = doc(db, "imoveis", editingImovel);
      await updateDoc(imovelRef, dadosAtualizados);
      setImoveis(
        imoveis.map((imovel) =>
          imovel.id === editingImovel ? { ...imovel, ...dadosAtualizados } : imovel
        )
      );
      alert("Imóvel atualizado com sucesso!");
      setShowModal(false);
      setEditingImovel(null);
    } catch (error) {
      console.error("Erro ao editar imóvel:", error);
      alert("Erro ao atualizar os dados do imóvel.");
    }
  };

  if (carregando) return <div className="p-6">Carregando...</div>;
  if (!usuario) {
    navigate("/");
    return null;
  }

  return (
    <>
      {/* Conteúdo principal */}
      <div className="w-full pt-36 bg-gray-50">
        {/* Navegação */}
        <div className="mb-6 px-4 sm:px-6 flex flex-wrap justify-center sm:justify-start gap-4 text-sm">
          <Link to="/cadastrar-imovel" className="text-blue-700 hover:underline">
            Cadastrar Imóvel
          </Link>
          <Link to="/comprar-creditos" className="text-blue-700 hover:underline">
            Comprar Créditos
          </Link>
          <span className="font-semibold text-blue-700">Perfil</span>
        </div>

        {/* Conteúdo do perfil */}
        <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-md">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-green-700">
            Perfil do Usuário
          </h1>
          <div className="space-y-2 text-sm sm:text-base text-gray-800 mb-6">
            <p><strong>Nome:</strong> {usuario.nome}</p>
            <p><strong>Email:</strong> {usuario.email}</p>
            <p><strong>Tipo:</strong> {usuario.tipo}</p>
            <p><strong>Créditos:</strong> {usuario.creditos}</p>
          </div>

          {/* Meus Imóveis Publicados */}
          <div className="mt-8">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-green-600">
              Meus Imóveis Publicados
            </h2>
            {imoveis.length > 0 ? (
              <ul className="grid sm:grid-cols-2 gap-4">
                {imoveis.map((imovel) => (
                  <li
                    key={imovel.id}
                    className="border border-gray-200 p-4 rounded-lg shadow-sm relative bg-gray-50 hover:shadow-md transition"
                  >
                    {/* Miniatura da imagem */}
                    <img
                      src={imovel.imagens?.[0] || fallbackImage}
                      alt={imovel.titulo}
                      className="w-full h-32 object-cover rounded mb-2"
                      onError={(e) => {
                        e.target.src = fallbackImage; // Evita loop
                      }}
                    />
                    <p className="font-semibold text-gray-800">{imovel.titulo}</p>
                    <p className="text-sm text-gray-600">{imovel.cidade}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Valor: R$ {imovel.valor}
                    </p>
                    <div className="absolute top-2 right-2 space-x-2">
                      <button
                        onClick={() => abrirEdicao(imovel)}
                        className="text-blue-600 text-xs hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => removerImovel(imovel.id, imovel.imagens)}
                        className="text-red-600 text-xs hover:underline"
                      >
                        ✖ Excluir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">
                Você ainda não publicou nenhum imóvel.
              </p>
            )}
          </div>

          {/* Contatos Visualizados */}
          <div className="mt-8">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-green-600">
              Contatos Visualizados
            </h2>
            {Array.isArray(contatos) && contatos.length > 0 ? (
              <ul className="grid sm:grid-cols-2 gap-4">
                {contatos.map((contato, i) => (
                  <li
                    key={i}
                    className="border border-gray-200 p-4 rounded-lg shadow-sm relative bg-gray-50 hover:shadow-md transition"
                  >
                    <p className="font-semibold text-gray-800">{contato.titulo}</p>
                    <p className="text-sm text-gray-600">{contato.cidade}</p>
                    <p className="text-sm mt-1">{contato.telefone}</p>
                    <p className="text-sm">{contato.whatsapp}</p>
                    <p className="text-sm">{contato.email}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Visualizado em:{" "}
                      {new Date(contato.data.seconds * 1000).toLocaleString()}
                    </p>
                    <button
                      onClick={() => removerContato(i)}
                      className="absolute top-2 right-2 text-red-600 text-xs hover:underline"
                    >
                      ✖ Remover
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">
                Você ainda não visualizou nenhum contato.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      {showModal && (
        <ModalEditarImovel
          imovel={formData}
          onClose={() => {
            setShowModal(false);
            setEditingImovel(null);
          }}
          onSave={salvarEdicao}
        />
      )}

      {/* Footer fora do container */}
    </>
  );
}
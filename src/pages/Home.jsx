// Home.jsx
import { useEffect, useState, useContext } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { UserContext } from "../contexts/UserContext";
import ModalImagens from "../components/ModalImagens";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

export default function Home() {
  const [imoveis, setImoveis] = useState([]);
  const [busca, setBusca] = useState("");
  const { usuario } = useContext(UserContext);
  const [imovelSelecionado, setImovelSelecionado] = useState(null);

  useEffect(() => {
    const carregarImoveis = async () => {
      const snap = await getDocs(collection(db, "imoveis"));
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setImoveis(lista);
    };
    carregarImoveis();
  }, []);

  const verContato = async (imovel) => {
    if (!usuario) return;

    if (imovel.usuarioId === usuario.id) {
      alert(`\nEste imóvel é seu.\n\nNome: ${imovel.nome}\nEmail: ${imovel.email}\nTelefone: ${imovel.telefone}\nWhatsApp: ${imovel.whatsapp}`);
      return;
    }

    const usuarioRef = doc(db, "usuarios", usuario.id);
    const snap = await getDoc(usuarioRef);
    const dados = snap.data();

    const jaViu = (dados.contatosVistos || []).some(contato => contato.id === imovel.id);

    if (jaViu) {
      alert(`\nContato do imóvel:\nNome: ${imovel.nome}\nEmail: ${imovel.email}\nTelefone: ${imovel.telefone}\nWhatsApp: ${imovel.whatsapp}`);
      return;
    }

    const confirmar = window.confirm("Será descontado 1 crédito para ver este contato. Deseja continuar?");
    if (!confirmar) return;

    if ((dados.creditos || 0) <= 0) {
      alert("Você não tem créditos suficientes. Compre créditos para continuar.");
      return;
    }

    await updateDoc(usuarioRef, {
      creditos: dados.creditos - 1,
      contatosVistos: arrayUnion({
        id: imovel.id,
        nome: imovel.nome,
        email: imovel.email,
        telefone: imovel.telefone,
        whatsapp: imovel.whatsapp,
        titulo: imovel.titulo,
        cidade: imovel.cidade,
        data: new Date()
      })
    });

    alert(`\nContato do imóvel:\nNome: ${imovel.nome}\nEmail: ${imovel.email}\nTelefone: ${imovel.telefone}\nWhatsApp: ${imovel.whatsapp}`);
  };

  return (
    <div className="w-full pt-36">
      {usuario && (
        <div className="mb-6 px-4 sm:px-6 flex flex-wrap justify-center sm:justify-start gap-4 text-sm">
          <Link to="/cadastrar-imovel" className="text-blue-700 hover:underline">Cadastrar Imóvel</Link>
          <Link to="/comprar-creditos" className="text-blue-700 hover:underline">Comprar Créditos</Link>
          <Link to="/perfil" className="text-blue-700 hover:underline">Perfil</Link>
        </div>
      )}

      <section
        className="bg-cover bg-center bg-no-repeat text-white py-28"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1582407947304-fd86f028f716)' }}
      >
 <div className="bg-black/60 py-16 px-4 text-center backdrop-blur-sm rounded-xl max-w-4xl mx-auto">
  <h2 className="text-3xl md:text-5xl font-extrabold mb-2">Quer vender seu imóvel com agilidade?</h2>
  <h2 className="text-3xl md:text-5xl font-extrabold mb-2">Está buscando o lar ideal pra você?</h2>
  <h2 className="text-2xl md:text-4xl font-semibold mt-6 text-orange-200">
    Conectamos oportunidades com quem está pronto para fechar negócio!
  </h2>
</div>

      </section>

      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="max-w-md mx-auto mb-6">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título ou cidade..."
            className="w-full border border-gray-300 rounded px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-gray-800">
          Imóveis Disponíveis
        </h2>

        {imoveis.length === 0 && (
          <p className="text-gray-600 text-center">Nenhum imóvel cadastrado ainda.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {imoveis
            .filter(imovel =>
              imovel.titulo.toLowerCase().includes(busca.toLowerCase()) ||
              imovel.cidade.toLowerCase().includes(busca.toLowerCase())
            )
            .map(imovel => (
              <div key={imovel.id} className="border rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition flex flex-col">
                <img
                  src={imovel.imagens?.[0] || "https://via.placeholder.com/400x160?text=Sem+Imagem"}
                  alt={imovel.titulo}
                  className="h-40 w-full object-cover rounded mb-3 cursor-pointer hover:opacity-90 transition"
                  onClick={() => {
                    if (imovel.imagens?.length > 0) {
                      setImovelSelecionado(imovel);
                    }
                  }}
                />
                <h2 className="text-lg font-semibold text-gray-800">{imovel.titulo}</h2>
                <p className="text-sm text-gray-500 mb-1">{imovel.cidade}</p>
                <p className="text-sm text-gray-700 line-clamp-3 flex-grow">{imovel.descricao}</p>
                {usuario ? (
            <button
  onClick={() => verContato(imovel)}
  className="mt-3 w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-4 py-2 text-sm rounded-lg shadow-sm transition-all duration-300 ease-in-out active:scale-95"
>
  Ver informações de contato
</button>
                ) : (
                  <p className="text-sm text-blue-600 mt-3 text-center">
                    Entre ou cadastre-se para ver contato
                  </p>
                )}
              </div>
            ))}
        </div>
      </div>

      {imovelSelecionado && (
        <ModalImagens
          imagens={imovelSelecionado.imagens}
          imovel={imovelSelecionado}
          fechar={() => setImovelSelecionado(null)}
        />
      )}

    </div>
  );
}

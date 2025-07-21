import { useState } from "react";
import { ref, uploadBytes, deleteObject, getDownloadURL } from "firebase/storage";
import { storage } from "../services/firebase"

export default function ModalEditarImovel({ imovel, onClose, onSave }) {
  const [formData, setFormData] = useState({
    ...imovel,
    ddd: imovel.telefone?.replace(/\D/g, "").slice(0, 2) || "",
    telefone: imovel.telefone?.replace(/\D/g, "").slice(2) || "",
    dddWhatsapp: imovel.whatsapp?.replace(/\D/g, "").slice(0, 2) || "",
    whatsapp: imovel.whatsapp?.replace(/\D/g, "").slice(2) || "",
  });

  const [imagens, setImagens] = useState([...(imovel.imagens || [])]);
  const [novasImagens, setNovasImagens] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Trata seleção de novas imagens
  const handleNovaImagem = (e) => {
    const files = Array.from(e.target.files);
    if (imagens.length + files.length > 10) {
      alert("Você só pode adicionar até 10 imagens.");
      return;
    }
    setNovasImagens(files);
  };

  // Remove imagem antiga
  const handleRemoverImagem = async (index) => {
    if (!window.confirm("Tem certeza que deseja remover esta imagem?")) return;

    const url = imagens[index];

    try {
      const imagemRef = ref(storage, url);
      await deleteObject(imagemRef);
      const novas = [...imagens];
      novas.splice(index, 1);
      setImagens(novas);
    } catch (error) {
      console.error("Erro ao excluir imagem:", error);
      alert("Não foi possível remover a imagem.");
    }
  };

  // Faz upload das novas imagens
  const uploadImagens = async () => {
    const urls = [];

    // Primeiro, faz upload das novas imagens
    for (let imagem of novasImagens) {
      const caminho = `imoveis/${formData.usuarioId}/${Date.now()}-${imagem.name}`;
      const imagemRef = ref(storage, caminho);
      await uploadBytes(imagemRef, imagem);
      const url = await getDownloadURL(imagemRef);
      urls.push(url);
    }

    return urls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome || !formData.email || !formData.telefone || !formData.cidade || !formData.valor) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setUploading(true);

    let todasAsImagens = [...imagens];

    // Se houver novas imagens, faz upload
    if (novasImagens.length > 0) {
      try {
        const urls = await uploadImagens();
        todasAsImagens = [...todasAsImagens, ...urls]; // Adiciona novas imagens
      } catch (error) {
        console.error("Erro ao fazer upload das novas imagens:", error);
        alert("Erro ao atualizar imagens.");
        setUploading(false);
        return;
      }
    }

    const telefone = formData.ddd ? `(${formData.ddd}) ${formData.telefone}` : "";
    const whatsapp = formData.dddWhatsapp ? `(${formData.dddWhatsapp}) ${formData.whatsapp}` : "";

    try {
      await onSave({
        ...formData,
        telefone,
        whatsapp,
        imagens: todasAsImagens,
      });
      onClose();
    } catch (error) {
      console.error("Erro ao salvar edição:", error);
      alert("Erro ao atualizar os dados do imóvel.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl p-6 overflow-y-auto max-h-[90vh] animate-fade-in">
        <h2 className="text-xl font-bold mb-4">Editar Imóvel</h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Contato */}
          <h3 className="font-semibold text-gray-700 border-b pb-2">Contato</h3>
          <input
            type="text"
            name="nome"
            placeholder="Nome completo"
            value={formData.nome || ""}
            onChange={handleChange}
            className={`w-full border px-3 py-2 rounded text-sm ${
              !formData.nome ? "border-red-500" : "border-gray-300"
            }`}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email || ""}
            onChange={handleChange}
            className={`w-full border px-3 py-2 rounded text-sm ${
              !formData.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          <div className="flex gap-2">
            <input
              type="text"
              name="ddd"
              placeholder="DDD"
              maxLength={2}
              value={formData.ddd || ""}
              onChange={handleChange}
              className="w-20 border px-3 py-2 rounded text-sm"
            />
            <input
              type="text"
              name="telefone"
              placeholder="Telefone"
              value={formData.telefone || ""}
              onChange={handleChange}
              className={`flex-1 border px-3 py-2 rounded text-sm ${
                !formData.telefone ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              name="dddWhatsapp"
              placeholder="DDD"
              maxLength={2}
              value={formData.dddWhatsapp || ""}
              onChange={handleChange}
              className="w-20 border px-3 py-2 rounded text-sm"
            />
            <input
              type="text"
              name="whatsapp"
              placeholder="WhatsApp"
              value={formData.whatsapp || ""}
              onChange={handleChange}
              className="flex-1 border px-3 py-2 rounded text-sm"
            />
          </div>

          {/* Dados do Imóvel */}
          <h3 className="font-semibold text-gray-700 mt-6 border-b pb-2">Dados do Imóvel</h3>
          <select
            name="tipo"
            value={formData.tipo || "casa"}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-sm"
          >
            <option value="casa">Casa</option>
            <option value="apartamento">Apartamento</option>
            <option value="terreno">Terreno</option>
          </select>
          <input
            type="text"
            name="titulo"
            placeholder="Título"
            value={formData.titulo || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-sm"
          />
          <input
            type="text"
            name="valor"
            placeholder="Valor"
            value={formData.valor || ""}
            onChange={handleChange}
            className={`w-full border px-3 py-2 rounded text-sm ${
              !formData.valor ? "border-red-500" : "border-gray-300"
            }`}
          />
          <input
            type="text"
            name="area"
            placeholder="Área em m²"
            value={formData.area || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-sm"
          />
          <input
            type="number"
            name="quartos"
            placeholder="Quartos"
            value={formData.quartos || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-sm"
          />
          <input
            type="number"
            name="suites"
            placeholder="Suítes"
            value={formData.suites || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-sm"
          />
          <input
            type="number"
            name="banheiros"
            placeholder="Banheiros"
            value={formData.banheiros || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-sm"
          />
          <input
            type="number"
            name="vagas"
            placeholder="Vagas de garagem"
            value={formData.vagas || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-sm"
          />
          <input
            type="text"
            name="descricao"
            placeholder="Descrição (até 200 caracteres)"
            maxLength={200}
            value={formData.descricao || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-sm"
          />

          {/* Endereço */}
          <h3 className="font-semibold text-gray-700 mt-6 border-b pb-2">Endereço</h3>
          <input
            type="text"
            name="rua"
            placeholder="Rua"
            value={formData.rua || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-sm"
          />
          <input
            type="text"
            name="numero"
            placeholder="Número"
            value={formData.numero || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-sm"
          />
          <input
            type="text"
            name="cidade"
            placeholder="Cidade"
            value={formData.cidade || ""}
            onChange={handleChange}
            className={`w-full border px-3 py-2 rounded text-sm ${
              !formData.cidade ? "border-red-500" : "border-gray-300"
            }`}
          />
          <input
            type="text"
            name="bairro"
            placeholder="Bairro"
            value={formData.bairro || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-sm"
          />
          <input
            type="text"
            name="complemento"
            placeholder="Complemento"
            value={formData.complemento || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-sm"
          />
          <input
            type="text"
            name="cep"
            placeholder="CEP"
            value={formData.cep || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-sm"
          />

          {/* Imagens */}
          <h3 className="font-semibold text-gray-700 mt-6 border-b pb-2">Imagens</h3>

          {/* Imagens existentes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
            {imagens.map((url, index) => (
              <div key={`old-${index}`} className="relative group">
                <img src={url} alt={`Imagem ${index}`} className="h-28 w-full object-cover rounded" />
                <button
                  type="button"
                  onClick={() => handleRemoverImagem(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-80 hover:opacity-100 transition"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Carregar novas imagens */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Adicionar novas imagens</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleNovaImagem}
              className="w-full border px-3 py-2 rounded text-sm"
            />
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 bg-gray-300 rounded text-sm hover:bg-gray-400 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition disabled:opacity-50"
            >
              {uploading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
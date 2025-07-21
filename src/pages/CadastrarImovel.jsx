import { useContext, useState } from "react"
import { UserContext } from "../contexts/UserContext"
import { useNavigate, Link } from "react-router-dom"
import { db, storage } from "../services/firebase"
import { addDoc, collection, doc, updateDoc, getDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { v4 as uuid } from "uuid"
import Footer from "../components/Footer"
import ModalTermos from "../components/ModalTermos"

export default function CadastrarImovel() {
  const { usuario, carregando: carregandoUsuario } = useContext(UserContext)
  const navigate = useNavigate()
  const [dados, setDados] = useState({
    nome: "", email: "", ddd: "", telefone: "",
    dddWhatsapp: "", whatsapp: "", tipo: "casa",
    titulo: "", valor: "", area: "", quartos: "",
    suites: "", banheiros: "", vagas: "",
    descricao: "", rua: "", numero: "", cidade: "",
    bairro: "", complemento: "", cep: "", imagens: []
  })
  const [mostrarTermos, setMostrarTermos] = useState(false)
  const [enviando, setEnviando] = useState(false) // Estado de envio
  const [progressoUpload, setProgressoUpload] = useState(0) // Progresso opcional

  const removerImagem = (index) => {
    const novas = [...dados.imagens]
    novas.splice(index, 1)
    setDados({ ...dados, imagens: novas })
  }

  const handleImagem = (e) => {
    const files = Array.from(e.target.files)
    if (dados.imagens.length + files.length > 10) {
      alert("Máximo de 10 imagens.")
      return
    }
    setDados({ ...dados, imagens: [...dados.imagens, ...files] })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!usuario) return alert("Usuário não carregado.")
    if (usuario.creditos <= 0) {
      alert("Você não tem créditos suficientes. Compre para continuar.")
      return navigate("/comprar-creditos")
    }

    if (enviando) return // Evita múltiplos cliques

    setEnviando(true)

    try {
      const urls = []
      const totalImagens = dados.imagens.length
      let uploaded = 0

      for (let imagem of dados.imagens) {
        const caminho = `imoveis/${usuario.id}/${uuid()}`
        const imagemRef = ref(storage, caminho)
        await uploadBytes(imagemRef, imagem)
        const url = await getDownloadURL(imagemRef)
        urls.push(url)
        uploaded++
        setProgressoUpload(Math.round((uploaded / totalImagens) * 100))
      }

      const telefone = `(${dados.ddd}) ${dados.telefone}`
      const whatsapp = `(${dados.dddWhatsapp}) ${dados.whatsapp}`

      await addDoc(collection(db, "imoveis"), {
        ...dados,
        telefone,
        whatsapp,
        imagens: urls,
        usuarioId: usuario.id,
        criadoEm: new Date()
      })

      const usuarioRef = doc(db, "usuarios", usuario.id)
      const snap = await getDoc(usuarioRef)
      const creditosAtuais = snap.data().creditos || 0
      await updateDoc(usuarioRef, { creditos: creditosAtuais - 1 })

      alert("Imóvel cadastrado com sucesso! 1 crédito foi descontado.")
      navigate("/perfil")
    } catch (erro) {
      console.error(erro)
      alert("Erro ao cadastrar o imóvel.")
    } finally {
      setEnviando(false)
      setProgressoUpload(0)
    }
  }

  if (carregandoUsuario) return <div className="p-6">Carregando...</div>
  if (!carregandoUsuario && !usuario) {
    navigate("/")
    return null
  }

  return (
    <>
    <div className="w-full pt-36 px-4 sm:px-6">
      {usuario && (
        <div className="mb-6 flex flex-wrap justify-center sm:justify-start gap-4 text-sm">
          <Link to="/comprar-creditos" className="text-blue-700 hover:underline">Comprar Créditos</Link>
          <Link to="/perfil" className="text-blue-700 hover:underline">Perfil</Link>
          <Link to="/" className="text-blue-700 hover:underline">Voltar para Home</Link>
        </div>
      )}
      <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4 text-center text-green-700">Cadastrar Imóvel</h1>

        {enviando ? (
          <div className="text-center py-10">
            <p className="text-gray-700 mb-2">Enviando imagens... {progressoUpload}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${progressoUpload}%` }}></div>
            </div>
            <p className="mt-4 text-sm text-gray-500">Por favor, aguarde. Isso pode levar alguns segundos.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campos do formulário (mantidos iguais) */}
            {/* Contato */}
            <h2 className="text-lg font-semibold text-gray-700">Contato</h2>
            <input type="text" placeholder="Nome completo" required value={dados.nome} onChange={e => setDados({ ...dados, nome: e.target.value })} className="w-full border px-3 py-2 rounded text-sm" />
            <input type="email" placeholder="Email" required value={dados.email} onChange={e => setDados({ ...dados, email: e.target.value })} className="w-full border px-3 py-2 rounded text-sm" />
            <div className="flex gap-2">
              <input type="text" placeholder="DDD" maxLength={3} required value={dados.ddd} onChange={e => setDados({ ...dados, ddd: e.target.value })} className="w-20 border px-3 py-2 rounded text-sm" />
              <input type="text" placeholder="Telefone" required value={dados.telefone} onChange={e => setDados({ ...dados, telefone: e.target.value })} className="flex-1 border px-3 py-2 rounded text-sm" />
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="DDD" maxLength={3} required value={dados.dddWhatsapp} onChange={e => setDados({ ...dados, dddWhatsapp: e.target.value })} className="w-20 border px-3 py-2 rounded text-sm" />
              <input type="text" placeholder="WhatsApp" required value={dados.whatsapp} onChange={e => setDados({ ...dados, whatsapp: e.target.value })} className="flex-1 border px-3 py-2 rounded text-sm" />
            </div>

            {/* Imóvel */}
            <h2 className="text-lg font-semibold text-gray-700 mt-6">Dados do Imóvel</h2>
            <select value={dados.tipo} onChange={e => setDados({ ...dados, tipo: e.target.value })} className="w-full border px-3 py-2 rounded text-sm">
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
              <option value="terreno">Terreno</option>
            </select>
            <input type="text" placeholder="Título" required value={dados.titulo} onChange={e => setDados({ ...dados, titulo: e.target.value })} className="w-full border px-3 py-2 rounded text-sm" />
            <input type="text" placeholder="Valor" required value={dados.valor} onChange={e => setDados({ ...dados, valor: e.target.value })} className="w-full border px-3 py-2 rounded text-sm" />
            <input type="text" placeholder="Área em m²" required value={dados.area} onChange={e => setDados({ ...dados, area: e.target.value })} className="w-full border px-3 py-2 rounded text-sm" />
            <input type="number" placeholder="Quartos" required value={dados.quartos} onChange={e => setDados({ ...dados, quartos: e.target.value })} className="w-full border px-3 py-2 rounded text-sm" />
            <input type="number" placeholder="Suítes" required value={dados.suites} onChange={e => setDados({ ...dados, suites: e.target.value })} className="w-full border px-3 py-2 rounded text-sm" />
            <input type="number" placeholder="Banheiros" required value={dados.banheiros} onChange={e => setDados({ ...dados, banheiros: e.target.value })} className="w-full border px-3 py-2 rounded text-sm" />
            <input type="number" placeholder="Vagas de garagem" required value={dados.vagas} onChange={e => setDados({ ...dados, vagas: e.target.value })} className="w-full border px-3 py-2 rounded text-sm" />
            <input type="text" placeholder="Descrição (até 200 caracteres)" maxLength={200} value={dados.descricao} onChange={e => setDados({ ...dados, descricao: e.target.value })} className="w-full border px-3 py-2 rounded text-sm" />

            {/* Endereço */}
            <h2 className="text-lg font-semibold text-gray-700 mt-6">Endereço</h2>
            <input type="text" placeholder="Rua" required value={dados.rua} onChange={e => setDados({ ...dados, rua: e.target.value })} className="w-full border px-3 py-2 rounded text-sm" />
            <input type="text" placeholder="Número" required value={dados.numero} onChange={e => setDados({ ...dados, numero: e.target.value })} className="w-full border px-3 py-2 rounded text-sm" />
            <input type="text" placeholder="Cidade" required value={dados.cidade} onChange={e => setDados({ ...dados, cidade: e.target.value })} className="w-full border px-3 py-2 rounded text-sm" />
            <input type="text" placeholder="Bairro" required value={dados.bairro} onChange={e => setDados({ ...dados, bairro: e.target.value })} className="w-full border px-3 py-2 rounded text-sm" />
            <input type="text" placeholder="Complemento" value={dados.complemento} onChange={e => setDados({ ...dados, complemento: e.target.value })} className="w-full border px-3 py-2 rounded text-sm" />
            <input type="text" placeholder="CEP" required value={dados.cep} onChange={e => setDados({ ...dados, cep: e.target.value })} className="w-full border px-3 py-2 rounded text-sm" />

            {/* Imagens */}
            <h2 className="text-lg font-semibold text-gray-700 mt-6">Imagens</h2>
            <input type="file" accept="image/*" multiple onChange={handleImagem} className="w-full border px-3 py-2 rounded text-sm" />
            {dados.imagens.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {dados.imagens.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={URL.createObjectURL(img)} alt={`Imagem ${i + 1}`} className="h-32 w-full object-cover rounded shadow" />
                    <button type="button" onClick={() => removerImagem(i)} className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded-full shadow-md">✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Termos */}
            <label className="text-xs block mt-4">
              <input type="checkbox" required className="mr-2" />
              Ao informar meus dados, concordo com a{" "}
              <button type="button" onClick={() => setMostrarTermos(true)} className="text-green-600 underline">política de privacidade</button>.
            </label>
            <button
              type="submit"
              disabled={enviando}
              className={`w-full py-2 rounded mt-2 transition ${
                enviando
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {enviando ? "Enviando..." : "Cadastrar Imóvel"}
            </button>
          </form>
        )}

      </div>
      {mostrarTermos && <ModalTermos fechar={() => setMostrarTermos(false)} />}
      
    </div>
    </>
  )
}
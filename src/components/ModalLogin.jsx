import { auth, db } from "../services/firebase"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useContext } from "react"
import { UserContext } from "../contexts/UserContext"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function ModalLogin({ fechar }) {
  const [aba, setAba] = useState("login")
  const [tipoCadastro, setTipoCadastro] = useState("proprietario")

  const [formLogin, setFormLogin] = useState({ email: "", senha: "" })
  const [formCadastro, setFormCadastro] = useState({
    tipo: "proprietario",
    nome: "",
    email: "",
    cpf: "",
    nascimento: "",
    cressi: "",
    senha: "",
    confirmarSenha: ""
  })

  const navigate = useNavigate()
  const { setUsuario } = useContext(UserContext)

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const credenciais = await signInWithEmailAndPassword(
        auth,
        formLogin.email,
        formLogin.senha
      )
      const user = credenciais.user

      // Busca os dados completos do usuário no Firestore
      const userDoc = await getDoc(doc(db, "usuarios", user.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()

        // Atualiza o contexto global com os dados do usuário
        setUsuario({
          id: user.uid,
          nome: userData.nome,
          email: user.email,
          tipo: userData.tipo,
          creditos: userData.creditos || 0,
          contatosVistos: userData.contatosVistos || []
        })
      }

      toast.success("Login realizado com sucesso!")
      setTimeout(() => {
        fechar()
        navigate("/perfil") // Redireciona para perfil
      }, 1500)
    } catch (erro) {
      toast.error("Erro ao logar: " + erro.message)
    }
  }

  const handleCadastro = async (e) => {
    e.preventDefault()

    if (formCadastro.senha !== formCadastro.confirmarSenha) {
      toast.error("Senhas não coincidem")
      return
    }

    try {
      const credenciais = await createUserWithEmailAndPassword(
        auth,
        formCadastro.email,
        formCadastro.senha
      )
      const user = credenciais.user

      // Atualiza o displayName do usuário no Firebase Auth
      await updateProfile(user, {
        displayName: formCadastro.nome
      })

      // Cria documento no Firestore com os dados do usuário
      await setDoc(doc(db, "usuarios", user.uid), {
        nome: formCadastro.nome,
        email: formCadastro.email,
        cpf: formCadastro.cpf,
        nascimento: formCadastro.nascimento,
        tipo: tipoCadastro,
        cressi: tipoCadastro === "corretor" ? formCadastro.cressi : "",
        creditos: 5
      })

      // Atualiza o contexto global com os dados do novo usuário
      setUsuario({
        id: user.uid,
        nome: formCadastro.nome,
        email: formCadastro.email,
        tipo: tipoCadastro,
        creditos: 5,
        contatosVistos: []
      })

      toast.success("Cadastro realizado com sucesso!")
      setTimeout(() => {
        fechar()
        navigate("/perfil") // Redireciona para perfil
      }, 1500)
    } catch (erro) {
      toast.error("Erro ao cadastrar: " + erro.message)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white w-full max-w-md p-6 rounded shadow">
          <div className="flex justify-between mb-4">
            <button
              onClick={() => setAba("login")}
              className={`font-semibold ${aba === "login" ? "text-blue-600" : ""}`}
            >
              Login
            </button>
            <button
              onClick={() => setAba("cadastro")}
              className={`font-semibold ${aba === "cadastro" ? "text-blue-600" : ""}`}
            >
              Cadastro
            </button>
            <button onClick={fechar} className="text-red-600 font-bold">
              X
            </button>
          </div>

          {aba === "login" && (
            <form className="space-y-4" onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={formLogin.email}
                onChange={(e) =>
                  setFormLogin({ ...formLogin, email: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                autoComplete="email"
                required
              />
              <input
                type="password"
                placeholder="Senha"
                value={formLogin.senha}
                onChange={(e) =>
                  setFormLogin({ ...formLogin, senha: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                autoComplete="current-password"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded"
              >
                Entrar
              </button>
            </form>
          )}

          {aba === "cadastro" && (
            <form className="space-y-3 text-sm" onSubmit={handleCadastro}>
              <div className="flex gap-4">
                <label>
                  <input
                    type="radio"
                    name="tipo"
                    value="proprietario"
                    checked={tipoCadastro === "proprietario"}
                    onChange={() => {
                      setTipoCadastro("proprietario")
                      setFormCadastro({ ...formCadastro, tipo: "proprietario" })
                    }}
                  />{" "}
                  Proprietário
                </label>
                <label>
                  <input
                    type="radio"
                    name="tipo"
                    value="corretor"
                    checked={tipoCadastro === "corretor"}
                    onChange={() => {
                      setTipoCadastro("corretor")
                      setFormCadastro({ ...formCadastro, tipo: "corretor" })
                    }}
                  />{" "}
                  Corretor
                </label>
              </div>

              <input
                type="text"
                placeholder="Nome completo"
                value={formCadastro.nome}
                onChange={(e) =>
                  setFormCadastro({ ...formCadastro, nome: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formCadastro.email}
                onChange={(e) =>
                  setFormCadastro({ ...formCadastro, email: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                autoComplete="email"
                required
              />
              <input
                type="text"
                placeholder="CPF"
                value={formCadastro.cpf}
                onChange={(e) =>
                  setFormCadastro({ ...formCadastro, cpf: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                required
              />
              <input
                type="date"
                placeholder="Data de nascimento"
                value={formCadastro.nascimento}
                onChange={(e) =>
                  setFormCadastro({ ...formCadastro, nascimento: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                required
              />
              {tipoCadastro === "corretor" && (
                <input
                  type="text"
                  placeholder="CRECI"
                  value={formCadastro.cressi}
                  onChange={(e) =>
                    setFormCadastro({ ...formCadastro, cressi: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              )}
              <input
                type="password"
                placeholder="Senha"
                value={formCadastro.senha}
                onChange={(e) =>
                  setFormCadastro({ ...formCadastro, senha: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                autoComplete="new-password"
                required
                minLength={6}
              />
              <input
                type="password"
                placeholder="Confirmar Senha"
                value={formCadastro.confirmarSenha}
                onChange={(e) =>
                  setFormCadastro({
                    ...formCadastro,
                    confirmarSenha: e.target.value
                  })
                }
                className="w-full border px-3 py-2 rounded"
                autoComplete="new-password"
                required
                minLength={6}
              />
              <label className="text-xs block">
                <input type="checkbox" required className="mr-2" />
                Aceito os termos de uso
              </label>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded"
              >
                Cadastrar
              </button>
            </form>
          )}
        </div>
      </div>
      <ToastContainer />
    </>
  )
}
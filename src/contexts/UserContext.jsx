import { createContext, useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { doc, onSnapshot } from "firebase/firestore"
import { auth, db } from "../services/firebase"

export const UserContext = createContext()

export function UserProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const docRef = doc(db, "usuarios", user.uid)

        const unsubscribeSnapshot = onSnapshot(docRef, (snap) => {
          if (snap.exists()) {
            setUsuario({ id: user.uid, ...snap.data() })
          }
          setCarregando(false)
        })

        return () => unsubscribeSnapshot()
      } else {
        setUsuario(null)
        setCarregando(false)
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <UserContext.Provider value={{ usuario, setUsuario, carregando }}>
      {!carregando && children}
    </UserContext.Provider>
  )
}
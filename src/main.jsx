// src/main.jsx
import React from "react"
import ReactDOM from "react-dom/client"
import AppRouter from "./routes/AppRouter"
import "./index.css"
import { UserProvider } from "./contexts/UserContext"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserProvider>
      <AppRouter />
    </UserProvider>
  </React.StrictMode>
)

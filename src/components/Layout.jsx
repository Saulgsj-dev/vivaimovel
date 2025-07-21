// Layout.jsx
import Header from "./Header"
import Footer from "./Footer"
import { Outlet } from "react-router-dom"

export default function Layout() {
  return (
    <>
      <Header />
      <main className="p-6">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
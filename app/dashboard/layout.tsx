import Image from "next/image"
import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}

function Sidebar() {
  return (
    <aside className="w-[294px] bg-[#024728] text-white fixed h-screen">
      <nav className="flex flex-col h-full">
        <div className="pt-16 pl-6 pb-8">
          <Image src="/ethos-circular-logo.svg" alt="Logo" width={50} height={50} priority />
        </div>
        <ul className="flex-1 space-y-8 p-6">
          <li>
            <Link href="/dashboard" className="text-xl font-medium underline">
              Inicio
            </Link>
          </li>
          <li>
            <Link href="#" className="text-xl font-medium hover:underline">
              Unidad de negocio
            </Link>
          </li>
          <li>
            <Link href="#" className="text-xl font-medium hover:underline">
              Solicitudes
            </Link>
          </li>
          <li>
            <Link href="#" className="text-xl font-medium hover:underline">
              Directorio
            </Link>
          </li>
          <li>
            <Link href="#" className="text-xl font-medium hover:underline">
              Propietarios y ocupantes
            </Link>
          </li>
        </ul>
        <div className="p-6">
          <Link href="/">
            <button className="w-full bg-[#008A4B] text-white py-2 rounded-lg text-sm hover:bg-[#006837] transition-colors">
              Cerrar sesión
            </button>
          </Link>
        </div>
      </nav>
    </aside>
  )
} 
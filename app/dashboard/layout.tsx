"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { 
  HomeIcon, 
  BuildingOffice2Icon,
  UserGroupIcon,
  DocumentTextIcon,
  UserIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  ArrowLeftOnRectangleIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon
} from "@heroicons/react/24/outline"
import { useAuth } from '../_lib/auth/AuthContext'
import type { UserRole } from '../_lib/auth/AuthContext'
import { UserCircle } from "lucide-react"

// Menús específicos por rol
const menuItems = {
  jefeOperativo: [
    {
      label: "Inicio",
      icon: HomeIcon,
      href: "/dashboard"
    },
    {
      label: "Proyectos",
      icon: BuildingOffice2Icon,
      href: "/dashboard/proyectos"
    },
    {
      label: "Ocupantes y propietarios",
      icon: UserGroupIcon,
      href: "/dashboard/propietarios"
    }
  ],
  administrador: [
    {
      label: "Inicio",
      icon: HomeIcon,
      href: "/dashboard"
    },
    {
      label: "Proyectos",
      icon: BuildingOffice2Icon,
      href: "/dashboard/proyectos"
    },
    {
      label: "Solicitudes",
      icon: ClipboardDocumentListIcon,
      href: "/dashboard/solicitudes"
    },
    {
      label: "Directorio",
      icon: BuildingStorefrontIcon,
      href: "/dashboard/directorio"
    },
    {
      label: "Ocupantes y propietarios",
      icon: UserGroupIcon,
      href: "/dashboard/propietarios"
    },
    {
      label: "Tasas",
      icon: CurrencyDollarIcon,
      href: "/dashboard/tasas"
    },
    {
      label: "Usuarios",
      icon: UserCircle,
      href: "/dashboard/usuarios"
    }
  ],
  directorio: [
    {
      label: "Inicio",
      icon: HomeIcon,
      href: "/dashboard"
    },
    {
      label: "Proyectos",
      icon: BuildingOffice2Icon,
      href: "/dashboard/proyectos"
    },
    {
      label: "Solicitudes",
      icon: ClipboardDocumentListIcon,
      href: "/dashboard/solicitudes"
    },
    {
      label: "Directorio",
      icon: BuildingStorefrontIcon,
      href: "/dashboard/directorio"
    },
    {
      label: "Ocupantes y propietarios",
      icon: UserGroupIcon,
      href: "/dashboard/propietarios"
    },
    {
      label: "Tasas",
      icon: CurrencyDollarIcon,
      href: "/dashboard/tasas"
    },
    {
      label: "Usuarios",
      icon: UserCircle,
      href: "/dashboard/usuarios"
    },
  ],
  propietario: [
    {
      label: "Inicio",
      icon: HomeIcon,
      href: "/dashboard"
    },
    {
      label: "Mis Propiedades",
      icon: BuildingOffice2Icon,
      href: "/dashboard/mis-propiedades"
    },
    {
      label: "Mis Documentos",
      icon: DocumentTextIcon,
      href: "/dashboard/mis-documentos"
    },
    {
      label: "Solicitudes",
      icon: ClipboardDocumentListIcon,
      href: "/dashboard/solicitudes"
    }
  ],
  arrendatario: [
    {
      label: "Inicio",
      icon: HomeIcon,
      href: "/dashboard"
    },
    {
      label: "Mi Alquiler",
      icon: BuildingOffice2Icon,
      href: "/dashboard/mi-alquiler"
    },
    {
      label: "Mis Documentos",
      icon: DocumentTextIcon,
      href: "/dashboard/mis-documentos"
    },
    {
      label: "Solicitudes",
      icon: ClipboardDocumentListIcon,
      href: "/dashboard/solicitudes"
    }
  ]
}

// Componente de selector de rol (temporal para desarrollo)
function RoleSelector() {
  const { role, setRole } = useAuth();
  
  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50">
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as any)}
        className="border rounded p-2"
      >
        <option value="jefeOperativo">Jefe Operativo</option>
        <option value="administrador">Administrador</option>
        <option value="directorio">Directorio</option>
        <option value="propietario">Propietario</option>
        <option value="arrendatario">Arrendatario</option>
      </select>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { role } = useAuth()
  const items = menuItems[role]
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar items={items} role={role} />
      <div className="flex-1 ml-[294px]">
        <main className="p-8">{children}</main>
      </div>
      <RoleSelector />
    </div>
  )
}

function Sidebar({ items, role }: { items: typeof menuItems[keyof typeof menuItems], role: UserRole }) {
  const pathname = usePathname()

  const roleLabels: Record<UserRole, string> = {
    jefeOperativo: "Jefe Operativo",
    administrador: "Administrador",
    directorio: "Directorio",
    propietario: "Propietario",
    arrendatario: "Arrendatario"
  }

  return (
    <aside className="w-[294px] fixed h-screen backdrop-blur-sm bg-gradient-to-br from-[#05703f] via-[#024728] to-[#01231a] text-white shadow-2xl border-r border-white/5">
      <motion.nav 
        className="flex flex-col h-full"
        initial={{ x: -294, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="pt-8 pl-6 pb-8 flex items-center gap-4">
          <Image 
            src="/ethos-circular-logo.svg" 
            alt="Logo" 
            width={50} 
            height={50} 
            className="transition-all duration-300 hover:scale-110 hover:rotate-[360deg]"
            priority 
          />
          <div className="flex flex-col">
            <span className="font-semibold text-xl tracking-tight">Valentina</span>
            <span className="text-sm text-white/70">{roleLabels[role]}</span>
          </div>
        </div>

        <ul className="flex-1 space-y-1 p-4">
          {items.map((item) => {
            const isActive = item.href === "/dashboard" 
              ? pathname === item.href 
              : pathname.startsWith(item.href)

            return (
              <li key={item.href}>
                <Link 
                  href={item.href} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group
                    ${isActive 
                      ? 'bg-white/15 text-white' 
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <item.icon className={`w-6 h-6 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-white/70'}`} />
                  <span className="font-medium tracking-wide">{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="absolute left-0 w-1.5 h-8 bg-white rounded-r-full shadow-lg shadow-white/20"
                      layoutId="activeIndicator"
                      transition={{ 
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                      }}
                    />
                  )}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                  />
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="p-4 border-t border-white/10">
          <Link href="/login">
            <motion.button 
              className="w-full bg-gradient-to-r from-[#008A4B] to-[#006837] text-white py-3 px-4 rounded-xl font-medium
                hover:from-[#006837] hover:to-[#004d29] transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-[#008A4B]/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
              Cerrar sesión
            </motion.button>
          </Link>
        </div>
      </motion.nav>
    </aside>
  )
} 
'use client'

import { SummaryCards } from "./_components/SummaryCards"
import { RecentRequests } from "./_components/RecentRequests"
import { Button } from "../_components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  ArrowDownTrayIcon, 
  CalendarIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline"
import { useAuth } from '../_lib/auth/AuthContext'
import type { UserRole } from '../_lib/auth/AuthContext'

const containerAnimation = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemAnimation = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

// Configuración de acciones rápidas por rol
const quickActions: Record<UserRole, Array<{
  title: string
  description: string
  actionLabel: string
  href: string
  icon: React.ElementType
}>> = {
  'Jefe Operativo': [
    {
      title: "Añadir Propiedad",
      description: "Registra una nueva propiedad en el sistema",
      actionLabel: "Crear propiedad",
      href: "/dashboard/proyectos/nuevo",
      icon: BuildingOffice2Icon
    },
    {
      title: "Ver Reportes",
      description: "Accede a los reportes y estadísticas",
      actionLabel: "Ver reportes",
      href: "/dashboard/reportes",
      icon: ChartBarIcon
    }
  ],
  'Administrador': [
    {
      title: "Gestionar Usuarios",
      description: "Administra los usuarios del sistema",
      actionLabel: "Gestionar usuarios",
      href: "/dashboard/usuarios",
      icon: UserGroupIcon
    },
    {
      title: "Gestionar Solicitudes",
      description: "Administra las solicitudes del sistema",
      actionLabel: "Gestionar solicitudes",
      href: "/dashboard/solicitudes",
      icon: ClipboardDocumentListIcon
    },
    // {
    //   title: "Reportes",
    //   description: "Accede a los reportes que has creado",
    //   actionLabel: "Ver reportes",
    //   href: "/dashboard/reportes",
    //   icon: ChartBarIcon
    // }
  ],
  'Directorio': [
    {
      title: "Gestionar Usuarios",
      description: "Administra los usuarios del sistema",
      actionLabel: "Gestionar usuarios",
      href: "/dashboard/usuarios",
      icon: UserGroupIcon
    },
    {
      title: "Gestionar Solicitudes",
      description: "Administra las solicitudes del sistema",
      actionLabel: "Gestionar solicitudes",
      href: "/dashboard/solicitudes",
      icon: ClipboardDocumentListIcon
    },
    // {
    //   title: "Reportes",
    //   description: "Accede a los reportes que has creado",
    //   actionLabel: "Ver reportes",
    //   href: "/dashboard/reportes",
    //   icon: ChartBarIcon
    // }
  ],
  'Propietario': [
    {
      title: "Mis Propiedades",
      description: "Visualiza tus propiedades registradas",
      actionLabel: "Ver propiedades",
      href: "/dashboard/mis-propiedades",
      icon: BuildingOffice2Icon
    },
    {
      title: "Nueva Solicitud",
      description: "Crea una nueva solicitud de servicio",
      actionLabel: "Crear solicitud",
      href: "/dashboard/solicitudes/nuevo",
      icon: ClipboardDocumentListIcon
    },
    {
      title: "Mis Documentos",
      description: "Accede a tus documentos",
      actionLabel: "Ver documentos",
      href: "/dashboard/mis-documentos",
      icon: DocumentTextIcon
    }
  ],
  'Arrendatario': [
    {
      title: "Mi Alquiler",
      description: "Detalles de tu propiedad alquilada",
      actionLabel: "Ver detalles",
      href: "/dashboard/mi-alquiler",
      icon: BuildingOffice2Icon
    },
    {
      title: "Nueva Solicitud",
      description: "Crea una nueva solicitud de servicio",
      actionLabel: "Crear solicitud",
      href: "/dashboard/solicitudes/nuevo",
      icon: ClipboardDocumentListIcon
    },
    {
      title: "Mis Documentos",
      description: "Accede a tus documentos",
      actionLabel: "Ver documentos",
      href: "/dashboard/mis-documentos",
      icon: DocumentTextIcon
    }
  ]
}

// Títulos y descripciones por rol
const dashboardContent: Record<UserRole, { title: string; description: string }> = {
  'Jefe Operativo': {
    title: "Bienvenido",
    description: "Resumen de todas las propiedades de Ethos"
  },
  'Administrador': {
    title: "Panel de Administración",
    description: "Gestión general del sistema"
  },
  'Directorio': {
    title: "Panel Ejecutivo",
    description: "Vista general de la empresa"
  },
  'Propietario': {
    title: "Mi Panel",
    description: "Gestión de tus propiedades"
  },
  'Arrendatario': {
    title: "Mi Panel",
    description: "Gestión de tu alquiler"
  }
}

export default function DashboardPage() {
  const { role } = useAuth()
  
  if (!role) return null

  const content = dashboardContent[role]
  const actions = quickActions[role]

  // Roles que pueden ver solicitudes
  const canViewRequests = ['Administrador', 'Directorio', 'Propietario', 'Arrendatario']

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerAnimation}
      className="space-y-8"
    >
      {/* Header Section */}
      <motion.div 
        variants={itemAnimation}
        className="bg-white border rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="border-l-4 border-[#008A4B] px-8 py-6">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <CalendarIcon className="w-5 h-5" />
            <span className="text-sm font-medium">
              {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">{content.title}</h1>
          <p className="text-gray-600 mt-1">
            {content.description}
          </p>
        </div>
      </motion.div>

      {/* Summary Cards Section */}
      <motion.div variants={itemAnimation}>
        <SummaryCards role={role} />
      </motion.div>

      {/* Recent Requests Section - Solo visible para roles específicos */}
      {canViewRequests.includes(role) && (
        <motion.section variants={itemAnimation} className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Solicitudes Recientes</h2>
              <p className="text-gray-500 mt-1">Gestiona las últimas solicitudes recibidas</p>
            </div>
            
            <Button 
              variant="outline" 
              className="border-[#008A4B] text-[#008A4B] hover:bg-[#008A4B] hover:text-white
                transition-all duration-300 flex items-center gap-2 px-6"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Exportar a Excel
            </Button>
          </div>

          <div className="rounded-xl overflow-hidden border">
            <RecentRequests role={role} />
          </div>
        </motion.section>
      )}

      {/* Quick Actions Section */}
      <motion.section 
        variants={itemAnimation}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {actions.map((action, index) => (
          <QuickActionCard 
            key={index}
            title={action.title}
            description={action.description}
            actionLabel={action.actionLabel}
            href={action.href}
            Icon={action.icon}
          />
        ))}
      </motion.section>
    </motion.div>
  )
}

function QuickActionCard({ 
  title, 
  description, 
  actionLabel, 
  href,
  Icon
}: { 
  title: string
  description: string
  actionLabel: string
  href: string
  Icon: React.ElementType
}) {
  return (
    <motion.div 
      variants={itemAnimation}
      className="bg-white rounded-2xl border p-6 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex items-start gap-4">
        <div className="bg-[#008A4B]/10 rounded-xl p-3">
          <Icon className="w-6 h-6 text-[#008A4B]" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-500 mt-1 mb-4">{description}</p>
          <Link 
            href={href}
            className="inline-flex items-center text-[#008A4B] hover:text-[#006837] font-medium"
          >
            {actionLabel}
            <svg
              className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  )
} 
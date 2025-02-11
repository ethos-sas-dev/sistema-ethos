'use client'

import { motion } from "framer-motion"
import { Button } from "../../../_components/ui/button"
import { 
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BuildingOffice2Icon,
  PlusIcon
} from "@heroicons/react/24/outline"
import Link from "next/link"
import Image from "next/image"
import { use } from "react"
import { useAuth } from '../../../_lib/auth/AuthContext'
import { useRouter } from "next/navigation"

// Datos de ejemplo - esto vendría de tu API
const projectData = {
  id: 1,
  name: "Almax 3",
  totalProperties: 205,
  activeProperties: 195,
  pendingRequests: 3,
  properties: [
    {
      id: 1,
      name: "Bodega 01",
      lot: "Lote 1",
      type: "Bodega",
      area: "450 m²",
      image: "/bodega.png",
      status: "En renta"
    },
    {
      id: 2,
      name: "Bodega 02",
      lot: "Lote 2",
      type: "Bodega",
      area: "520 m²",
      image: "/bodega.png",
      status: "Disponible"
    },
    // ... otros datos de propiedades
  ]
}

type PageParams = {
  projectId: string
}

export default function ProjectDetailPage({ params }: { params: Promise<PageParams> }) {
  const { projectId } = use(params)
  const { role } = useAuth()
  const router = useRouter()

  // Verificar si el usuario tiene permisos de administración
  const isAdmin = role === 'administrador' || role === 'directorio'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Back button and title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/proyectos">
            <Button variant="outline" size="icon" className="rounded-full w-8 h-8">
              <ArrowLeftIcon className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">{projectData.name}</h1>
        </div>
        {isAdmin && (
          <Button 
            className="bg-[#008A4B] hover:bg-[#006837] flex items-center gap-2"
            onClick={() => router.push(`/dashboard/proyectos/${projectId}/propiedades/nueva`)}
          >
            <PlusIcon className="w-4 h-4" />
            Nueva Propiedad
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <div className="text-3xl font-light">{projectData.totalProperties}</div>
          <div className="text-gray-500 mt-1">Propiedades Totales</div>
          {isAdmin && (
            <Button variant="outline" className="w-full mt-4">
              Cargar o modificar
            </Button>
          )}
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="text-3xl font-light">{projectData.activeProperties}</div>
          <div className="text-gray-500 mt-1">Propiedades Activas</div>
          {isAdmin && (
            <Button variant="outline" className="w-full mt-4">
              Filtrar
            </Button>
          )}
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="text-3xl font-light">{projectData.pendingRequests}</div>
          <div className="text-gray-500 mt-1">Solicitudes Pendientes</div>
          {isAdmin && (
            <Button variant="outline" className="w-full mt-4">
              Ver solicitudes
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o número de lote..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008A4B]/20 focus:border-[#008A4B]"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <FunnelIcon className="w-4 h-4" />
          Categoría
        </Button>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectData.properties.map((property) => (
          <Link 
            href={`/dashboard/proyectos/${projectId}/propiedades/${property.id}`} 
            key={property.id}
          >
            <motion.div
              className="bg-white rounded-xl border overflow-hidden group cursor-pointer"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative h-48">
                <Image
                  src={property.image}
                  alt={property.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#008A4B] transition-colors">
                      {property.name}
                    </h3>
                    <p className="text-sm text-gray-500">{property.lot}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    {property.status}
                  </Button>
                </div>
                <div className="mt-4 flex items-center gap-2 text-gray-600">
                  <BuildingOffice2Icon className="w-4 h-4" />
                  <span className="text-sm">{property.area}</span>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  )
} 
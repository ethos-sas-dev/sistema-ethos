'use client'

import { motion } from "framer-motion"
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  UserGroupIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline"
import { Button } from "../../_components/ui/button"
import Link from "next/link"

// Datos de ejemplo - esto vendría de tu API
const projects = [
  {
    id: 1,
    name: "Almax 3",
    type: "Industrial",
    location: "Zona Norte, Ciudad",
    units: 205,
    activeUnits: 195,
    pendingRequests: 3,
    lastUpdate: "2024-02-15"
  },
  {
    id: 2,
    name: "Centro Empresarial Sur",
    type: "Comercial",
    location: "Zona Sur, Ciudad",
    units: 150,
    activeUnits: 142,
    pendingRequests: 5,
    lastUpdate: "2024-02-14"
  },
  {
    id: 3,
    name: "Plaza Central",
    type: "Comercial",
    location: "Zona Este, Ciudad",
    units: 80,
    activeUnits: 75,
    pendingRequests: 2,
    lastUpdate: "2024-02-13"
  },
]

export default function ProjectsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Proyectos Asignados</h1>
          <p className="text-gray-500 mt-1">Gestiona y supervisa tus proyectos asignados</p>
        </div>
        <Button className="bg-[#008A4B] hover:bg-[#006837]">
          Nuevo Proyecto
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o ubicación..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008A4B]/20 focus:border-[#008A4B]"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <FunnelIcon className="w-4 h-4" />
          Filtros
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link href={`/dashboard/proyectos/${project.id}`} key={project.id}>
            <motion.div
              className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer group h-full"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#008A4B] transition-colors">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <MapPinIcon className="w-4 h-4" />
                    {project.location}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <BuildingOffice2Icon className="w-4 h-4" />
                  <span className="text-sm">{project.type}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <UserGroupIcon className="w-4 h-4" />
                  <span className="text-sm">{project.activeUnits} de {project.units} unidades activas</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {project.pendingRequests} solicitudes pendientes
                </span>
                <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-[#008A4B] group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  )
} 
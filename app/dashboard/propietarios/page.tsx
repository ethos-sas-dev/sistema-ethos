'use client'

import { motion } from "framer-motion"
import { useState } from "react"
import { 
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  BuildingOffice2Icon
} from "@heroicons/react/24/outline"
import { Button } from "../../_components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from '../../_lib/auth/AuthContext'

// Datos de ejemplo - esto vendría de tu API
const occupants = [
  {
    id: 1,
    name: "Manuel Manu",
    type: "Propietario",
    owner: "Manuel Manu",
    status: "No disponible",
    statusType: "Uso de propietario",
    aliquot: "Sin pendientes",
    property: {
      name: "Bodega 01",
      lot: "Lote 2"
    }
  },
  {
    id: 2,
    name: "Uppley",
    type: "Arrendatario",
    owner: "Roberto Campo",
    status: "No disponible",
    statusType: "Uso de arrendatario",
    aliquot: "$1,520",
    property: {
      name: "Ofibodega 15",
      lot: "Lote 7"
    }
  },
  {
    id: 3,
    name: "Mikka SA",
    type: "Propietario",
    owner: "Mikka SA",
    status: "Disponible",
    statusType: "En renta",
    aliquot: "$3,200",
    property: {
      name: "Bodega 43",
      lot: "Lote 4"
    }
  }
]

const projects = ["Almax 3"]
const lots = ["Todos", "Lote 1", "Lote 2", "Lote 3", "Lote 4", "Lote 7"]

export default function OccupantsPage() {
  const router = useRouter()
  const { role } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProject, setSelectedProject] = useState("Almax 3")
  const [selectedLot, setSelectedLot] = useState("Todos")

  // Restringir acceso solo a admin, directorio y jefe operativo
  if (role === 'propietario' || role === 'arrendatario') {
    router.push('/dashboard')
    return null
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedProject("Almax 3")
    setSelectedLot("Todos")
  }

  const filteredOccupants = occupants.filter(occupant => {
    const matchesSearch = 
      occupant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      occupant.property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      occupant.property.lot.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesLot = selectedLot === "Todos" || occupant.property.lot === selectedLot

    return matchesSearch && matchesLot
  })

  const handleViewDetails = (occupantId: number) => {
    router.push(`/dashboard/propietarios/${occupantId}/alicuotas`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Propietarios y ocupantes</h1>
          <p className="text-gray-500 mt-1">Personas y/o negocios que están actualmente en:</p>
        </div>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 border-[#008A4B] text-[#008A4B] hover:bg-[#008A4B] hover:text-white"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          Exportar a Excel
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008A4B]/20 focus:border-[#008A4B]"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <BuildingOffice2Icon className="w-5 h-5 text-gray-400" />
            <select 
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008A4B]/20 focus:border-[#008A4B] bg-white"
            >
              {projects.map((project) => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
          </div>
          <select 
            value={selectedLot}
            onChange={(e) => setSelectedLot(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008A4B]/20 focus:border-[#008A4B] bg-white"
          >
            {lots.map((lot) => (
              <option key={lot} value={lot}>{lot}</option>
            ))}
          </select>
          {(searchQuery || selectedLot !== "Todos") && (
            <Button
              variant="ghost"
              onClick={handleClearFilters}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-5 h-5" />
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500">
        {filteredOccupants.length} resultados
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ocupante
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Propietario
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alícuota por pagar
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Propiedad
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Ver detalles</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOccupants.map((occupant) => (
              <tr key={occupant.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{occupant.name}</div>
                    {occupant.type !== "Propietario" && (
                      <div className="text-sm text-gray-500">{occupant.type}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{occupant.owner}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">{occupant.status}</div>
                    <div className="text-sm text-gray-500">{occupant.statusType}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm ${occupant.aliquot === "Sin pendientes" ? "text-green-600" : "text-red-600"}`}>
                    {occupant.aliquot}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">{occupant.property.name}</div>
                    <div className="text-sm text-gray-500">{occupant.property.lot}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <Button 
                    variant="ghost" 
                    className="text-[#008A4B] hover:text-[#006837]"
                    onClick={() => handleViewDetails(occupant.id)}
                  >
                    Ver detalles
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
} 
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FunnelIcon } from "@heroicons/react/24/outline"

interface FilterProps {
  role: "jefeOperativo" | "administrador" | "directorio" | "propietario" | "arrendatario"
  onFilterChange: (filters: any) => void
}

const businessUnits = ["U1", "U2", "U3"]
const projects = ["Almax 1", "Almax 2", "Almax 3"]
const deliveryStatuses = ["Entregado", "No entregado"]
const rentalStatuses = ["Disponible", "Alquilado", "En uso"]
const occupantTypes = ["Propietario", "Arrendatario", "Ocupante"]

export function PropertyDirectoryFilters({ role, onFilterChange }: FilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    businessUnit: "",
    project: "",
    deliveryStatus: "",
    rentalStatus: "",
    occupantType: "",
    showContacts: false
  })

  const handleFilterChange = (key: string, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  // Determinar qué filtros mostrar según el rol
  const showBusinessUnitFilter = role === "directorio"
  const showProjectFilter = ["directorio", "administrador"].includes(role)
  const showOccupantTypeFilter = ["directorio", "administrador"].includes(role)

  return (
    <div className="mb-6">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-emerald-600 font-medium"
      >
        <FunnelIcon className="w-5 h-5" />
        Filtros
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-6 bg-white rounded-xl shadow-lg border border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {showBusinessUnitFilter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidad de negocio
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={filters.businessUnit}
                onChange={(e) => handleFilterChange("businessUnit", e.target.value)}
              >
                <option value="">Todas</option>
                {businessUnits.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          )}

          {showProjectFilter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proyecto
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={filters.project}
                onChange={(e) => handleFilterChange("project", e.target.value)}
              >
                <option value="">Todos</option>
                {projects.map((project) => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado de entrega
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={filters.deliveryStatus}
              onChange={(e) => handleFilterChange("deliveryStatus", e.target.value)}
            >
              <option value="">Todos</option>
              {deliveryStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado de arrendamiento
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={filters.rentalStatus}
              onChange={(e) => handleFilterChange("rentalStatus", e.target.value)}
            >
              <option value="">Todos</option>
              {rentalStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {showOccupantTypeFilter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de ocupante
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={filters.occupantType}
                onChange={(e) => handleFilterChange("occupantType", e.target.value)}
              >
                <option value="">Todos</option>
                {occupantTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          )}

          {["administrador", "directorio", "jefeOperativo"].includes(role) && (
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.showContacts}
                  onChange={(e) => handleFilterChange("showContacts", e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Mostrar información de contacto
                </span>
              </label>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
} 
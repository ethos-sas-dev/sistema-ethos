'use client'

import { motion } from "framer-motion"
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ChevronRightIcon,
  XMarkIcon,
  PlusIcon
} from "@heroicons/react/24/outline"
import { Button } from "../../_components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from '../../_lib/auth/AuthContext'
import { useState } from 'react'

// Datos de ejemplo - esto vendría de tu API
const allProperties = [
  {
    id: 1,
    name: "Bodega 01",
    lot: "Lote 1",
    type: "Industrial",
    location: "Zona Norte, Ciudad",
    area: "450 m²",
    businessUnit: "U1",
    projectId: "P1",
    projectName: "Almax 3",
    assignedAdmin: "Juan Pérez",
    status: "En venta",
    image: "/bodega.png"
  },
  {
    id: 2,
    name: "Bodega 02",
    lot: "Lote 2",
    type: "Industrial",
    location: "Zona Sur, Ciudad",
    area: "520 m²",
    businessUnit: "U2",
    projectId: "P2",
    projectName: "Centro Empresarial Sur",
    assignedAdmin: "Juan Pérez",
    status: "En renta",
    image: "/bodega.png"
  },
  {
    id: 3,
    name: "Bodega 03",
    lot: "Lote 3",
    type: "Industrial",
    location: "Zona Este, Ciudad",
    area: "380 m²",
    businessUnit: "U3",
    projectId: "P3",
    projectName: "Plaza Central",
    assignedAdmin: "Carlos Ruiz",
    status: "Disponible",
    image: "/bodega.png"
  }
]

export default function DirectoryPage() {
  const { role } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUnit, setSelectedUnit] = useState("Todas")
  const [selectedStatus, setSelectedStatus] = useState("Todos")

  // El jefe operativo no puede ver esta página
  if (role === 'jefeOperativo') {
    router.push('/dashboard')
    return null
  }

  // Filtrar propiedades según el rol
  const getFilteredProperties = () => {
    let properties = allProperties

    // Si es admin, solo ve las propiedades de proyectos asignados a él
    if (role === 'administrador') {
      properties = properties.filter(prop => prop.assignedAdmin === "Juan Pérez") // Ejemplo, esto vendría de la sesión del usuario
    }
    
    // Si es propietario o arrendatario, solo ve las propiedades de su proyecto
    if (role === 'propietario' || role === 'arrendatario') {
      properties = properties.filter(prop => prop.projectId === "P1") // Ejemplo, esto vendría de la sesión del usuario
    }

    // Aplicar filtros de búsqueda
    return properties.filter(prop => {
      const matchesSearch = 
        prop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prop.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prop.projectName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesUnit = selectedUnit === "Todas" || prop.businessUnit === selectedUnit
      const matchesStatus = selectedStatus === "Todos" || prop.status === selectedStatus

      return matchesSearch && matchesUnit && matchesStatus
    })
  }

  const filteredProperties = getFilteredProperties()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-[1400px] mx-auto"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">Directorio de Propiedades</h1>
            <div className="inline-flex items-center gap-1.5 bg-[#008A4B]/10 text-[#008A4B] text-sm font-medium px-2.5 py-1 rounded-lg">
              {filteredProperties.length} propiedades
            </div>
          </div>
          <p className="text-gray-500 mt-1">
            Explora todas las propiedades disponibles
          </p>
        </div>
        {(role === 'administrador' || role === 'directorio') && (
          <Button 
            className="bg-[#008A4B] hover:bg-[#006837] flex items-center gap-2"
            onClick={() => router.push('/dashboard/directorio/propiedades/nueva')}
          >
            <PlusIcon className="w-4 h-4" />
            Nueva Propiedad
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-gray-700">Filtros de búsqueda</h2>
          {(searchQuery || selectedUnit !== "Todas" || selectedStatus !== "Todos") && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchQuery("")
                setSelectedUnit("Todas")
                setSelectedStatus("Todos")
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-4 h-4 mr-2" />
              Limpiar filtros
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o ubicación..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008A4B]/20 focus:border-[#008A4B]"
            />
          </div>
          
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008A4B]/20 focus:border-[#008A4B] bg-white"
          >
            <option value="Todas">Todas las unidades</option>
            <option value="U1">Unidad 1</option>
            <option value="U2">Unidad 2</option>
            <option value="U3">Unidad 3</option>
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008A4B]/20 focus:border-[#008A4B] bg-white"
          >
            <option value="Todos">Todos los estados</option>
            <option value="En venta">En venta</option>
            <option value="En renta">En renta</option>
            <option value="Disponible">Disponible</option>
          </select>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <Link href={`/dashboard/directorio/${property.id}`} key={property.id}>
            <motion.div
              className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-shadow group"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative h-48">
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm">
                    {property.area}
                  </div>
                  {(role === 'administrador' || role === 'directorio') && (
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm text-[#008A4B]">
                      Unidad {property.businessUnit.slice(1)}
                    </div>
                  )}
                </div>
                <img
                  src={property.image}
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#008A4B] transition-colors">
                      {property.name}
                      <span className="text-gray-500 font-normal"> · {property.lot}</span>
                    </h3>
                    <p className="text-sm text-gray-500">{property.projectName}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-medium
                    ${property.status === 'Disponible' ? 'bg-green-100 text-green-800' : 
                      property.status === 'En renta' ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'}`}
                  >
                    {property.status}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPinIcon className="w-4 h-4" />
                    <span className="text-sm">{property.location}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  )
} 
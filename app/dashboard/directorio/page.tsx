"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  ArrowDownTrayIcon, 
  TableCellsIcon, 
  Squares2X2Icon,
  MapPinIcon
} from "@heroicons/react/24/outline"
import { useAuth } from "../../_lib/auth/AuthContext"
import { PropertyDirectoryFilters } from "../_components/PropertyDirectoryFilters"

// Datos de ejemplo
const mockProperties = [
  {
    id: "1",
    businessUnit: "U1",
    project: "Almax 1",
    lote: "1",
    name: "Bodega 10",
    type: "bodega",
    deliveryStatus: "Entregado",
    rentalStatus: "Alquilado",
    occupantType: "Arrendatario",
    occupantName: "Importadora XYZ",
    occupantId: "0992345678001",
    occupantEmail: "contacto@xyz.com",
    occupantPhone: "(04) 234-5678",
    businessActivity: "Importación y distribución de repuestos",
    ownerName: "Juan Pérez",
    ownerId: "0912345678",
    ownerEmail: "juan@email.com",
    ownerPhone: "(09) 987-6543",
    image: "/bodega.png"
  },
  {
    id: "2",
    businessUnit: "U2",
    project: "Almax 2",
    lote: "3",
    name: "Ofibodega 23",
    type: "ofibodega",
    deliveryStatus: "Entregado",
    rentalStatus: "En uso",
    occupantType: "Propietario",
    occupantName: "María González",
    occupantId: "0987654321001",
    occupantEmail: "maria@email.com",
    occupantPhone: "(04) 567-8901",
    businessActivity: "Oficinas administrativas y almacén",
    ownerName: "María González",
    ownerId: "0987654321",
    ownerEmail: "maria@email.com",
    ownerPhone: "(09) 876-5432",
    image: "/bodega.png"
  }
]

export default function DirectorioPage() {
  const { role } = useAuth()
  const router = useRouter()
  const [filteredProperties, setFilteredProperties] = useState(mockProperties)
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")

  // Simular el proyecto del usuario (en producción vendría del contexto de autenticación)
  const userProject = role === "propietario" || role === "arrendatario" ? "Almax 1" : null

  useEffect(() => {
    // Verificar acceso
    const allowedRoles = ["jefeOperativo", "administrador", "directorio", "propietario", "arrendatario"]
    if (!allowedRoles.includes(role)) {
      router.push("/dashboard")
    }

    // Filtrar propiedades por proyecto si es propietario o arrendatario
    if (userProject) {
      setFilteredProperties(mockProperties.filter(p => p.project === userProject))
    }
  }, [role, router, userProject])

  if (!["jefeOperativo", "administrador", "directorio", "propietario", "arrendatario"].includes(role)) return null

  const handleFilterChange = (filters: any) => {
    let filtered = userProject ? 
      mockProperties.filter(p => p.project === userProject) : 
      mockProperties

    if (filters.businessUnit) {
      filtered = filtered.filter(p => p.businessUnit === filters.businessUnit)
    }
    if (filters.project && !userProject) { // Solo aplicar filtro de proyecto si no es propietario/arrendatario
      filtered = filtered.filter(p => p.project === filters.project)
    }
    if (filters.deliveryStatus) {
      filtered = filtered.filter(p => p.deliveryStatus === filters.deliveryStatus)
    }
    if (filters.rentalStatus) {
      filtered = filtered.filter(p => p.rentalStatus === filters.rentalStatus)
    }
    if (filters.occupantType) {
      filtered = filtered.filter(p => p.occupantType === filters.occupantType)
    }

    setFilteredProperties(filtered)
  }

  const handleExportCSV = () => {
    // Preparar los datos según el rol
    const getData = (property: any) => {
      const baseData = {
        "Unidad de negocio": property.businessUnit,
        "Proyecto": property.project,
        "Lote": property.lote,
        "Bodega": property.name,
        "Estado de entrega": property.deliveryStatus,
        "Estado de arrendamiento": property.rentalStatus,
        "Actividad del negocio": property.businessActivity,
      }

      const data = role === "jefeOperativo" ? {
        ...baseData,
        "Nombre del ocupante": property.occupantName,
        "RUC/CI ocupante": property.occupantId,
        "Correo del propietario": property.ownerEmail,
        "Teléfono del propietario": property.ownerPhone,
      } : {
        ...baseData,
        "Tipo de ocupante": property.occupantType,
        "Nombre": property.occupantName,
        "RUC/CI": property.occupantId,
        "Correo": property.occupantEmail,
        "Teléfono": property.occupantPhone,
      }

      return data as Record<string, string>
    }

    const csvData = filteredProperties.map(getData)
    const headers = Object.keys(csvData[0])
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "directorio-propiedades-ethos.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Determinar si el usuario puede exportar
  const canExport = ["jefeOperativo", "administrador", "directorio"].includes(role)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Directorio de Propiedades</h1>
          {userProject && (
            <p className="text-sm text-gray-500 mt-1">
              Mostrando propiedades de {userProject}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "table" 
                  ? "bg-white text-emerald-600 shadow-sm" 
                  : "text-gray-600 hover:text-emerald-600"
              }`}
            >
              <TableCellsIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "cards" 
                  ? "bg-white text-emerald-600 shadow-sm" 
                  : "text-gray-600 hover:text-emerald-600"
              }`}
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
          </div>
          {canExport && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportCSV}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-emerald-700 transition-colors"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              Exportar
            </motion.button>
          )}
        </div>
      </div>

      <PropertyDirectoryFilters 
        role={role as "jefeOperativo" | "administrador" | "directorio"} 
        onFilterChange={handleFilterChange} 
      />

      {viewMode === "table" ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {role === "directorio" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unidad de negocio
                    </th>
                  )}
                  {(role === "directorio" || role === "administrador") && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proyecto
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lote
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bodega
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ocupante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RUC/CI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    {role === "directorio" && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {property.businessUnit}
                      </td>
                    )}
                    {(role === "directorio" || role === "administrador") && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {property.project}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {property.lote}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {property.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${property.rentalStatus === 'Disponible' ? 'bg-green-100 text-green-800' :
                          property.rentalStatus === 'Alquilado' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {property.rentalStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {property.occupantName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {property.occupantId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        <div>{property.occupantEmail}</div>
                        <div>{property.occupantPhone}</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <motion.div
              key={property.id}
              className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-shadow group"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative h-48">
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm">
                    Lote {property.lote}
                  </div>
                  {(role === "administrador" || role === "directorio") && (
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm text-emerald-600">
                      {property.businessUnit}
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
                    <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                      {property.name}
                      <span className="text-gray-500 font-normal ml-2">· {property.project}</span>
                    </h3>
                    <p className="text-sm text-gray-500">{property.businessActivity}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${property.rentalStatus === 'Disponible' ? 'bg-green-100 text-green-800' :
                      property.rentalStatus === 'Alquilado' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {property.rentalStatus}
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPinIcon className="w-4 h-4" />
                    <span className="text-sm">{property.occupantName}</span>
                  </div>
                  {property.occupantPhone && (
                    <div className="text-sm text-gray-500">
                      {property.occupantPhone}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
} 
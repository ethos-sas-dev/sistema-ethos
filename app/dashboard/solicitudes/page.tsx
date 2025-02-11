'use client'

import { motion } from "framer-motion"
import { Button } from "../../_components/ui/button"
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  BuildingOffice2Icon,
  ArrowRightIcon
} from "@heroicons/react/24/outline"
import { useAuth } from '../../_lib/auth/AuthContext'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

// Datos de ejemplo - esto vendría de tu API
const requestsData = {
  administrador: [
    {
      id: "A001",
      type: "Renta",
      estado: "Certificado de Expensas Pendiente",
      siguienteAccion: "Subir certificado expensas",
      propiedad: {
        name: "Bodega 01",
        lot: "Lote 2"
      },
      propietario: "Manuel Jimenez"
    },
    {
      id: "A003",
      type: "Documento",
      estado: "Pendiente Revisión",
      siguienteAccion: "Revisar documento",
      propiedad: {
        name: "Bodega 02",
        lot: "Lote 2"
      },
      propietario: "Rosario Diaz"
    }
  ],
  propietario: [
    {
      id: "A001",
      type: "Renta",
      estado: "Pendiente Certificado Expensas",
      siguienteAccion: "En espera de Admin",
      propiedad: {
        name: "Bodega 01",
        lot: "Lote 2"
      },
      propietario: "Manuel Jimenez"
    },
    {
      id: "A003",
      type: "Venta",
      estado: "Certificado de Expensas Rechazado",
      siguienteAccion: "Solicitar plan de pagos",
      propiedad: {
        name: "Bodega 02",
        lot: "Lote 7"
      },
      propietario: "Manuel Jimenez"
    },
    {
      id: "A004",
      type: "Venta",
      estado: "Plan de Pago Aprobado",
      siguienteAccion: "Subir acuerdo compraventa",
      propiedad: {
        name: "Bodega 03",
        lot: "Lote 4"
      },
      propietario: "Manuel Jimenez"
    },
    {
      id: "A006",
      type: "Venta",
      estado: "Plan de Pago Solicitado para Discusión",
      siguienteAccion: "En espera de Admin",
      propiedad: {
        name: "Bodega 05",
        lot: "Lote 11"
      },
      propietario: "Manuel Jimenez"
    },
    {
      id: "A006",
      type: "Venta",
      estado: "Acuerdo de Plan de pago Confirmado",
      siguienteAccion: "Subir documentación del plan acordado",
      propiedad: {
        name: "Bodega 10",
        lot: "Lote 6"
      },
      propietario: "Manuel Jimenez"
    }
  ],
  arrendatario: [
    {
      id: "R001",
      type: "Mantenimiento",
      estado: "Pendiente Revisión",
      siguienteAccion: "En espera de Admin",
      propiedad: {
        name: "Bodega 01",
        lot: "Lote 2"
      },
      propietario: "Manuel Jimenez"
    },
    {
      id: "R002",
      type: "Documento",
      estado: "Documentación Incompleta",
      siguienteAccion: "Subir documentos faltantes",
      propiedad: {
        name: "Bodega 01",
        lot: "Lote 2"
      },
      propietario: "Manuel Jimenez"
    }
  ]
}

export default function RequestsPage() {
  const { role } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProperty, setSelectedProperty] = useState("Todas")
  const [selectedStatus, setSelectedStatus] = useState("Todos")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)

  // Solo admin, directorio, propietario y arrendatario pueden ver esta página
  if (role === 'jefeOperativo') {
    router.push('/dashboard')
    return null
  }

  // Obtener las solicitudes según el rol
  const getRequests = () => {
    if (role === 'directorio') return requestsData.administrador
    if (role === 'administrador') return requestsData.administrador
    if (role === 'propietario') return requestsData.propietario
    if (role === 'arrendatario') return requestsData.arrendatario
    return []
  }

  const currentRequests = getRequests()

  const handleAction = (request: any) => {
    if (request.siguienteAccion === 'Subir certificado expensas') {
      setSelectedRequest(request)
      setShowUploadModal(true)
    }
  }

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
            <h1 className="text-2xl font-semibold text-gray-900">Solicitudes</h1>
            <div className="inline-flex items-center gap-1.5 bg-[#008A4B]/10 text-[#008A4B] text-sm font-medium px-2.5 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-[#008A4B] animate-pulse" />
              {currentRequests.length} activas
            </div>
          </div>
          <p className="text-gray-500 mt-1">
            {role === 'propietario' || role === 'arrendatario' 
              ? 'Aquí se encuentran tus solicitudes, sus estados y acciones pendientes'
              : 'Aquí se encuentran solicitudes, sus estados y acciones pendientes'
            }
          </p>
        </div>
        {(role === 'administrador' || role === 'directorio') && (
          <Button 
            variant="outline" 
            className="flex items-center gap-2 border-[#008A4B] text-[#008A4B] hover:bg-[#008A4B] hover:text-white"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Exportar a Excel
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-gray-700">Filtros de búsqueda</h2>
          {(searchQuery || selectedProperty !== "Todas" || selectedStatus !== "Todos") && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchQuery("")
                setSelectedProperty("Todas")
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
              placeholder="Buscar por ID o propietario..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008A4B]/20 focus:border-[#008A4B]"
            />
          </div>
          
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008A4B]/20 focus:border-[#008A4B] bg-white"
          >
            <option value="Todas">Todas las propiedades</option>
            <option value="Bodega01">Bodega 01</option>
            <option value="Bodega02">Bodega 02</option>
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008A4B]/20 focus:border-[#008A4B] bg-white"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="EnProceso">En proceso</option>
            <option value="Completado">Completado</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tipo
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Estado
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Siguiente Acción
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Propiedad
              </th>
              {(role === 'administrador' || role === 'directorio') && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Propietario
                </th>
              )}
              <th scope="col" className="relative px-4 py-3">
                <span className="sr-only">Ver solicitud</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 text-sm font-medium text-gray-900">
                  {request.id}
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">
                  {request.type}
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">
                  {request.estado}
                </td>
                <td className="px-4 py-4">
                  {request.siguienteAccion === 'En espera de Admin' ? (
                    <span className="text-sm text-gray-500">{request.siguienteAccion}</span>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-[#008A4B] hover:bg-[#008A4B] hover:text-white border-[#008A4B]"
                      onClick={() => handleAction(request)}
                    >
                      {request.siguienteAccion}
                    </Button>
                  )}
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">
                  <div>
                    {request.propiedad.name}
                    <div className="text-xs text-gray-400">{request.propiedad.lot}</div>
                  </div>
                </td>
                {(role === 'administrador' || role === 'directorio') && (
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {request.propietario}
                  </td>
                )}
                <td className="px-4 py-4 text-right text-sm font-medium">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push(`/dashboard/solicitudes/${request.id}`)}
                    className="text-[#008A4B] hover:text-[#006837]"
                  >
                    Ver solicitud
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-xl"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Nuevo Certificado Expensas
                </h2>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-[#008A4B]/10 text-[#008A4B] text-xs font-medium rounded">
                      ID: {selectedRequest?.id}
                    </span>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                      TIPO ARRIENDO
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm flex items-center gap-2">
                    <BuildingOffice2Icon className="w-4 h-4" />
                    {selectedRequest?.propiedad.name} - {selectedRequest?.propiedad.lot}
                  </p>
                </div>
              </div>
              <motion.button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-500 p-1 hover:bg-gray-100 rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <XMarkIcon className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="space-y-6">
              {/* Upload Area */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 transition-colors duration-200
                  hover:border-[#008A4B] hover:bg-[#008A4B]/5 group cursor-pointer"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="mb-3 p-3 bg-[#008A4B]/10 rounded-full"
                  >
                    <ArrowUpTrayIcon className="w-6 h-6 text-[#008A4B]" />
                  </motion.div>
                  <h3 className="text-base font-medium text-gray-900 mb-1">
                    Sube o arrastra tu documento aquí
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    PDF o Word hasta 10MB
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx"
                  />
                  <motion.div
                    className="inline-flex items-center gap-2 text-[#008A4B] font-medium text-sm
                      group-hover:text-[#006837]"
                    whileHover={{ x: 5 }}
                  >
                    Seleccionar archivo
                    <ArrowRightIcon className="w-4 h-4" />
                  </motion.div>
                </div>
              </div>

              {/* Estado y Comentarios */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Estado de aprobación
                  </label>
                  <select 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
                      focus:ring-[#008A4B]/20 focus:border-[#008A4B] bg-white text-sm text-gray-900
                      appearance-none cursor-pointer hover:border-[#008A4B] transition-colors"
                  >
                    <option value="">Seleccionar estado</option>
                    <option value="aprobado">Aprobado</option>
                    <option value="rechazado">Rechazado</option>
                    <option value="pendiente">Pendiente de revisión</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Comentarios
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
                      focus:ring-[#008A4B]/20 focus:border-[#008A4B] text-sm text-gray-900
                      hover:border-[#008A4B] transition-colors resize-none"
                    placeholder="Escribir razón de rechazo o cualquier otro comentario"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 justify-end border-t pt-4 mt-6">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    onClick={() => setShowUploadModal(false)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    Lo haré luego
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="bg-[#008A4B] hover:bg-[#006837] text-white px-6 text-sm"
                  >
                    Subir documento
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
} 
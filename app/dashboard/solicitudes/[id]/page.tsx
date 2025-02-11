'use client'

import { motion } from "framer-motion"
import { Button } from "../../../_components/ui/button"
import { 
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  BuildingOffice2Icon,
  UserIcon,
  ClockIcon
} from "@heroicons/react/24/outline"
import { useRouter } from 'next/navigation'

// Datos de ejemplo - esto vendría de tu API
const requestDetail = {
  id: "A001",
  type: "Renta",
  propiedad: {
    name: "Bodega 01",
    lot: "Lote 2"
  },
  responsable: "Administrador",
  estado: "Pendiente Certificado Expensas",
  historial: [
    {
      paso: 1,
      descripcion: "Solicitud de Expensas Creada",
      fecha: "02/02/24",
      estado: "Completado"
    },
    {
      paso: 2,
      descripcion: "Pendiente Certificado Expensas",
      fecha: null,
      estado: "En proceso"
    }
  ]
}

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-[1400px] mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Detalles de Solicitud
            </h1>
            <p className="text-gray-500 mt-1">
              ID: {params.id}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 border-[#008A4B] text-[#008A4B] hover:bg-[#008A4B] hover:text-white"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Exportar a Excel
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 border-[#008A4B] text-[#008A4B] hover:bg-[#008A4B] hover:text-white"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Descargar PDF
          </Button>
        </div>
      </div>

      {/* Detalles */}
      <div className="bg-white rounded-xl border p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Tipo</h3>
              <p className="mt-1 text-lg text-gray-900">{requestDetail.type}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Propiedad</h3>
              <p className="mt-1 text-lg text-gray-900 flex items-center gap-2">
                <BuildingOffice2Icon className="w-5 h-5 text-gray-400" />
                {requestDetail.propiedad.name} - {requestDetail.propiedad.lot}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Responsable</h3>
              <p className="mt-1 text-lg text-gray-900 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-gray-400" />
                {requestDetail.responsable}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Estado</h3>
              <p className="mt-1">
                <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1.5 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                  {requestDetail.estado}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Historial */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Historial de Pasos</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Paso
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Historial
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fecha
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requestDetail.historial.map((paso) => (
              <tr key={paso.paso} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {paso.paso}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {paso.descripcion}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {paso.fecha ? (
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4" />
                      {paso.fecha}
                    </div>
                  ) : '-'}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg
                    ${paso.estado === 'Completado' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full 
                      ${paso.estado === 'Completado' ? 'bg-green-400' : 'bg-yellow-400'}`} 
                    />
                    {paso.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
} 
"use client"

import { motion } from "framer-motion"
import { BuildingOffice2Icon, CurrencyDollarIcon, UserIcon, InformationCircleIcon } from "@heroicons/react/24/outline"

interface PropertyDetails {
  id: string
  lote: string
  name: string
  type: "bodega" | "ofibodega"
  address: string
  totalAmount: number
  dueDate: string
  isRented?: boolean
  tenant?: {
    name: string
    phone: string
  }
  fees: {
    concept: string
    amount: number
  }[]
}

interface PropertySummaryProps {
  property: PropertyDetails
  viewMode: "owner" | "tenant"
}

export function PropertySummary({ property, viewMode }: PropertySummaryProps) {
  const shouldShowFees = viewMode === "tenant" || !property.isRented

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className="p-3 bg-emerald-100 rounded-lg">
            <BuildingOffice2Icon className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">{property.name}</h3>
              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full font-medium">
                {property.type === "bodega" ? "Bodega" : "Ofibodega"}
              </span>
            </div>
            <p className="text-sm text-gray-500">Lote {property.lote}</p>
            <p className="text-sm text-gray-500">{property.address}</p>
          </div>
        </div>
        {(!property.isRented || viewMode === "tenant") && (
          <div className="text-right">
            <p className="text-sm text-gray-500">Próximo pago</p>
            <p className="text-lg font-semibold text-gray-900">
              ${property.totalAmount.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">Vence: {property.dueDate}</p>
          </div>
        )}
      </div>

      {viewMode === "owner" && property.isRented && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-3">
          <div className="flex items-start gap-3">
            <UserIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Alquilada a:</p>
              <p className="text-sm text-blue-700">{property.tenant?.name}</p>
              <p className="text-sm text-blue-600">{property.tenant?.phone}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 border-t border-blue-100 pt-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Información de pagos</p>
              <p className="text-sm text-blue-700">
                Las alícuotas de esta propiedad son responsabilidad del arrendatario.
                Monto actual: ${property.totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {shouldShowFees && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Desglose de alícuota</h4>
          <div className="space-y-2">
            {property.fees.map((fee, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{fee.concept}</span>
                <span className="font-medium text-gray-900">${fee.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-6 w-full bg-emerald-50 text-emerald-600 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
      >
        <CurrencyDollarIcon className="w-5 h-5" />
        Ver detalle completo
      </motion.button>
    </motion.div>
  )
} 
"use client"

import { motion } from "framer-motion"
import { CurrencyDollarIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline"

interface Fee {
  concept: string
  currentAmount: number
  proposedAmount: number
}

export interface RateChange {
  id: string
  lote: string
  propertyName: string
  type: "bodega" | "ofibodega"
  status: "pending" | "approved" | "rejected"
  requestDate: string
  effectiveDate: string
  requestedBy: string
  fees: Fee[]
}

interface RateChangeCardProps {
  rateChange: RateChange
  viewMode: "administrador" | "directorio"
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
}

export function RateChangeCard({ rateChange, viewMode, onApprove, onReject }: RateChangeCardProps) {
  const totalCurrentAmount = rateChange.fees.reduce((sum, fee) => sum + fee.currentAmount, 0)
  const totalProposedAmount = rateChange.fees.reduce((sum, fee) => sum + fee.proposedAmount, 0)
  const percentageChange = ((totalProposedAmount - totalCurrentAmount) / totalCurrentAmount) * 100

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{rateChange.propertyName}</h3>
            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full font-medium">
              {rateChange.type === "bodega" ? "Bodega" : "Ofibodega"}
            </span>
          </div>
          <p className="text-sm text-gray-500">Lote {rateChange.lote}</p>
          <p className="text-sm text-gray-500">Solicitado por: {rateChange.requestedBy}</p>
          <p className="text-sm text-gray-500">Fecha efectiva: {rateChange.effectiveDate}</p>
        </div>
        <div className="text-right">
          <div className={`px-3 py-1 rounded-full text-sm font-medium
            ${rateChange.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 
              rateChange.status === 'approved' ? 'bg-green-50 text-green-700' : 
              'bg-red-50 text-red-700'}`}
          >
            {rateChange.status === 'pending' ? 'Pendiente' : 
             rateChange.status === 'approved' ? 'Aprobado' : 'Rechazado'}
          </div>
          <p className={`mt-2 text-lg font-semibold ${percentageChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Desglose de cambios</h4>
        <div className="space-y-3">
          {rateChange.fees.map((fee, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{fee.concept}</span>
              <div className="flex items-center gap-3">
                <span className="text-gray-500">${fee.currentAmount.toFixed(2)}</span>
                <span className="text-gray-400">→</span>
                <span className="font-medium text-gray-900">${fee.proposedAmount.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {viewMode === "directorio" && rateChange.status === "pending" && (
        <div className="mt-6 flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onApprove?.(rateChange.id)}
            className="flex-1 bg-emerald-50 text-emerald-600 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
          >
            <CheckIcon className="w-5 h-5" />
            Aprobar
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onReject?.(rateChange.id)}
            className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
            Rechazar
          </motion.button>
        </div>
      )}
    </motion.div>
  )
} 
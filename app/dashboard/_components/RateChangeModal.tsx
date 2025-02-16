"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { XMarkIcon } from "@heroicons/react/24/outline"
import type { RateChange } from "./RateChangeCard"

interface Property {
  id: string
  lote: string
  name: string
  type: "bodega" | "ofibodega"
  currentFees: {
    concept: string
    amount: number
  }[]
}

interface RateChangeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (rateChange: Omit<RateChange, "id" | "status" | "requestDate">) => void
  properties: Property[]
}

export function RateChangeModal({ isOpen, onClose, onSubmit, properties }: RateChangeModalProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [effectiveDate, setEffectiveDate] = useState("")
  const [proposedFees, setProposedFees] = useState<{concept: string, amount: number}[]>([])

  const handlePropertySelect = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId)
    if (property) {
      setSelectedProperty(property)
      setProposedFees(property.currentFees.map(fee => ({ ...fee })))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProperty || !effectiveDate) return

    const rateChange: Omit<RateChange, "id" | "status" | "requestDate"> = {
      lote: selectedProperty.lote,
      propertyName: selectedProperty.name,
      type: selectedProperty.type,
      effectiveDate,
      requestedBy: "Juan Pérez", // En producción, esto vendría del usuario autenticado
      fees: selectedProperty.currentFees.map((currentFee, index) => ({
        concept: currentFee.concept,
        currentAmount: currentFee.amount,
        proposedAmount: proposedFees[index].amount
      }))
    }

    onSubmit(rateChange)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden"
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Proponer cambio de tasa</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar propiedad
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                onChange={(e) => handlePropertySelect(e.target.value)}
                value={selectedProperty?.id || ""}
                required
              >
                <option value="">Seleccione una propiedad</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name} - Lote {property.lote}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha efectiva
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                required
              />
            </div>

            {selectedProperty && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Tasas propuestas</h3>
                <div className="space-y-4">
                  {proposedFees.map((fee, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <span className="text-sm text-gray-600 flex-1">{fee.concept}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                          ${selectedProperty.currentFees[index].amount.toFixed(2)}
                        </span>
                        <span className="text-gray-400">→</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="border border-gray-300 rounded-lg px-3 py-1 w-24"
                          value={fee.amount}
                          onChange={(e) => {
                            const newFees = [...proposedFees]
                            newFees[index].amount = parseFloat(e.target.value) || 0
                            setProposedFees(newFees)
                          }}
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Proponer cambio
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
} 
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "../../_lib/auth/AuthContext"
import { RateChangeCard, RateChange } from "../_components/RateChangeCard"
import { RateChangeModal } from "../_components/RateChangeModal"
import { PlusIcon } from "@heroicons/react/24/outline"

// Datos de ejemplo de propiedades - En producción, estos vendrían de una API
const mockProperties = [
  {
    id: "1",
    lote: "A-12",
    name: "Bodega 10",
    type: "bodega" as const,
    currentFees: [
      { concept: "Mantenimiento", amount: 150.00 },
      { concept: "Seguridad", amount: 50.00 },
      { concept: "Servicios comunes", amount: 50.00 }
    ]
  },
  {
    id: "2",
    lote: "B-05",
    name: "Ofibodega 23",
    type: "ofibodega" as const,
    currentFees: [
      { concept: "Mantenimiento", amount: 200.00 },
      { concept: "Seguridad", amount: 100.00 },
      { concept: "Servicios comunes", amount: 50.00 }
    ]
  }
]

// Datos de ejemplo de cambios de tasa - En producción, estos vendrían de una API
const mockRateChanges: RateChange[] = [
  {
    id: "1",
    lote: "A-12",
    propertyName: "Bodega 10",
    type: "bodega",
    status: "pending",
    requestDate: "2024-03-20",
    effectiveDate: "2024-05-01",
    requestedBy: "Juan Pérez",
    fees: [
      { 
        concept: "Mantenimiento",
        currentAmount: 150.00,
        proposedAmount: 175.00
      },
      {
        concept: "Seguridad",
        currentAmount: 50.00,
        proposedAmount: 60.00
      },
      {
        concept: "Servicios comunes",
        currentAmount: 50.00,
        proposedAmount: 50.00
      }
    ]
  },
  {
    id: "2",
    lote: "B-05",
    propertyName: "Ofibodega 23",
    type: "ofibodega",
    status: "approved",
    requestDate: "2024-03-15",
    effectiveDate: "2024-04-01",
    requestedBy: "María González",
    fees: [
      {
        concept: "Mantenimiento",
        currentAmount: 200.00,
        proposedAmount: 220.00
      },
      {
        concept: "Seguridad",
        currentAmount: 100.00,
        proposedAmount: 100.00
      },
      {
        concept: "Servicios comunes",
        currentAmount: 50.00,
        proposedAmount: 60.00
      }
    ]
  }
]

export default function TasasPage() {
  const { role } = useAuth()
  const router = useRouter()
  const [rateChanges, setRateChanges] = useState<RateChange[]>(mockRateChanges)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (role !== "administrador" && role !== "directorio") {
      router.push("/dashboard")
    }
  }, [role, router])

  if (role !== "administrador" && role !== "directorio") return null

  const handleApprove = (id: string) => {
    setRateChanges(prev => 
      prev.map(change => 
        change.id === id ? { ...change, status: "approved" } : change
      )
    )
  }

  const handleReject = (id: string) => {
    setRateChanges(prev => 
      prev.map(change => 
        change.id === id ? { ...change, status: "rejected" } : change
      )
    )
  }

  const handleSubmitRateChange = (rateChange: Omit<RateChange, "id" | "status" | "requestDate">) => {
    const newRateChange: RateChange = {
      ...rateChange,
      id: (rateChanges.length + 1).toString(),
      status: "pending",
      requestDate: new Date().toISOString().split('T')[0]
    }
    setRateChanges(prev => [newRateChange, ...prev])
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {role === "administrador" ? "Gestión de Tasas" : "Aprobación de Tasas"}
        </h1>
        {role === "administrador" && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-emerald-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Proponer cambio de tasa
          </motion.button>
        )}
      </div>

      <div className="space-y-6">
        {rateChanges.map((rateChange) => (
          <RateChangeCard
            key={rateChange.id}
            rateChange={rateChange}
            viewMode={role as "administrador" | "directorio"}
            onApprove={role === "directorio" ? handleApprove : undefined}
            onReject={role === "directorio" ? handleReject : undefined}
          />
        ))}
      </div>

      {rateChanges.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay cambios de tasas pendientes</p>
        </div>
      )}

      {role === "administrador" && (
        <RateChangeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmitRateChange}
          properties={mockProperties}
        />
      )}
    </div>
  )
} 
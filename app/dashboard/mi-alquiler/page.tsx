"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "../../_lib/auth/AuthContext"
import { PropertySummary } from "../_components/PropertySummary"

// Datos de ejemplo - En producción, estos vendrían de una API
const mockRentals = [
  {
    id: "1",
    lote: "A-12",
    name: "Bodega 10",
    type: "bodega" as const,
    address: "Parque Industrial Ethos, Sector A",
    totalAmount: 280.00,
    dueDate: "2024-04-15",
    fees: [
      { concept: "Alícuota de condominio", amount: 180.00 },
      { concept: "Fondo de reserva", amount: 50.00 },
      { concept: "Servicios comunes", amount: 50.00 }
    ]
  }
]

export default function MiAlquilerPage() {
  const { role } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (role !== "arrendatario") {
      router.push("/dashboard")
    }
  }, [role, router])

  if (role !== "arrendatario") return null

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Mi Alquiler</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockRentals.map((rental) => (
          <PropertySummary 
            key={rental.id} 
            property={rental}
            viewMode="tenant"
          />
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información importante</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Los pagos de alícuotas deben realizarse antes de la fecha de vencimiento</li>
          <li>• Para cualquier consulta sobre los montos, contacte a la administración</li>
          <li>• Mantenga sus pagos al día para evitar recargos por mora</li>
          <li>• Cualquier modificación a la bodega debe ser consultada previamente</li>
        </ul>
      </div>
    </div>
  )
} 
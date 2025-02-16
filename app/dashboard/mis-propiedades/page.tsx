"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "../../_lib/auth/AuthContext"
import { PropertySummary } from "../_components/PropertySummary"

// Datos de ejemplo - En producción, estos vendrían de una API
const mockProperties = [
  {
    id: "1",
    lote: "A-12",
    name: "Bodega 10",
    type: "bodega" as const,
    address: "Almax 3",
    totalAmount: 250.00,
    dueDate: "2024-04-15",
    isRented: true,
    tenant: {
      name: "Importadora XYZ",
      phone: "+58 424-555-1234"
    },
    fees: [
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
    address: "Almax 3",
    totalAmount: 350.00,
    dueDate: "2024-04-15",
    isRented: false,
    fees: [
      { concept: "Mantenimiento", amount: 200.00 },
      { concept: "Seguridad", amount: 100.00 },
      { concept: "Servicios comunes", amount: 50.00 }
    ]
  }
]

export default function MisPropiedadesPage() {
  const { role } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (role !== "propietario") {
      router.push("/dashboard")
    }
  }, [role, router])

  if (role !== "propietario") return null

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Mis Propiedades</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockProperties.map((property) => (
          <PropertySummary 
            key={property.id} 
            property={property} 
            viewMode="owner"
          />
        ))}
      </div>
    </div>
  )
} 
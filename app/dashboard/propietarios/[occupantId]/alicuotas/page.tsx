'use client'

import { motion } from "framer-motion"
import { ArrowLeftIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline"
import { Button } from "../../../../_components/ui/button"
import Link from "next/link"
import { use } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from '../../../../_lib/auth/AuthContext'

// Datos de ejemplo - esto vendría de tu API
const aliquotDetails = {
  occupant: {
    name: "Mikka",
    type: "Propietario",
    property: {
      name: "Bodega 43",
      lot: "Lote 4"
    }
  },
  paymentResponsible: {
    name: "Juan Pérez",
    role: "Gerente Financiero",
    type: "Arrendatario",
    phone: "+593 99 888 7777",
    email: "juan.perez@mikka.com"
  },
  totalAmount: 3200,
  details: [
    {
      type: "Bodega",
      area: 450,
      pricePerMeter: 5,
      total: 2250
    },
    {
      type: "Mezzanine",
      area: 120,
      pricePerMeter: 5,
      total: 600
    },
    {
      type: "Parqueo",
      area: 70,
      pricePerMeter: 5,
      total: 350
    }
  ]
}

type PageParams = {
  occupantId: string
}

export default function AliquotDetailsPage({ 
  params 
}: { 
  params: Promise<PageParams>
}) {
  const { occupantId } = use(params)
  const router = useRouter()
  const { role } = useAuth()

  // Restringir acceso solo a admin, directorio y jefe operativo
  if (role === 'Propietario' || role === 'Arrendatario') {
    router.push('/dashboard')
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-4xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/propietarios">
            <Button variant="outline" size="icon" className="rounded-full w-8 h-8">
              <ArrowLeftIcon className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Desglose de alícuotas</h1>
            <div className="text-gray-500 mt-1">
              {aliquotDetails.occupant.name} - {aliquotDetails.occupant.property.name} ({aliquotDetails.occupant.property.lot})
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 border-[#008A4B] text-[#008A4B] hover:bg-[#008A4B] hover:text-white"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          Exportar a Excel
        </Button>
      </div>

      {/* Responsible Info Card */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-semibold">Responsable de pago</h2>
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
            {aliquotDetails.paymentResponsible.type}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-500">Nombre</div>
            <div className="font-medium">{aliquotDetails.paymentResponsible.name}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Cargo</div>
            <div className="font-medium">{aliquotDetails.paymentResponsible.role}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Teléfono</div>
            <div className="font-medium">{aliquotDetails.paymentResponsible.phone}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Email</div>
            <a 
              href={`mailto:${aliquotDetails.paymentResponsible.email}`}
              className="font-medium text-[#008A4B] hover:underline"
            >
              {aliquotDetails.paymentResponsible.email}
            </a>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Total a pagar</h2>
          <div className="text-2xl font-semibold text-red-600">${aliquotDetails.totalAmount.toLocaleString()}</div>
        </div>

        {/* Details Table */}
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 text-sm font-medium text-gray-500">Tipo</th>
              <th className="text-right py-3 text-sm font-medium text-gray-500">Área (m²)</th>
              <th className="text-right py-3 text-sm font-medium text-gray-500">Precio/m²</th>
              <th className="text-right py-3 text-sm font-medium text-gray-500">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {aliquotDetails.details.map((detail, index) => (
              <tr key={index} className="text-sm">
                <td className="py-4 text-gray-900">{detail.type}</td>
                <td className="py-4 text-right text-gray-600">{detail.area}</td>
                <td className="py-4 text-right text-gray-600">${detail.pricePerMeter}</td>
                <td className="py-4 text-right font-medium text-gray-900">${detail.total}</td>
              </tr>
            ))}
            <tr className="font-medium">
              <td colSpan={3} className="py-4 text-right text-gray-900">Total</td>
              <td className="py-4 text-right text-gray-900">${aliquotDetails.totalAmount}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Additional Info */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Información adicional</h2>
        <div className="text-sm text-gray-500 space-y-2">
          <p>• Las alícuotas se calculan en base al área total de cada espacio.</p>
          <p>• El precio por metro cuadrado puede variar según el tipo de espacio.</p>
          <p>• El pago debe realizarse dentro de los primeros 5 días de cada mes.</p>
          <p>• Las notificaciones de pago se enviarán al responsable designado.</p>
        </div>
      </div>
    </motion.div>
  )
} 
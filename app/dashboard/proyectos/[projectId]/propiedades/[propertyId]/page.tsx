'use client'

import { motion } from "framer-motion"
import { Button } from "../../../../../_components/ui/button"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import Image from "next/image"
import { DockIcon } from "lucide-react"
import { use } from "react"

// Datos de ejemplo - esto vendría de tu API
const propertyData = {
  id: 2,
  name: "Bodega 02",
  lot: "Lote 2",
  area: "120 mt²",
  tenant: {
    name: "Mikka S.A.S.",
    category: "Comida",
    activity: "Comercial",
    phone: "+593 99 999 9999",
    url: "https://www.mikkarestaurante.com/",
    type: "Arrendatario",
    billingTo: "Arrendatario",
    contacts: {
      manager: {
        phone: "+593 99 999 9999",
        email: "gerente@mikka.com"
      },
      administrative: {
        phone: "+593 99 999 9999",
        email: "admin@mikka.com"
      },
      payments: {
        phone: "+593 99 999 9999",
        email: "proveedores@mikka.com"
      }
    }
  },
  documents: [
    {
      type: "Carta de Arrendamiento",
      date: "10/12/24",
      filename: "arriendo-b02t1.pdf"
    },
    {
      type: "Acta de entrega",
      date: "08/11/24",
      filename: "acta-entrega.pdf"
    },
    {
      type: "Copia de cédula",
      date: "05/01/25",
      filename: "cedula-manu-manuel.pdf"
    }
  ],
  history: [
    {
      type: "Vendido",
      date: "01/05/25",
      from: "Manuel Jimenez",
      to: "Uppley",
      document: "doc-venta.pdf"
    },
    {
      type: "Arrendado",
      date: "08/11/23 a 12/04/24",
      from: "Manuel Jimenez",
      to: "Mikka",
      document: "doc-arriendo.pdf"
    },
    {
      type: "Entrega",
      date: "05/01/23",
      from: "Consorcio Almax 3",
      to: "Manuel Jimenez",
      document: "doc-entrega.pdf"
    }
  ]
}

type PageParams = {
  projectId: string
  propertyId: string
}

export default function PropertyDetailPage({ 
  params 
}: { 
  params: Promise<PageParams>
}) {
  const { projectId, propertyId } = use(params)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-5xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/proyectos/${projectId}`}>
            <Button variant="outline" size="icon" className="rounded-full w-8 h-8">
              <ArrowLeftIcon className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">{propertyData.name}</h1>
            <div className="flex items-center gap-4 mt-1 text-gray-500">
              <span>{propertyData.lot}</span>
              <span>{propertyData.tenant.name}</span>
              <span>{propertyData.area}</span>
            </div>
          </div>
        </div>
        {/* <Button className="bg-[#008A4B] hover:bg-[#006837]">
          <DockIcon className="w-4 h-4 mr-2" />
          Solicitudes de esta propiedad
        </Button> */}
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl border p-6 space-y-6">
        <div>
          <h2 className="font-semibold text-lg mb-4">Información General</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500">Razón Social</div>
              <div className="font-medium">{propertyData.tenant.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Categoría</div>
              <div className="font-medium">{propertyData.tenant.category}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Actividad</div>
              <div className="font-medium">{propertyData.tenant.activity}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Tipo de Ocupante</div>
              <div className="font-medium">{propertyData.tenant.type}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Facturación de alícuotas</div>
              <div className="font-medium">{propertyData.tenant.billingTo}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">URL</div>
              <a href={propertyData.tenant.url} target="_blank" rel="noopener noreferrer" 
                className="text-[#008A4B] hover:underline">{propertyData.tenant.url}</a>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Contactos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium">Gerente</div>
                <div className="text-sm text-gray-600">{propertyData.tenant.contacts.manager.phone}</div>
                <div className="text-sm text-[#008A4B]">{propertyData.tenant.contacts.manager.email}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium">Administrativo</div>
                <div className="text-sm text-gray-600">{propertyData.tenant.contacts.administrative.phone}</div>
                <div className="text-sm text-[#008A4B]">{propertyData.tenant.contacts.administrative.email}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium">Pago a Proveedores</div>
                <div className="text-sm text-gray-600">{propertyData.tenant.contacts.payments.phone}</div>
                <div className="text-sm text-[#008A4B]">{propertyData.tenant.contacts.payments.email}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-lg">Documentos</h2>
            <p className="text-sm text-gray-500">Historial y registro de documentos</p>
          </div>
          <Link href={`/dashboard/proyectos/${projectId}/propiedades/${propertyId}/documentos`}>
            <Button variant="outline">Ver todos</Button>
          </Link>
        </div>

        <div className="overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {propertyData.documents.map((doc, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{doc.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{doc.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{doc.filename}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button variant="ghost" className="text-[#008A4B] hover:text-[#006837]">
                      Ver
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Section */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-lg">Histórico</h2>
            <p className="text-sm text-gray-500">Historial y registro de ocupantes y eventos de la propiedad</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              Exportar a Excel
              <Image src="/excel-icon.svg" alt="Excel" width={16} height={16} />
            </Button>
            <Button variant="outline">Descargar reporte</Button>
          </div>
        </div>

        <div className="overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Por</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hacia</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {propertyData.history.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{item.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.from}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.to}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button variant="ghost" className="text-[#008A4B] hover:text-[#006837]">
                      Ver
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
} 
'use client'

import { motion } from "framer-motion"
import { useState } from "react"
import { 
  ArrowLeftIcon, 
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  DocumentIcon,
  EyeIcon,
  ArrowDownIcon
} from "@heroicons/react/24/outline"
import { Button } from "../../../../../../_components/ui/button"
import Link from "next/link"
import { use } from "react"

// Datos de ejemplo - esto vendría de tu API
const documents = [
  {
    id: 1,
    type: "Carta de Arrendamiento",
    date: "10/12/24",
    filename: "arriendo-b02t1.pdf",
    uploadedBy: "Manuel Jiménez",
    size: "2.4 MB"
  },
  {
    id: 2,
    type: "Acta de entrega",
    date: "08/11/24",
    filename: "acta-entrega.pdf",
    uploadedBy: "Carlos Ruiz",
    size: "1.8 MB"
  },
  {
    id: 3,
    type: "Copia de cédula",
    date: "05/01/25",
    filename: "cedula-manu-manuel.pdf",
    uploadedBy: "Manuel Jiménez",
    size: "0.5 MB"
  },
  {
    id: 4,
    type: "Contrato de compraventa",
    date: "01/05/25",
    filename: "contrato-compraventa.pdf",
    uploadedBy: "María López",
    size: "3.2 MB"
  }
]

type PageParams = {
  projectId: string
  propertyId: string
}

export default function PropertyDocumentsPage({ 
  params 
}: { 
  params: Promise<PageParams>
}) {
  const { projectId, propertyId } = use(params)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("Todos")
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<typeof documents[0] | null>(null)

  const documentTypes = ["Todos", "Carta de Arrendamiento", "Acta de entrega", "Copia de cédula", "Contrato de compraventa"]

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = selectedType === "Todos" || doc.type === selectedType

    return matchesSearch && matchesType
  })

  const handleViewDocument = (document: typeof documents[0]) => {
    setSelectedDocument(document)
    setShowPdfModal(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/proyectos/${projectId}/propiedades/${propertyId}`}>
            <Button variant="outline" size="icon" className="rounded-full w-8 h-8">
              <ArrowLeftIcon className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Documentos de la propiedad</h1>
            <p className="text-gray-500 mt-1">Gestiona y visualiza todos los documentos</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por tipo, nombre o responsable..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008A4B]/20 focus:border-[#008A4B]"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008A4B]/20 focus:border-[#008A4B] bg-white"
          >
            {documentTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {(searchQuery || selectedType !== "Todos") && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchQuery("")
                setSelectedType("Todos")
              }}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-5 h-5" />
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documento
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subido por
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tamaño
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDocuments.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <DocumentIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{doc.type}</div>
                      <div className="text-sm text-gray-500">{doc.filename}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {doc.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {doc.uploadedBy}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {doc.size}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-[#008A4B] hover:text-[#006837]"
                      onClick={() => handleViewDocument(doc)}
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-[#008A4B] hover:text-[#006837]"
                    >
                      <ArrowDownIcon className="w-4 h-4 mr-1" />
                      Visualizar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PDF Modal */}
      {showPdfModal && selectedDocument && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50"
        >
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowPdfModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-4xl relative"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">{selectedDocument.type}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPdfModal(false)}
                >
                  <XMarkIcon className="w-5 h-5" />
                </Button>
              </div>
              <div className="aspect-[16/9] bg-gray-100 rounded-lg">
                {/* Aquí irá el visor de PDF más adelante */}
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  Visor de PDF en desarrollo
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
} 
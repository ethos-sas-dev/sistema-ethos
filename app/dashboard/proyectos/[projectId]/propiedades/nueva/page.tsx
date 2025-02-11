'use client'

import { motion } from "framer-motion"
import { Button } from "../../../../../_components/ui/button"
import { 
  ArrowLeftIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  PhotoIcon,
  BuildingOffice2Icon
} from "@heroicons/react/24/outline"
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../../../_lib/auth/AuthContext'
import { useState } from 'react'
import Image from 'next/image'

// Datos de ejemplo - esto vendría de tu API
interface Project {
  id: string
  name: string
}

const projects: Project[] = [
  {
    id: "1",
    name: "Almax 3"
  },
  {
    id: "2",
    name: "Centro Empresarial Sur"
  },
  {
    id: "3",
    name: "Plaza Central"
  }
]

export default function NewPropertyPage({ 
  params 
}: { 
  params: { projectId: string } 
}) {
  const { projectId } = params
  const router = useRouter()
  const { role } = useAuth()
  const [images, setImages] = useState<string[]>([])
  const [selectedType, setSelectedType] = useState('')
  const [propertyNumber, setPropertyNumber] = useState('')
  const [deliveryStatus, setDeliveryStatus] = useState('')
  const [area, setArea] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [selectedProject, setSelectedProject] = useState('')

  // Solo admin y directorio pueden acceder a esta página
  if (role !== 'administrador' && role !== 'directorio') {
    router.push('/dashboard')
    return null
  }

  // Encontrar el proyecto actual
  const currentProject = projects.find(p => p.id === projectId)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      if (images.length + files.length > 5) {
        alert('Máximo 5 imágenes permitidas')
        return
      }
      // Aquí iría la lógica para subir las imágenes al servidor
      // Por ahora solo creamos URLs temporales
      const newImages = Array.from(files).map(file => URL.createObjectURL(file))
      setImages([...images, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto pb-12"
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
            <h1 className="text-2xl font-semibold text-gray-900">Nueva Propiedad</h1>
            <p className="text-gray-500 mt-1">
              {currentProject ? `Añadir propiedad a ${currentProject.name}` : 'Completa los detalles de la nueva propiedad'}
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-xl border p-6 space-y-8">
        {/* Proyecto - Solo mostrar si no hay proyecto pre-seleccionado */}
        {!currentProject && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Proyecto
            </label>
            <div className="mt-1 flex items-center gap-2">
              <BuildingOffice2Icon className="w-5 h-5 text-gray-400" />
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008A4B]/20 focus:border-[#008A4B]"
                required
              >
                <option value="">Seleccionar proyecto</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Imágenes */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Imágenes</h3>
          <div className="grid grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                <Image
                  src={image}
                  alt={`Imagen ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
                >
                  <XMarkIcon className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="border-2 border-dashed border-gray-300 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-[#008A4B] hover:bg-[#008A4B]/5 transition-colors">
                <PhotoIcon className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500 mt-2">Añadir imagen</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>
          <p className="text-sm text-gray-500">Máximo 5 imágenes</p>
        </div>

        {/* Información básica */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tipo
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008A4B]/20 focus:border-[#008A4B]"
              >
                <option value="">Seleccionar tipo</option>
                <option value="bodega">Bodega</option>
                <option value="ofibodega">Ofibodega</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Número
              </label>
              <input
                type="text"
                value={propertyNumber}
                onChange={(e) => setPropertyNumber(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008A4B]/20 focus:border-[#008A4B]"
                placeholder="Ej: B01"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Estado de entrega
              </label>
              <select
                value={deliveryStatus}
                onChange={(e) => setDeliveryStatus(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008A4B]/20 focus:border-[#008A4B]"
              >
                <option value="">Seleccionar estado</option>
                <option value="pendiente">Pendiente</option>
                <option value="entregado">Entregado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Metraje (m²)
              </label>
              <input
                type="number"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008A4B]/20 focus:border-[#008A4B]"
                placeholder="Ej: 450"
              />
            </div>
          </div>
        </div>

        {/* Documentos */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Documentos</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Acta de entrega
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-[#008A4B] hover:bg-[#008A4B]/5 transition-colors cursor-pointer">
                <div className="flex flex-col items-center">
                  <ArrowUpTrayIcon className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-500 mt-2">Subir documento</span>
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Extracto de escritura
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-[#008A4B] hover:bg-[#008A4B]/5 transition-colors cursor-pointer">
                <div className="flex flex-col items-center">
                  <ArrowUpTrayIcon className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-500 mt-2">Subir documento</span>
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Correo del propietario */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Correo electrónico del propietario
          </label>
          <input
            type="email"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008A4B]/20 focus:border-[#008A4B]"
            placeholder="correo@ejemplo.com"
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button
            className="bg-[#008A4B] hover:bg-[#006837] text-white px-8"
          >
            Crear Propiedad
          </Button>
        </div>
      </div>
    </motion.div>
  )
} 
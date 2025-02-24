'use client'

import { useAuth } from '../../../_lib/auth/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '../../../_components/ui/button'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

export default function NewProjectPage() {
  const { role } = useAuth()
  const router = useRouter()

  // Solo admin y directorio pueden acceder a esta página
  if (role !== 'Administrador' && role !== 'Directorio') {
    router.push('/dashboard')
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/proyectos')}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-semibold">Crear Nuevo Proyecto</h1>
      </div>

      <div className="bg-white rounded-xl border p-8 text-center space-y-4">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-medium text-gray-900">¡Próximamente!</h2>
          <p className="mt-2 text-gray-500">
            Estamos desarrollando el formulario de creación de proyectos con campos para tasas base, alícuotas y más detalles... ¡Revísalo en los próximos días!
          </p>
        </div>
      </div>
    </motion.div>
  )
} 
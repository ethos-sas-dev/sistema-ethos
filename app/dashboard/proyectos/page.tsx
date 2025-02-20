'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../_lib/auth/AuthContext"
import { gql, useQuery } from '@apollo/client'
import Image from "next/image"

// Consulta para obtener todos los proyectos (Directorio)
const GET_ALL_PROJECTS = gql`
  query GetAllProjects {
    proyectos {
      data {
        id
        documentId
        nombre
        descripcion
        ubicacion
        perfilOperacional {
          data {
            usuario {
              data {
                username
              }
            }
          }
        }
        unidadNegocio {
          data {
            nombre
          }
        }
        fotoProyecto {
          data {
            url
          }
        }
        createdAt
        updatedAt
        publishedAt
      }
    }
  }
`;

// Consulta para obtener proyectos asignados (Jefe Operativo y Administrador)
const GET_ASSIGNED_PROJECTS = gql`
  query GetAssignedProjects($documentId: ID!) {
    perfilOperacional(documentId: $documentId) {
      proyectosAsignados {
        documentId
        nombre
        descripcion
        ubicacion
        unidadNegocio {
          nombre
        }
        fotoProyecto {
          url
        }
        createdAt
        updatedAt
        publishedAt
      }
    }
  }
`;

interface Project {
  id?: string;
  documentId: string;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  perfilOperacional?: {
    usuario: {
      username: string;
    };
  };
  unidadNegocio?: {
    nombre: string;
  };
  fotoProyecto?: {
    url: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export default function ProyectosPage() {
  const { user, role } = useAuth()
  const router = useRouter()

  // Verificar roles permitidos
  const allowedRoles = ['Jefe Operativo', 'Administrador', 'Directorio']
  
  useEffect(() => {
    if (!allowedRoles.includes(role || '')) {
      router.push("/dashboard")
    }
  }, [role, router])

  // Seleccionar la consulta apropiada según el rol
  const isDirectorio = role === 'Directorio'
  const query = isDirectorio ? GET_ALL_PROJECTS : GET_ASSIGNED_PROJECTS
  const variables = isDirectorio ? {} : { documentId: user?.perfil_operacional?.documentId }

  const { data, loading, error } = useQuery(query, {
    variables,
    skip: !user || (role !== 'Directorio' && !user?.perfil_operacional?.documentId),
  })

  if (!allowedRoles.includes(role || '')) return null

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008A4B]"></div>
      </div>
    )
  }

  if (error) {
    console.error('Error al cargar los proyectos:', error)
    return (
      <div className="w-full p-4 text-center text-red-600">
        Error al cargar los proyectos. Por favor, intente más tarde.
      </div>
    )
  }

  // Procesar los datos según el rol
  const projects: Project[] = isDirectorio
    ? data?.proyectos?.data?.map((item: any) => ({
        id: item.id,
        ...item,
        perfilOperacional: item.perfilOperacional?.data,
        unidadNegocio: item.unidadNegocio?.data,
        fotoProyecto: item.fotoProyecto?.data
      })) || []
    : data?.perfilOperacional?.proyectosAsignados || []

  if (projects.length === 0) {
    return (
      <div className="w-full p-4 text-center text-gray-500">
        No se encontraron proyectos {!isDirectorio ? 'asignados' : ''}.
      </div>
    )
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isDirectorio ? 'Todos los Proyectos' : 'Proyectos Asignados'}
        </h1>
        
        {/* Aquí puedes agregar botones de acción según el rol */}
        {(role === 'Administrador' || role === 'Directorio') && (
          <button
            onClick={() => router.push('/dashboard/proyectos/nuevo')}
            className="bg-[#008A4B] text-white px-4 py-2 rounded-lg hover:bg-[#006837] transition-colors"
          >
            Nuevo Proyecto
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.documentId}
            className="bg-white rounded-xl overflow-hidden border hover:shadow-lg transition-shadow duration-200"
          >
            {project.fotoProyecto?.url && (
              <div className="relative h-48">
                <Image
                  src={project.fotoProyecto.url}
                  alt={project.nombre}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {project.nombre}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {project.ubicacion}
              </p>
              {project.unidadNegocio && (
                <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {project.unidadNegocio.nombre}
                </span>
              )}
              <p className="mt-4 text-sm text-gray-600 line-clamp-2">
                {project.descripcion}
              </p>
              {(role === 'Administrador' || role === 'Directorio') && project.perfilOperacional?.usuario && (
                <p className="mt-2 text-sm text-gray-500">
                  Asignado a: {project.perfilOperacional.usuario.username}
                </p>
              )}
              <button
                onClick={() => router.push(`/dashboard/proyectos/${project.documentId}`)}
                className="mt-6 w-full bg-gray-50 text-[#008A4B] px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                Ver Detalles
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 
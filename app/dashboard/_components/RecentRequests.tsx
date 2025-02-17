'use client'

import { Badge } from "../../_components/ui/badge"
import type { UserRole } from '../../_lib/auth/AuthContext'

interface RecentRequestsProps {
  role: UserRole
}

interface Request {
  id: string
  type: string
  property: string
  status: 'pendiente' | 'en_proceso' | 'completada'
  date: string
  priority: 'alta' | 'media' | 'baja'
}

interface RoleData {
  requests: Request[]
}

// Datos de ejemplo - esto vendría de tu API
const mockData: Record<string, RoleData> = {
  'jefeoperativo': {
    requests: [
      {
        id: "REQ-001",
        type: "Mantenimiento",
        property: "Torre A - Apto 502",
        status: "pendiente",
        date: "2024-02-10",
        priority: "alta"
      },
      {
        id: "REQ-002",
        type: "Reparación",
        property: "Torre B - Apto 301",
        status: "en_proceso",
        date: "2024-02-09",
        priority: "media"
      },
      {
        id: "REQ-003",
        type: "Inspección",
        property: "Torre C - Apto 1201",
        status: "completada",
        date: "2024-02-08",
        priority: "baja"
      }
    ]
  },
  'administrador': {
    requests: [
      {
        id: "REQ-001",
        type: "Acceso",
        property: "Sistema",
        status: "pendiente",
        date: "2024-02-10",
        priority: "alta"
      },
      {
        id: "REQ-002",
        type: "Reporte",
        property: "Finanzas",
        status: "completada",
        date: "2024-02-09",
        priority: "media"
      }
    ]
  },
  'directorio': {
    requests: [
      {
        id: "REQ-001",
        type: "Aprobación",
        property: "Presupuesto 2024",
        status: "pendiente",
        date: "2024-02-10",
        priority: "alta"
      },
      {
        id: "REQ-002",
        type: "Revisión",
        property: "Contratos",
        status: "en_proceso",
        date: "2024-02-09",
        priority: "alta"
      }
    ]
  },
  'propietario': {
    requests: [
      {
        id: "REQ-001",
        type: "Mantenimiento",
        property: "Mi Propiedad A",
        status: "pendiente",
        date: "2024-02-10",
        priority: "media"
      }
    ]
  },
  'arrendatario': {
    requests: [
      {
        id: "REQ-001",
        type: "Reparación",
        property: "Mi Alquiler",
        status: "en_proceso",
        date: "2024-02-10",
        priority: "alta"
      }
    ]
  }
};

const statusStyles: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  en_proceso: "bg-blue-100 text-blue-800",
  completada: "bg-green-100 text-green-800"
};

const priorityStyles: Record<string, string> = {
  alta: "bg-red-100 text-red-800",
  media: "bg-orange-100 text-orange-800",
  baja: "bg-gray-100 text-gray-800"
};

export function RecentRequests({ role }: RecentRequestsProps) {
  const roleKey = role.toLowerCase().replace(/\s+/g, '');
  const data = mockData[roleKey];

  if (!data || !data.requests) {
    return (
      <div className="p-4 text-center text-gray-500">
        No hay solicitudes disponibles
      </div>
    );
  }

  return (
    <div className="min-w-full divide-y divide-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Propiedad
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Prioridad
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.requests.map((request) => (
            <tr key={request.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {request.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {request.type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {request.property}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge className={statusStyles[request.status]}>
                  {request.status.replace('_', ' ')}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {request.date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge className={priorityStyles[request.priority]}>
                  {request.priority}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 
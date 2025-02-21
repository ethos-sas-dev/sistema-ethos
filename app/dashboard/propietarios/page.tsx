'use client'

import { motion } from "framer-motion"
import { useState } from "react"
import { 
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  BuildingOffice2Icon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon
} from "@heroicons/react/24/outline"
import { Button } from "../../_components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from '../../_lib/auth/AuthContext'
import { gql, useQuery } from '@apollo/client'

// Consulta para obtener todas las propiedades (Directorio)
const GET_ALL_PROPERTIES = gql`
  query GetAllProperties {
    propiedades(pagination: { limit: -1 }) {
      data {
        id
        documentId
        identificadores {
          idSuperior
          superior
          idInferior
          inferior
        }
        estadoUso
        actividad
        proyecto {
          data {
            documentId
            nombre
          }
        }
        propietario {
          data {
            contactoAccesos {
              nombreCompleto
              telefono
              email
            }
            contactoAdministrativo {
              telefono
              email
            }
            contactoGerente {
              telefono
              email
            }
            contactoProveedores {
              telefono
              email
            }
            tipoPersona
            datosPersonaNatural {
              cedula
              ruc
              razonSocial
            }
            datosPersonaJuridica {
              razonSocial
              nombreComercial
              rucPersonaJuridica {
                ruc
              }
            }
          }
        }
        ocupantes {
          tipoOcupante
          datosPersonaJuridica {
            razonSocial
            rucPersonaJuridica {
              ruc
            }
          }
          datosPersonaNatural {
            razonSocial
            ruc
          }
          perfilCliente {
            datosPersonaNatural {
              razonSocial
              ruc
            }
            datosPersonaJuridica {
              razonSocial
              rucPersonaJuridica {
                ruc
              }
            }
            contactoAccesos {
              telefono
              email
            }
            contactoAdministrativo {
              telefono
              email
            }
            contactoGerente {
              telefono
              email
            }
            contactoProveedores {
              telefono
              email
            }
          }
        }
      }
    }
  }
`;

// Consulta para obtener propiedades por proyecto (Jefe Operativo y Administrador)
const GET_PROPERTIES_BY_PROJECT = gql`
  query GetPropertiesByProject($projectId: ID!) {
    proyecto(documentId: $projectId) {
      propiedades(pagination: { limit: -1 }) {
        documentId
        identificadores {
          idSuperior
          superior
          idInferior
          inferior
        }
        estadoUso
        actividad
        propietario {
          contactoAccesos {
            nombreCompleto
            telefono
            email
          }
          contactoAdministrativo {
            telefono
            email
          }
          contactoGerente {
            telefono
            email
          }
          contactoProveedores {
            telefono
            email
          }
          tipoPersona
          datosPersonaNatural {
            cedula
            ruc
            razonSocial
          }
          datosPersonaJuridica {
            razonSocial
            nombreComercial
            rucPersonaJuridica {
              ruc
            }
          }
        }
        ocupantes {
          tipoOcupante
          datosPersonaJuridica {
            razonSocial
            rucPersonaJuridica {
              ruc
            }
          }
          datosPersonaNatural {
            razonSocial
            ruc
          }
          perfilCliente {
            datosPersonaNatural {
              razonSocial
              ruc
            }
            datosPersonaJuridica {
              razonSocial
              rucPersonaJuridica {
                ruc
              }
            }
            contactoAccesos {
              nombreCompleto
              telefono
              email
            }
            contactoAdministrativo {
              telefono
              email
            }
            contactoGerente {
              telefono
              email
            }
            contactoProveedores {
              telefono
              email
            }
          }
        }
      }
    }
  }
`;

interface ContactInfo {
  nombreCompleto: string;
  telefono: string;
  email: string;
}

interface Property {
  id?: string;
  documentId: string;
  identificadores: {
    idSuperior: string;
    superior: string;
    idInferior: string;
    inferior: string;
  };
  estadoUso: string;
  actividad?: string;
  proyecto?: {
    documentId: string;
    nombre: string;
  };
  propietario?: {
    contactoAccesos: ContactInfo;
    contactoAdministrativo?: ContactInfo;
    contactoGerente?: ContactInfo;
    contactoProveedores?: ContactInfo;
    tipoPersona: "Natural" | "Juridica";
    datosPersonaNatural?: {
      cedula: string;
      ruc?: string;
      razonSocial: string;
    };
    datosPersonaJuridica?: {
      razonSocial: string;
      nombreComercial?: string;
      rucPersonaJuridica: Array<{
        ruc: string;
      }>;
    };
  };
  ocupantes?: Array<{
    tipoOcupante: string;
    datosPersonaJuridica?: {
      razonSocial: string;
      rucPersonaJuridica: Array<{
        ruc: string;
      }>;
    };
    datosPersonaNatural?: {
      razonSocial: string;
      ruc?: string;
    };
    perfilCliente?: {
      datosPersonaNatural?: {
        razonSocial: string;
        ruc?: string;
      };
      datosPersonaJuridica?: {
        razonSocial: string;
        rucPersonaJuridica: Array<{
          ruc: string;
        }>;
      };
      contactoAccesos?: ContactInfo;
      contactoAdministrativo?: ContactInfo;
      contactoGerente?: ContactInfo;
      contactoProveedores?: ContactInfo;
    };
  }>;
}

type Ocupante = NonNullable<Property['ocupantes']>[number];

const getOccupantName = (ocupante: Ocupante) => {
  if (!ocupante) return null;
  
  if (ocupante.perfilCliente?.datosPersonaJuridica?.razonSocial) {
    return {
      nombre: ocupante.perfilCliente.datosPersonaJuridica.razonSocial,
      tipo: ocupante.tipoOcupante,
      ruc: ocupante.perfilCliente.datosPersonaJuridica.rucPersonaJuridica?.[0]?.ruc
    };
  }
  
  if (ocupante.perfilCliente?.datosPersonaNatural?.razonSocial) {
    return {
      nombre: ocupante.perfilCliente.datosPersonaNatural.razonSocial,
      tipo: ocupante.tipoOcupante,
      ruc: ocupante.perfilCliente.datosPersonaNatural.ruc
    };
  }
  
  if (ocupante.datosPersonaJuridica?.razonSocial) {
    return {
      nombre: ocupante.datosPersonaJuridica.razonSocial,
      tipo: ocupante.tipoOcupante,
      ruc: ocupante.datosPersonaJuridica.rucPersonaJuridica?.[0]?.ruc
    };
  }
  
  if (ocupante.datosPersonaNatural?.razonSocial) {
    return {
      nombre: ocupante.datosPersonaNatural.razonSocial,
      tipo: ocupante.tipoOcupante,
      ruc: ocupante.datosPersonaNatural.ruc
    };
  }
  
  return null;
};

export default function OccupantsPage() {
  const router = useRouter()
  const { user, role } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLot, setSelectedLot] = useState("Todos")

  // Restringir acceso solo a admin, directorio y jefe operativo
  if (!["Jefe Operativo", "Administrador", "Directorio"].includes(role as string)) {
    router.push('/dashboard')
    return null
  }

  // Determinar qué consulta usar según el rol
  const { data, loading, error } = useQuery(
    (role as string) === "Directorio"
      ? GET_ALL_PROPERTIES
      : GET_PROPERTIES_BY_PROJECT,
    {
      variables:
        (role as string) === "Directorio"
          ? {}
          : { projectId: user?.perfil_operacional?.proyectosAsignados?.[0]?.documentId || "" },
      skip: !user || ((role as string) !== "Directorio" && !user?.perfil_operacional?.proyectosAsignados?.[0]?.documentId),
    }
  );

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008A4B]"></div>
      </div>
    );
  }

  if (error) {
    console.error('Error al cargar las propiedades:', error);
    return (
      <div className="w-full p-4 text-center text-red-600">
        Error al cargar las propiedades. Por favor, intente más tarde.
      </div>
    );
  }

  // Procesar los datos según el rol
  const properties: Property[] = (role as string) === "Directorio"
    ? data?.propiedades?.data?.map((item: any) => ({
        id: item.id,
        ...item,
        proyecto: item.proyecto?.data,
        propietario: item.propietario?.data,
      }))
    : data?.proyecto?.propiedades || [];

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedLot("Todos")
  }

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.identificadores.superior.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.identificadores.inferior.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.ocupantes?.some(ocupante => {
        const ocupanteInfo = getOccupantName(ocupante);
        return ocupanteInfo?.nombre.toLowerCase().includes(searchQuery.toLowerCase());
      }) ||
      (property.propietario?.contactoAccesos?.nombreCompleto || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Propietarios y ocupantes</h1>
          <p className="text-gray-500 mt-1">
            {role === "Directorio" 
              ? "Todas las propiedades" 
              : `Propiedades de ${user?.perfil_operacional?.proyectosAsignados?.slice(0,5).map(p => p.nombre).join(', ')}${(user?.perfil_operacional?.proyectosAsignados?.length ?? 0) > 5 ? '...' : ''}`}
          </p>
        </div>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 border-[#008A4B] text-[#008A4B] hover:bg-[#008A4B] hover:text-white"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          Exportar a Excel
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por número, tipo, ocupante o propietario..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008A4B]/20 focus:border-[#008A4B]"
          />
        </div>
        {searchQuery && (
          <Button
            variant="ghost"
            onClick={handleClearFilters}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-5 h-5" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500">
        {filteredProperties.length} resultados
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ocupante
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Propietario
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Propiedad
              </th>
              {role === "Directorio" && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proyecto
                </th>
              )}
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Ver detalles</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProperties.length === 0 ? (
              <tr>
                <td colSpan={role === "Directorio" ? 6 : 5} className="px-6 py-10 text-center text-gray-500">
                  <BuildingOffice2Icon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm font-medium">No hay propietarios ni ocupantes registrados</p>
                  <p className="mt-1 text-sm">en {user?.perfil_operacional?.proyectosAsignados?.slice(0,5).map(p => p.nombre).join(', ')}{(user?.perfil_operacional?.proyectosAsignados?.length ?? 0) > 5 ? '...' : ''} </p>
                </td>
              </tr>
            ) : (
              filteredProperties.map((property) => {
                const ocupanteInfo = property.ocupantes?.[0] ? getOccupantName(property.ocupantes[0]) : null;
                
                return (
                  <tr key={property.documentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {property.ocupantes && property.ocupantes.length > 0 ? (
                          property.ocupantes.map((ocupante, index) => {
                            const ocupanteInfo = getOccupantName(ocupante);
                            if (!ocupanteInfo) return null;
                            
                            return (
                              <div key={index} className="flex flex-col">
                                <div className="text-sm font-medium text-gray-900">
                                  {ocupanteInfo.nombre}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {ocupanteInfo.tipo}
                                </div>
                                {index < property.ocupantes!.length - 1 && (
                                  <div className="my-2 border-t border-gray-200"></div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-sm text-gray-500">Sin ocupantes</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {property.propietario?.datosPersonaNatural?.razonSocial || property.propietario?.datosPersonaJuridica?.razonSocial || 'Sin propietario registrado'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{property.estadoUso === "enUso" ? "En uso" : "Disponible"}</div>
                        <div className="text-sm text-gray-500">{property.ocupantes?.some(ocupante => ocupante.tipoOcupante === "arrendatario") ? "Arrendado" : "Uso propietario"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">
                          {property.identificadores.superior} {property.identificadores.idSuperior}
                        </div>
                        <div className="text-sm text-gray-500">
                          {property.identificadores.inferior} {property.identificadores.idInferior}
                        </div>
                      </div>
                    </td>
                    {role === "Directorio" && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{property.proyecto?.nombre}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Button 
                        variant="ghost" 
                        className="text-[#008A4B] hover:text-[#006837]"
                        onClick={() => router.push(`/dashboard/proyectos/${property.proyecto?.documentId}/propiedades/${property.documentId}?from=propietarios`)}
                      >
                        Ver detalles
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Card Grid */}
    
    </motion.div>
  )
} 
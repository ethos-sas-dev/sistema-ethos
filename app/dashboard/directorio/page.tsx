"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowDownTrayIcon,
  TableCellsIcon,
  Squares2X2Icon,
  MapPinIcon,
  MagnifyingGlassIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../_lib/auth/AuthContext";
import { PropertyDirectoryFilters } from "../_components/PropertyDirectoryFilters";
import { gql, useQuery } from "@apollo/client";
import type { UserRole } from "../../_lib/auth/AuthContext";

// Consulta para obtener todas las propiedades (Directorio)
const GET_ALL_PROPERTIES = gql`
  query GetAllProperties {
    propiedades {
      data {
        id
        documentId
        tipoPropiedad
        numeroPropiedad
        estadoUso
        estadoOcupacion
        tipoUso
        metraje
        areaUtil
        areaTotal
        proyecto {
          data {
            documentId
            nombre
            unidadNegocio {
              data {
                nombre
              }
            }
          }
        }
        propietario {
          data {
            contactoAccesos {
              nombreCompleto
              telefono
              email
            }
          }
        }
        ocupantes {
          datosPersonaJuridica {
            razonSocial
          }
          datosPersonaNatural {
            razonSocial
          }
          perfilCliente {
            datosPersonaNatural {
              razonSocial
            }
            datosPersonaJuridica {
              razonSocial
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
      propiedades {
        documentId
        tipoPropiedad
        numeroPropiedad
        estadoUso
        estadoOcupacion
        tipoUso
        metraje
        areaUtil
        areaTotal
        propietario {
          contactoAccesos {
            nombreCompleto
            telefono
            email
          }
        }
        proyecto {
          nombre
        }
        ocupantes {
          tipoOcupante
          datosPersonaJuridica {
            razonSocial
          }
          datosPersonaNatural {
            razonSocial
          }
          perfilCliente {
            datosPersonaNatural {
              razonSocial
            }
            datosPersonaJuridica {
              razonSocial
            }
          }
        }
      }
    }
  }
`;

// Consulta para obtener propiedades del cliente (Propietario y Arrendatario)
const GET_CLIENT_PROPERTIES = gql`
  query GetClientProperties($documentId: ID!) {
    perfilCliente(documentId: $documentId) {
      propiedades {
        documentId
        tipoPropiedad
        numeroPropiedad
        estadoUso
        estadoOcupacion
        tipoUso
        metraje
        areaUtil
        areaTotal
        proyecto {
          nombre
          unidadNegocio {
            nombre
          }
        }
        propietario {
          contactoAccesos {
            nombreCompleto
            telefono
            email
          }
        }
        ocupantes {
          tipoOcupante
          datosPersonaJuridica {
            razonSocial
          }
          datosPersonaNatural {
            razonSocial
          }
          perfilCliente {
            datosPersonaNatural {
              razonSocial
            }
            datosPersonaJuridica {
              razonSocial
            }
          }
        }
      }
    }
  }
`;

interface Property {
  id?: string;
  documentId: string;
  tipoPropiedad: string;
  numeroPropiedad: string;
  estadoUso: string;
  estadoOcupacion: string;
  tipoUso: string;
  metraje: number;
  areaUtil: number;
  areaTotal: number;
  proyecto?: {
    documentId?: string;
    nombre: string;
    unidadNegocio?: {
      nombre: string;
    };
  };
  propietario?: {
    contactoAccesos: {
      nombreCompleto: string;
      telefono: string;
      email: string;
    };
  };
  ocupantes?: Array<{
    tipoOcupante: string;
    datosPersonaJuridica?: {
      razonSocial: string;
    };
    datosPersonaNatural?: {
      razonSocial: string;
    };
    perfilCliente?: {
      datosPersonaNatural?: {
        razonSocial: string;
      };
      datosPersonaJuridica?: {
        razonSocial: string;
      };
    };
  }>;
  // Campos adicionales para la vista
  businessUnit?: string;
  project?: string;
  lote?: string;
  name?: string;
  rentalStatus?: string;
  image?: string;
  businessActivity?: string;
  occupantName?: string;
  occupantPhone?: string;
  occupantEmail?: string;
  occupantId?: string;
}

interface User {
  perfil_operacional?: {
    documentId: string;
    rol: "Jefe Operativo" | "Administrador" | "Directorio";
    proyectosAsignados: Array<{
      documentId: string;
      nombre: string;
    }>;
  };
  perfil_cliente?: {
    documentId: string;
  };
}

interface Ocupante {
  tipoOcupante: string;
  datosPersonaJuridica?: {
    razonSocial: string;
  };
  datosPersonaNatural?: {
    razonSocial: string;
  };
  perfilCliente?: {
    datosPersonaNatural?: {
      razonSocial: string;
    };
    datosPersonaJuridica?: {
      razonSocial: string;
    };
  };
}

export default function DirectorioPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [filteredProperties, setFiltereredProperties] = useState<Property[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [searchQuery, setSearchQuery] = useState("");

  // Verificar acceso - solo Directorio y perfiles cliente
  useEffect(() => {
    if (!["Directorio", "Propietario", "Arrendatario"].includes(role as string)) {
      router.push("/dashboard");
    }
  }, [role, router]);

  if (!["Directorio", "Propietario", "Arrendatario"].includes(role as string)) return null;

  // Determinar qué consulta usar según el rol
  const { data, loading, error } = useQuery(
    (role as string) === "Directorio"
      ? GET_ALL_PROPERTIES
      : GET_CLIENT_PROPERTIES,
    {
      variables:
        (role as string) === "Directorio"
          ? {}
          : { documentId: user?.perfil_cliente?.documentId || "" },
      skip: !user || ((role as string) !== "Directorio" && !user?.perfil_cliente?.documentId),
    }
  );

  // Procesar los datos según el rol y actualizar filteredProperties
  useEffect(() => {
    if (data) {
      console.log('Data received:', data);
      const processedProperties = (role as string) === "Directorio"
        ? data?.propiedades?.data?.map((item: any) => ({
            id: item.id,
            ...item,
            proyecto: item.proyecto?.data,
            propietario: item.propietario?.data,
            ocupantes: item.ocupantes?.data,
          }))
        : data?.perfilCliente?.propiedades || [];

      console.log('Processed properties:', processedProperties);
      setFiltereredProperties(processedProperties || []);
    }
  }, [data, role]);

  // Convertir el rol al formato esperado por PropertyDirectoryFilters
  const normalizedRole = (role as string)?.toLowerCase().replace(/\s+/g, '') as "jefeOperativo" | "administrador" | "directorio";

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008A4B]"></div>
      </div>
    );
  }

  if (error) {
    console.error("Error al cargar las propiedades:", error);
    return (
      <div className="w-full p-4 text-center text-red-600">
        Error al cargar las propiedades. Por favor, intente más tarde.
      </div>
    );
  }

  const handleFilterChange = (filters: any) => {
    let filtered = [...filteredProperties];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.numeroPropiedad.toLowerCase().includes(query) ||
          p.tipoPropiedad.toLowerCase().includes(query) ||
          p.proyecto?.nombre?.toLowerCase().includes(query)
      );
    }

    if (filters.businessUnit && (role as string) === "Directorio") {
      filtered = filtered.filter(
        (p) => p.proyecto?.unidadNegocio?.nombre === filters.businessUnit
      );
    }

    if (filters.project && (role as string) === "Directorio") {
      filtered = filtered.filter((p) => p.proyecto?.nombre === filters.project);
    }

    if (filters.rentalStatus) {
      filtered = filtered.filter((p) => p.estadoUso === filters.rentalStatus);
    }

    setFiltereredProperties(filtered);
  };

  const handleExportCSV = () => {
    // Preparar los datos según el rol
    const getData = (property: any) => {
      const baseData = {
        "Unidad de negocio": property.businessUnit,
        Proyecto: property.project,
        Lote: property.lote,
        Bodega: property.name,
        "Estado de entrega": property.deliveryStatus,
        "Estado de arrendamiento": property.rentalStatus,
        "Actividad del negocio": property.businessActivity,
      };

      const data =
        (role as string) === "jefeOperativo"
          ? {
              ...baseData,
              "Nombre del ocupante": property.occupantName,
              "RUC/CI ocupante": property.occupantId,
              "Correo del propietario": property.ownerEmail,
              "Teléfono del propietario": property.ownerPhone,
            }
          : {
              ...baseData,
              "Tipo de ocupante": property.occupantType,
              Nombre: property.occupantName,
              "RUC/CI": property.occupantId,
              Correo: property.occupantEmail,
              Teléfono: property.occupantPhone,
            };

      return data as Record<string, string>;
    };

    const csvData = filteredProperties.map(getData);
    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        headers.map((header) => `"${row[header]}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "directorio-propiedades-ethos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Determinar si el usuario puede exportar
  const canExport = ["Jefe Operativo", "Administrador", "Directorio"].includes(
    role as string
  );
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Directorio de Propiedades
          </h1>
          {(user as User)?.perfil_operacional?.proyectosAsignados?.[0]?.nombre && (
            <p className="text-sm text-gray-500 mt-1">
              Mostrando propiedades de{" "}
              {(user as User)?.perfil_operacional?.proyectosAsignados?.[0]?.nombre}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar propiedad..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleFilterChange({});
              }}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008A4B]/20 focus:border-[#008A4B]"
            />
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "table"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-gray-600 hover:text-emerald-600"
              }`}
            >
              <TableCellsIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "cards"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-gray-600 hover:text-emerald-600"
              }`}
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
          </div>
          {canExport && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportCSV}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-emerald-700 transition-colors"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              Exportar
            </motion.button>
          )}
        </div>
      </div>

      <PropertyDirectoryFilters
        role={normalizedRole}
        onFilterChange={handleFilterChange}
      />

      {viewMode === "table" ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {(role as string) === "Directorio" && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unidad de negocio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Proyecto
                      </th>
                    </>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metraje
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado de Uso
                  </th>
                  {(role as string) === "Directorio" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado de Ocupación
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProperties.map((property) => (
                  <tr 
                    key={property.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/dashboard/proyectos/${property.proyecto?.documentId}/propiedades/${property.documentId}`)}
                  >
                    {(role as string) === "Directorio" && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {property.proyecto?.unidadNegocio?.nombre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {property.proyecto?.nombre}
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {property.tipoPropiedad}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {property.numeroPropiedad}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {property.areaTotal} m²
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium
                        ${
                          property.estadoUso === "Disponible"
                            ? "bg-green-100 text-green-800"
                            : property.estadoUso === "Utilizada"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {property.estadoUso}
                      </span>
                    </td>
                    {(role as string) === "Directorio" && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium
                          ${
                            property.estadoOcupacion === "Ocupada"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {property.estadoOcupacion}
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <motion.div
              key={property.id}
              className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={() => router.push(`/dashboard/proyectos/${property.proyecto?.documentId}/propiedades/${property.documentId}`)}
            >
              <div className="relative h-48">
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm">
                    {property.tipoPropiedad} {property.numeroPropiedad}
                  </div>
                  {(role as string) === "Directorio" && (
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm text-emerald-600">
                      {property.proyecto?.nombre}
                    </div>
                  )}
                </div>
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <BuildingOffice2Icon className="w-12 h-12 text-gray-400" />
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                      {property.tipoPropiedad} {property.numeroPropiedad}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{property.areaTotal} m²</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium
                      ${
                        property.estadoUso === "Disponible"
                          ? "bg-green-100 text-green-800"
                          : property.estadoUso === "Utilizada"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {property.estadoUso}
                    </span>
                    {(role as string) === "Directorio" && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium
                        ${
                          property.estadoOcupacion === "Ocupada"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {property.estadoOcupacion}
                      </span>
                    )}
                  </div>
                </div>
                {(role as string) === "Directorio" && (
                  <div className="mt-4 text-sm text-gray-500">
                    {property.proyecto?.unidadNegocio?.nombre}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}


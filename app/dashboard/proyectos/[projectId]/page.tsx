"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "../../../_components/ui/button";
import { 
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BuildingOffice2Icon,
  PlusIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import { use } from 'react';
import { useAuth } from '../../../_lib/auth/AuthContext';
import { gql, useQuery } from '@apollo/client';

const GET_PROJECT_DETAILS = gql`
  query GetProjectDetails($documentId: ID!) {
    proyecto(documentId: $documentId) {
      documentId
      nombre
      descripcion
      ubicacion
      tasaBaseFondoInicial
      tasaBaseAlicuotaOrdinaria
      perfilOperacional {
        usuario {
          username
        }
      }
      unidadNegocio {
        nombre
      }
      fotoProyecto {
        url
      }
      propiedades {
        documentId
        identificadores {
          idSuperior
          superior
          idInferior
          inferior
        }
        estadoUso
        estadoEntrega
        estadoDeConstruccion
        actividad
        montoFondoInicial
        montoAlicuotaOrdinaria
        areaTotal
        areasDesglosadas {
          area
          tipoDeArea
        }
        modoIncognito
        ocupantes {
          tipoOcupante
        }
      }

      createdAt
      updatedAt
      publishedAt
    }
  }
`;

interface AreaDesglosada {
  nombre: string;
  valor: number;
  unidad: string;
}

interface AlicuotaExtraordinaria {
  descripcion: string;
  monto: number;
  fechaInicio: string;
  fechaFin: string;
}

interface Property {
  documentId: string;
  identificadores: {
    idSuperior: string;
    superior: string;
    idInferior: string;
    inferior: string;
  };
  estadoUso: "enUso" | "disponible";
  estadoOcupacion: "usoPropietario" | "usoArrendatario";
  estadoEntrega: "entregado" | "noEntregado";
  estadoDeConstruccion: "enPlanos" | "enConstruccion" | "obraGris" | "acabados" | "finalizada" | "remodelacion" | "demolicion" | "abandonada" | "paralizada";
  actividad: string;
  montoFondoInicial: number;
  montoAlicuotaOrdinaria: number;
  areaTotal: number;
  areasDesglosadas: {
    area: number;
    tipoDeArea: string;
  }[];
  modoIncognito: boolean;
  ocupantes: {
    tipoOcupante: string;
  }[];
}

interface Project {
  documentId: string;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  tasaBaseFondoInicial: number;
  tasaBaseAlicuotaOrdinaria: number;
  alicuotasExtraordinarias: AlicuotaExtraordinaria[];
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
  propiedades: Property[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { role } = useAuth();
  const router = useRouter();

  // Verificar si el usuario tiene permisos de administración
  const isAdmin = role === 'Administrador' || role === 'Directorio';

  const { data, loading, error } = useQuery(GET_PROJECT_DETAILS, {
    variables: { documentId: projectId },
    skip: !projectId,
  });

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008A4B]"></div>
      </div>
    );
  }

  if (error) {
    console.error('Error al cargar el proyecto:', error);
    return (
      <div className="w-full p-4 text-center text-red-600">
        Error al cargar el proyecto. Por favor, intente más tarde.
      </div>
    );
  }
  console.log(data);

  const project: Project = {
    ...data?.proyecto,
    perfilOperacional: data?.proyecto?.perfilOperacional,
    unidadNegocio: data?.proyecto?.unidadNegocio?.nombre,
    fotoProyecto: data?.proyecto?.fotoProyecto,
    propiedades: data?.proyecto?.propiedades || []
  };

  const getProjectStats = (properties: Property[]) => {
    return {
      total: properties.length,
      active: properties.filter(p => p.estadoUso === "enUso").length,
      totalArea: properties.reduce((sum, prop) => {
        const totalArea = prop.areasDesglosadas?.reduce((areaSum, area) => 
          areaSum + area.area, 0) || 0;
        return sum + totalArea;
      }, 0),
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Back button and title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/proyectos">
            <Button variant="outline" size="icon" className="rounded-full w-8 h-8">
              <ArrowLeftIcon className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">{project.nombre}</h1>
        </div>
        {isAdmin && (
          <Button 
            className="bg-[#008A4B] hover:bg-[#006837] flex items-center gap-2"
            onClick={() => router.push(`/dashboard/proyectos/${projectId}/propiedades/nueva`)}
          >
            <PlusIcon className="w-4 h-4" />
            Nueva Propiedad
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <div className="text-3xl font-light">{project.propiedades.length}</div>
          <div className="text-gray-500 mt-1">Propiedades Totales</div>
          {isAdmin && (
            <Button variant="outline" className="w-full mt-4">
              Cargar o modificar
            </Button>
          )}
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="text-3xl font-light">
            {project.propiedades.filter(p => p.estadoUso === 'enUso').length}
          </div>
          <div className="text-gray-500 mt-1">Propiedades Activas</div>
          {isAdmin && (
            <Button variant="outline" className="w-full mt-4">
              Filtrar
            </Button>
          )}
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="text-3xl font-light">
            {project.propiedades.reduce((sum, prop) => sum + (prop.areaTotal || 0), 0)} m²
          </div>
          <div className="text-gray-500 mt-1">Área Total</div>
          {isAdmin && (
            <Button variant="outline" className="w-full mt-4">
              Ver detalles
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008A4B]/20 focus:border-[#008A4B]"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <FunnelIcon className="w-4 h-4" />
          Categoría
        </Button>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {project.propiedades.map((property) => (
          <Link 
            href={`/dashboard/proyectos/${projectId}/propiedades/${property.documentId}`} 
            key={property.documentId}
          >
            <motion.div
              className="bg-white rounded-xl border overflow-hidden group cursor-pointer"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative h-48 bg-gray-100">
                {project.fotoProyecto?.url ? (
                  <Image
                    src={project.fotoProyecto.url}
                    alt={`${property.identificadores.superior} ${property.identificadores.idSuperior} ${property.identificadores.inferior} ${property.identificadores.idInferior}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <BuildingOffice2Icon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm">
                    {property.areaTotal} m²
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#008A4B] transition-colors">
                      {property.identificadores.superior} {property.identificadores.idSuperior}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {property.identificadores.inferior} {property.identificadores.idInferior}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{property.actividad?.replaceAll("_", " ")}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      property.estadoUso === "enUso" 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {property.estadoUso === "enUso" ? "En uso" : "Disponible"}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      property.estadoOcupacion === "usoPropietario"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-orange-100 text-orange-800"
                    }`}>
                      {property.ocupantes.some(ocupante => ocupante.tipoOcupante === "arrendatario") ? "Arrendado" : "Uso Propietario"}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-gray-600">
                  {/* <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    property.estadoDeConstruccion === "finalizada"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {property.estadoDeConstruccion}
                  </div> */}
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

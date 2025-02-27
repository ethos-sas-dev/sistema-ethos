"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "../../../_components/ui/button";
import { formatNumber } from "../../../_lib/utils";
import { 
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BuildingOffice2Icon,
  PlusIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import { use } from 'react';
import { useAuth } from '../../../_lib/auth/AuthContext';
import { gql, useQuery } from '@apollo/client';
import PropertyCard from './_components/PropertyCard';
import type { Project, Property } from '../../../types';
import { useProject } from '../../_hooks/useProject';
import LoadingSpinner from '../../_components/LoadingSpinner';
import ErrorMessage from '../../_components/ErrorMessage';

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
      propiedades(pagination: { limit: -1 }) {
        imagen {
          documentId
          url
        }
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
        propietario {
          tipoPersona
          datosPersonaNatural {
            razonSocial
            cedula
            ruc
          }
          datosPersonaJuridica {
            razonSocial
            nombreComercial
          }
          contactoAccesos {
            nombreCompleto
            email
            telefono
          }
        }
        createdAt
        updatedAt
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

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { role } = useAuth();
  const router = useRouter();
  const { project, isLoading, isError, mutate } = useProject(projectId);

  const isAdmin = role === 'Administrador' || role === 'Directorio';

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [activeFilters, setActiveFilters] = useState<{
    tipoOcupacion: string | null;
    actividad: string | null;
    estadoUso: string | null;
  }>({
    tipoOcupacion: null,
    actividad: null,
    estadoUso: null
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState<string | null>(null);

  // Extraer valores únicos para los filtros
  const getUniqueActividades = () => {
    if (!project?.propiedades) return [];
    const actividades = project.propiedades
      .map((p: Property) => p.actividad)
      .filter((value: string | undefined, index: number, self: (string | undefined)[]) => 
        value && self.indexOf(value) === index
      ) as string[];
    return actividades;
  };

  useEffect(() => {
    if (project?.propiedades) {
      let filtered = [...project.propiedades];
      
      // Aplicar búsqueda por texto
      if (searchTerm) {
        const searchTerms = searchTerm.toLowerCase().split(' ').filter(term => term.length > 0);
        
        filtered = filtered.filter((property: Property) => {
          // Texto completo de identificadores para búsqueda
          const identificadoresText = `${property.identificadores?.superior || ''} ${property.identificadores?.idSuperior || ''} ${property.identificadores?.inferior || ''} ${property.identificadores?.idInferior || ''}`.toLowerCase();
          
          // Texto del propietario para búsqueda
          const propietarioText = property.propietario ? (
            property.propietario.tipoPersona === "Natural" 
              ? (property.propietario.datosPersonaNatural?.razonSocial || '').toLowerCase()
              : (property.propietario.datosPersonaJuridica?.razonSocial || '').toLowerCase()
          ) : '';
          
          // Verificar si todos los términos de búsqueda están presentes
          return searchTerms.every(term => 
            identificadoresText.includes(term) || propietarioText.includes(term)
          );
        });
      }
      
      // Aplicar filtro de tipo de ocupación
      if (activeFilters.tipoOcupacion) {
        if (activeFilters.tipoOcupacion === 'arrendado') {
          filtered = filtered.filter((property: Property) => 
            property.ocupantes?.some(ocupante => ocupante.tipoOcupante === "arrendatario") || false
          );
        } else if (activeFilters.tipoOcupacion === 'propietario') {
          filtered = filtered.filter((property: Property) => 
            !(property.ocupantes?.some(ocupante => ocupante.tipoOcupante === "arrendatario") || false)
          );
        }
      }
      
      // Aplicar filtro de actividad
      if (activeFilters.actividad) {
        filtered = filtered.filter((property: Property) => 
          property.actividad === activeFilters.actividad
        );
      }
      
      // Aplicar filtro de estado de uso
      if (activeFilters.estadoUso) {
        filtered = filtered.filter((property: Property) => 
          property.estadoUso === activeFilters.estadoUso
        );
      }
      
      // Aplicar ordenamiento
      if (sortOption) {
        filtered.sort((a, b) => {
          // Función auxiliar para convertir cualquier formato de fecha a timestamp
          const getTimestamp = (dateStr: string | null | undefined): number => {
            if (!dateStr) return 0;
            try {
              return new Date(dateStr).getTime();
            } catch (e) {
              console.error("Error al convertir fecha:", dateStr, e);
              return 0;
            }
          };

          // Función para extraer el timestamp del ID (asumiendo que es un ObjectId de MongoDB o similar)
          const getTimestampFromId = (id: string | null | undefined): number => {
            if (!id) return 0;
            // Si el ID tiene un formato que incluye timestamp (como ObjectId de MongoDB)
            // podemos intentar extraerlo, o simplemente usar el ID para comparación lexicográfica
            return id.length;
          };

          switch (sortOption) {
            case 'newest':
              // Intentar usar createdAt, si no está disponible usar el ID
              const timestampA = getTimestamp(a.createdAt);
              const timestampB = getTimestamp(b.createdAt);
              if (timestampA === 0 || timestampB === 0) {
                // Fallback a comparación por ID
                return b.documentId.localeCompare(a.documentId);
              }
              return timestampB - timestampA;
            case 'oldest':
              // Intentar usar createdAt, si no está disponible usar el ID
              const timestampAOld = getTimestamp(a.createdAt);
              const timestampBOld = getTimestamp(b.createdAt);
              if (timestampAOld === 0 || timestampBOld === 0) {
                // Fallback a comparación por ID
                return a.documentId.localeCompare(b.documentId);
              }
              return timestampAOld - timestampBOld;
            case 'recently_updated':
              // Intentar usar updatedAt, si no está disponible usar createdAt o ID
              const updatedA = getTimestamp(a.updatedAt);
              const updatedB = getTimestamp(b.updatedAt);
              if (updatedA === 0 || updatedB === 0) {
                // Fallback a createdAt o ID
                const createdA = getTimestamp(a.createdAt);
                const createdB = getTimestamp(b.createdAt);
                if (createdA === 0 || createdB === 0) {
                  return b.documentId.localeCompare(a.documentId);
                }
                return createdB - createdA;
              }
              return updatedB - updatedA;
            case 'area_desc':
              return (b.areaTotal || 0) - (a.areaTotal || 0);
            case 'area_asc':
              return (a.areaTotal || 0) - (b.areaTotal || 0);
            case 'alpha_asc':
              // Ordenar alfabéticamente por identificadores (A-Z)
              const idTextA = `${a.identificadores?.superior || ''} ${a.identificadores?.idSuperior || ''} ${a.identificadores?.inferior || ''} ${a.identificadores?.idInferior || ''}`.toLowerCase();
              const idTextB = `${b.identificadores?.superior || ''} ${b.identificadores?.idSuperior || ''} ${b.identificadores?.inferior || ''} ${b.identificadores?.idInferior || ''}`.toLowerCase();
              return idTextA.localeCompare(idTextB);
            case 'alpha_desc':
              // Ordenar alfabéticamente por identificadores (Z-A)
              const idTextADesc = `${a.identificadores?.superior || ''} ${a.identificadores?.idSuperior || ''} ${a.identificadores?.inferior || ''} ${a.identificadores?.idInferior || ''}`.toLowerCase();
              const idTextBDesc = `${b.identificadores?.superior || ''} ${b.identificadores?.idSuperior || ''} ${b.identificadores?.inferior || ''} ${b.identificadores?.idInferior || ''}`.toLowerCase();
              return idTextBDesc.localeCompare(idTextADesc);
            default:
              return 0;
          }
        });
      }
      
      setFilteredProperties(filtered);
    }
  }, [searchTerm, project?.propiedades, activeFilters, sortOption]);

  const handleFilterChange = (filterType: 'tipoOcupacion' | 'actividad' | 'estadoUso', value: string | null) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType] === value ? null : value
    }));
  };

  const handleSortChange = (value: string | null) => {
    setSortOption(value === sortOption ? null : value);
  };

  const clearFilters = () => {
    setActiveFilters({
      tipoOcupacion: null,
      actividad: null,
      estadoUso: null
    });
    setSortOption(null);
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage />;
  if (!project) return null;

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
      {/* Banner y detalles principales */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="relative h-64">
          <Link href="/dashboard/proyectos">
            <Button
              variant="outline"
              size="icon"
              className="absolute top-6 left-6 z-10 rounded-full w-8 h-8 bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30"
            >
              <ArrowLeftIcon className="w-4 h-4 text-white" />
            </Button>
          </Link>
          {isAdmin && (
            <Button 
              className="absolute top-6 right-6 z-10 bg-[#008A4B] hover:bg-[#006837] flex items-center gap-2"
              onClick={() => router.push(`/dashboard/proyectos/${projectId}/nueva-propiedad`)}
            >
              <PlusIcon className="w-4 h-4" />
              Nueva Propiedad
            </Button>
          )}
          <Image
            src={project.fotoProyecto?.url || "/ofibodega.png"}
            alt={project.nombre}
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-semibold">{project.nombre}</h1>
                <p className="text-white/90 mt-2">{project.ubicacion}</p>
              </div>
              {project.unidadNegocio && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm">
                  {project.unidadNegocio.nombre}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Descripción del proyecto */}
        <div className="p-6 border-t">
          <div className="max-w-3xl">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Sobre el proyecto</h2>
            <p className="text-gray-600">{project.descripcion}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <div className="text-3xl font-light">{project.propiedades.length}</div>
          <div className="text-gray-500 mt-1">Propiedades Totales</div>
          {/* {isAdmin && (
            <Button variant="outline" className="w-full mt-4">
              Cargar
            </Button>
          )} */}
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="text-3xl font-light">
            {project.propiedades.filter((p: Property) => p.estadoUso === 'enUso').length}
          </div>
          <div className="text-gray-500 mt-1">Propiedades En Uso</div>
          {/* {isAdmin && (
            <Button variant="outline" className="w-full mt-4">
              Filtrar
            </Button>
          )} */}
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="text-3xl font-light">
            {formatNumber(project.propiedades.reduce((sum: number, prop: Property) => sum + (prop.areaTotal || 0), 0), true)} m²
          </div>
          <div className="text-gray-500 mt-1">Área Total</div>
          {/* {isAdmin && (
            <Button variant="outline" className="w-full mt-4">
              Ver detalles
            </Button>
          )} */}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por identificadores (ej: manzana 2 solar 3) o propietario"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008A4B]/20 focus:border-[#008A4B]"
            />
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FunnelIcon className="w-4 h-4" />
            Filtros
            {(Object.values(activeFilters).some(filter => filter !== null) || sortOption) && (
              <span className="flex items-center justify-center w-5 h-5 bg-[#008A4B] text-white rounded-full text-xs">
                {Object.values(activeFilters).filter(filter => filter !== null).length + (sortOption ? 1 : 0)}
              </span>
            )}
          </Button>
        </div>
        
        {/* Filtros expandibles */}
        {showFilters && (
          <div className="bg-white rounded-lg border p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Filtros</h3>
              {(Object.values(activeFilters).some(filter => filter !== null) || sortOption) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-2">Ordenar por</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={sortOption === 'alpha_asc' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSortChange('alpha_asc')}
                    className={sortOption === 'alpha_asc' ? 'bg-[#008A4B] hover:bg-[#006837]' : ''}
                  >
                    Identificador A-Z
                  </Button>
                  <Button
                    variant={sortOption === 'alpha_desc' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSortChange('alpha_desc')}
                    className={sortOption === 'alpha_desc' ? 'bg-[#008A4B] hover:bg-[#006837]' : ''}
                  >
                    Identificador Z-A
                  </Button>
                  <Button
                    variant={sortOption === 'area_desc' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSortChange('area_desc')}
                    className={sortOption === 'area_desc' ? 'bg-[#008A4B] hover:bg-[#006837]' : ''}
                  >
                    Mayor área
                  </Button>
                  <Button
                    variant={sortOption === 'area_asc' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSortChange('area_asc')}
                    className={sortOption === 'area_asc' ? 'bg-[#008A4B] hover:bg-[#006837]' : ''}
                  >
                    Menor área
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Tipo de ocupación</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={activeFilters.tipoOcupacion === 'arrendado' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('tipoOcupacion', 'arrendado')}
                    className={activeFilters.tipoOcupacion === 'arrendado' ? 'bg-[#008A4B] hover:bg-[#006837]' : ''}
                  >
                    Arrendado
                  </Button>
                  <Button
                    variant={activeFilters.tipoOcupacion === 'propietario' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('tipoOcupacion', 'propietario')}
                    className={activeFilters.tipoOcupacion === 'propietario' ? 'bg-[#008A4B] hover:bg-[#006837]' : ''}
                  >
                    Uso Propietario
                  </Button>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Estado de uso</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={activeFilters.estadoUso === 'enUso' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('estadoUso', 'enUso')}
                    className={activeFilters.estadoUso === 'enUso' ? 'bg-[#008A4B] hover:bg-[#006837]' : ''}
                  >
                    En uso
                  </Button>
                  <Button
                    variant={activeFilters.estadoUso === 'disponible' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('estadoUso', 'disponible')}
                    className={activeFilters.estadoUso === 'disponible' ? 'bg-[#008A4B] hover:bg-[#006837]' : ''}
                  >
                    Disponible
                  </Button>
                </div>
              </div>
              
              {getUniqueActividades().length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Actividad</p>
                  <div className="flex flex-wrap gap-2">
                    {getUniqueActividades().map((actividad) => (
                      <Button
                        key={actividad}
                        variant={activeFilters.actividad === actividad ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleFilterChange('actividad', actividad)}
                        className={activeFilters.actividad === actividad ? 'bg-[#008A4B] hover:bg-[#006837]' : ''}
                      >
                        {actividad.replaceAll("_", " ")}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Filtros activos */}
        {(Object.values(activeFilters).some(filter => filter !== null) || sortOption) && (
          <div className="flex flex-wrap gap-2">
            {sortOption && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {sortOption === 'area_desc' ? 'Mayor área' :
                 sortOption === 'area_asc' ? 'Menor área' :
                 sortOption === 'alpha_asc' ? 'Identificador A-Z' :
                 sortOption === 'alpha_desc' ? 'Identificador Z-A' : ''}
                <XMarkIcon 
                  className="w-4 h-4 ml-1 cursor-pointer" 
                  onClick={() => setSortOption(null)}
                />
              </span>
            )}
            {activeFilters.tipoOcupacion && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {activeFilters.tipoOcupacion === 'arrendado' ? 'Arrendado' : 'Uso Propietario'}
                <XMarkIcon 
                  className="w-4 h-4 ml-1 cursor-pointer" 
                  onClick={() => handleFilterChange('tipoOcupacion', null)}
                />
              </span>
            )}
            {activeFilters.estadoUso && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {activeFilters.estadoUso === 'enUso' ? 'En uso' : 'Disponible'}
                <XMarkIcon 
                  className="w-4 h-4 ml-1 cursor-pointer" 
                  onClick={() => handleFilterChange('estadoUso', null)}
                />
              </span>
            )}
            {activeFilters.actividad && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {activeFilters.actividad.replaceAll("_", " ")}
                <XMarkIcon 
                  className="w-4 h-4 ml-1 cursor-pointer" 
                  onClick={() => handleFilterChange('actividad', null)}
                />
              </span>
            )}
          </div>
        )}
      </div>

      {/* Properties Grid */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        {project.propiedades && filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.documentId}
                property={property}
                projectId={projectId}
                projectImage={property.imagen?.url}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            {project.propiedades.length === 0 ? (
              <>
                No hay propiedades registradas en este proyecto. <br />
                {isAdmin && "Puedes agregar una nueva propiedad usando el botón 'Nueva Propiedad'."}
              </>
            ) : (
              <>
                No se encontraron propiedades con los filtros seleccionados. <br />
                <Button 
                  variant="link" 
                  onClick={clearFilters}
                  className="text-[#008A4B]"
                >
                  Limpiar filtros
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

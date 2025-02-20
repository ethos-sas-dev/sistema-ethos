"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "../../../../../_components/ui/button";
import {
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOffice2Icon,
  ClipboardDocumentListIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { use } from "react";
import { useAuth } from "../../../../../_lib/auth/AuthContext";
import { gql, useQuery } from "@apollo/client";
import Image from "next/image";

// Interfaces para los documentos
interface Document {
  url: string;
  fechaSubida: string;
  nombre: string;
}

interface ContactInfo {
  nombreCompleto?: string;
  email?: string;
  telefono?: string;
}

interface AreaDesglosada {
  id: string;
  area: number;
  tasaAlicuotaOrdinariaEspecial?: number;
  tipoDeArea: string;
  nombreAdicional?: string;
  tieneTasaAlicuotaOrdinariaEspecial: boolean;
}

interface RucDocument {
  ruc: string;
  rucPdf: Document;
}

interface EmpresaRepresentanteLegal {
  autorizacionRepresentacionPdf: Document;
  cedulaRepresentanteLegalPdf: Document;
  rucEmpresaRepresentanteLegal: RucDocument;
  nombreComercial?: string;
  nombreRepresentanteLegalRL?: string;
  cedulaRepresentanteLegal?: string;
  direccionLegal?: string;
  observaciones?: string;
}

interface DatosPersonaJuridica {
  cedulaRepresentanteLegalPdf: Document;
  nombramientoRepresentanteLegalPdf: Document;
  rucPersonaJuridica: Array<RucDocument>;
  cedulaRepresentanteLegal: string;
  representanteLegalEsEmpresa: boolean;
  razonSocialRepresentanteLegal: string;
  razonSocial: string;
  nombreComercial?: string;
  empresaRepresentanteLegal?: EmpresaRepresentanteLegal;
}

interface DatosPersonaNatural {
  cedulaPdf: Document;
  rucPdf?: Document;
  aplicaRuc: boolean;
  cedula: string;
  ruc?: string;
  razonSocial: string;
}

interface Propietario {
  contactoAccesos: ContactInfo;
  contactoAdministrativo?: ContactInfo;
  contactoGerente?: ContactInfo;
  contactoProveedores?: ContactInfo;
  contratosArrendamiento?: {
    archivo: Document;
  }[];
  datosPersonaJuridica?: DatosPersonaJuridica;
  datosPersonaNatural?: DatosPersonaNatural;
  tipoPersona: "Natural" | "Juridica";
}

interface Ocupante {
  tipoOcupante: string;
  datosPersonaJuridica?: {
    cedulaRepresentanteLegalPdf: Document;
    nombramientoRepresentanteLegalPdf: Document;
    rucPersonaJuridica: Array<RucDocument>;
    razonSocial: string;
  };
  datosPersonaNatural?: {
    cedulaPdf: Document;
    aplicaRuc: boolean;
    rucPdf?: Document;
    razonSocial: string;
    ruc?: string;
  };
  perfilCliente?: {
    datosPersonaNatural?: {
      cedulaPdf: Document;
      aplicaRuc: boolean;
      rucPdf?: Document;
      razonSocial: string;
      ruc?: string;
    };
    datosPersonaJuridica?: {
      cedulaRepresentanteLegalPdf: Document;
      nombramientoRepresentanteLegalPdf: Document;
      rucPersonaJuridica: Array<RucDocument>;
      razonSocial: string;
    };
    contactoAccesos?: {
      nombreCompleto: string;
      email: string;
      telefono: string;
    };
    contactoAdministrativo?: {
      email: string;
      telefono: string;
    };
    contactoGerente?: {
      email: string;
      telefono: string;
    };
    contactoProveedores?: {
      email: string;
      telefono: string;
    };
  };
}

interface Solicitud {
  detallesSolicitud: {
    descripcion: string;
    motivoSolicitud: string;
  };
}

interface Property {
  proyecto: {
    nombre: string;
  };
  documentId: string;
  identificadores: {
    idSuperior: string;
    superior: string;
    idInferior: string;
    inferior: string;
  };
  estadoEntrega: "entregado" | "noEntregado";
  estadoUso: "enUso" | "disponible";
  estadoDeConstruccion:
    | "enPlanos"
    | "enConstruccion"
    | "obraGris"
    | "acabados"
    | "finalizada"
    | "remodelacion"
    | "demolicion"
    | "abandonada"
    | "paralizada";
  areaTotal: number;
  areasDesglosadas: AreaDesglosada[];
  montoFondoInicial: number;
  montoAlicuotaOrdinaria: number;
  modoIncognito: boolean;
  actaEntregaPdf?: Document;
  contratoArrendamientoPdf?: Document;
  escrituraPdf?: Document;
  codigoCatastral: string;
  propietario?: Propietario;
  ocupantes?: Ocupante[];
  solicitudes?: Solicitud[];
  pagos?: {
    encargadoDePago: string;
    fechaExpiracionEncargadoDePago: string;
  };
  actividad?: string;
  componentesAdicionales?: {
    adecuaciones?: Array<{
      costo: number;
      descripcion: string;
      documentosRespaldos: Array<{
        nombre: string;
        validoDesde: string;
        validoHasta: string;
        url: string;
      }>;
      estado: string;
      fechaRealizacion: string;
      responsable: string;
      tipoAdecuacion: string;
    }>;
    tieneTrampasGrasa: boolean;
    tieneAdecuaciones: boolean;
    trampasGrasa?: Array<{
      estado: string;
      descripcion: string;
      capacidad: number;
      tipo: string;
      ubicacionInterna: string;
      fechaInstalacion: string;
      documentosRespaldos: Array<{
        nombre: string;
        validoDesde: string;
        validoHasta: string;
        url: string;
      }>;
    }>;
    CuantasTrampasEstaObligadoATener?: number;
    ObligadoTrampaDeGrasa: boolean;
  };
}

const GET_PROPERTY_DETAILS = gql`
  query Propiedad($documentId: ID!) {
    propiedad(documentId: $documentId) {
      pagos {
        encargadoDePago
        fechaExpiracionEncargadoDePago
      }
      actividad
      proyecto {
        nombre
      }
      actaEntregaPdf {
        url
        fechaSubida
        nombre
      }
      areaTotal
      areasDesglosadas {
        id
        area
        tasaAlicuotaOrdinariaEspecial
        tipoDeArea
        nombreAdicional
        tieneTasaAlicuotaOrdinariaEspecial
      }
      codigoCatastral
      contratoArrendamientoPdf {
        url
        fechaSubida
        nombre
      }
      documentId
      escrituraPdf {
        url
        nombre
        fechaSubida
      }
      estadoDeConstruccion
      estadoEntrega
      estadoUso
      identificadores {
        idInferior
        idSuperior
        inferior
        superior
      }
      modoIncognito
      montoAlicuotaOrdinaria
      montoFondoInicial
      componentesAdicionales {
        adecuaciones {
          costo
          descripcion
          documentosRespaldos {
            nombre
            validoDesde
            validoHasta
            url
          }
          estado
          fechaRealizacion
          responsable
          tipoAdecuacion
        }
        tieneTrampasGrasa
        tieneAdecuaciones
        trampasGrasa {
          estado
          descripcion
          capacidad
          tipo
          ubicacionInterna
          fechaInstalacion
          documentosRespaldos {
            nombre
            validoDesde
            validoHasta
            url
          }
        }
        CuantasTrampasEstaObligadoATener
        ObligadoTrampaDeGrasa
      }
      propietario {
        contactoAccesos {
          nombreCompleto
          telefono
          email
        }
        contactoAdministrativo {
          email
          telefono
        }
        contactoGerente {
          email
          telefono
        }
        contactoProveedores {
          email
          telefono
        }
        contratosArrendamiento {
          archivo {
            nombre
            fechaSubida
            url
          }
        }
        datosPersonaJuridica {
          cedulaRepresentanteLegalPdf {
            nombre
            fechaSubida
            url
          }
          nombramientoRepresentanteLegalPdf {
            nombre
            fechaSubida
            url
          }
          rucPersonaJuridica {
            ruc
            rucPdf {
              nombre
              fechaSubida
              url
            }
          }
          cedulaRepresentanteLegal
          razonSocialRepresentanteLegal
          razonSocial
          representanteLegalEsEmpresa
          nombreComercial
          empresaRepresentanteLegal {
            autorizacionRepresentacionPdf {
              nombre
              fechaSubida
              url
            }
            cedulaRepresentanteLegalPdf {
              nombre
              fechaSubida
              url
            }
            rucEmpresaRepresentanteLegal {
              ruc
              rucPdf {
                nombre
                fechaSubida
                url
              }
            }
            nombreComercial
            nombreRepresentanteLegalRL
            observaciones
            direccionLegal
            cedulaRepresentanteLegal
          }
        }
        datosPersonaNatural {
          cedulaPdf {
            nombre
            fechaSubida
            url
          }
          rucPdf {
            nombre
            fechaSubida
            url
          }
          aplicaRuc
          cedula
          ruc
          razonSocial
        }
        tipoPersona
      }
      ocupantes {
        tipoOcupante
        datosPersonaJuridica {
          cedulaRepresentanteLegalPdf {
            nombre
            fechaSubida
            url
          }
          nombramientoRepresentanteLegalPdf {
            nombre
            fechaSubida
            url
          }
          rucPersonaJuridica {
            ruc
            rucPdf {
              nombre
              fechaSubida
              url
            }
          }
          razonSocial
        }
        datosPersonaNatural {
          cedulaPdf {
            nombre
            fechaSubida
            url
          }
          aplicaRuc
          rucPdf {
            nombre
            fechaSubida
            url
          }
          razonSocial
        }
        perfilCliente {
          datosPersonaNatural {
            cedulaPdf {
              nombre
              fechaSubida
              url
            }
            aplicaRuc
            rucPdf {
              nombre
              fechaSubida
              url
            }
            razonSocial
          }
          datosPersonaJuridica {
            cedulaRepresentanteLegalPdf {
              nombre
              fechaSubida
              url
            }
            nombramientoRepresentanteLegalPdf {
              nombre
              fechaSubida
              url
            }
            rucPersonaJuridica {
              ruc
              rucPdf {
                nombre
                fechaSubida
                url
              }
            }
            razonSocial
          }
          contactoAccesos {
            nombreCompleto
            email
            telefono
          }
          contactoAdministrativo {
            email
            telefono
          }
          contactoGerente {
            email
            telefono
          }
          contactoProveedores {
            email
            telefono
          }
        }
      }
      solicitudes {
        detallesSolicitud {
          descripcion
          motivoSolicitud
        }
      }
    }
  }
`;

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; propertyId: string }>;
}) {
  const { projectId, propertyId } = use(params);
  const { role } = useAuth();
  const router = useRouter();

  // Verificar si el usuario tiene permisos de administración
  const isAdmin = role === "Administrador" || role === "Directorio";

  const { data, loading, error } = useQuery(GET_PROPERTY_DETAILS, {
    variables: { documentId: propertyId },
    skip: !propertyId,
  });

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008A4B]"></div>
      </div>
    );
  }

  if (error) {
    console.error("Error al cargar la propiedad:", error);
    return (
      <div className="w-full p-4 text-center text-red-600">
        Error al cargar la propiedad. Por favor, intente más tarde.
      </div>
    );
  }

  const property: Property = data?.propiedad;
  console.log(property);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Funciones para contar documentos del propietario
  const getRequiredDocsCount = (property: Property) => {
    if (property.propietario?.datosPersonaJuridica) {
      return property.propietario.datosPersonaJuridica
        .representanteLegalEsEmpresa
        ? 6
        : 3;
    } else if (property.propietario?.datosPersonaNatural) {
      return 1 + (property.propietario.datosPersonaNatural.aplicaRuc ? 1 : 0);
    }
    return 0;
  };

  const getUploadedDocsCount = (property: Property) => {
    if (property.propietario?.datosPersonaJuridica) {
      const docs = [
        property.propietario.datosPersonaJuridica.cedulaRepresentanteLegalPdf,
        property.propietario.datosPersonaJuridica
          .nombramientoRepresentanteLegalPdf,
        ...(property.propietario.datosPersonaJuridica.rucPersonaJuridica?.map(
          (rucDoc) => rucDoc.rucPdf
        ) || []),
        ...(property.propietario.datosPersonaJuridica
          .representanteLegalEsEmpresa
          ? [
              property.propietario.datosPersonaJuridica
                .empresaRepresentanteLegal?.autorizacionRepresentacionPdf,
              property.propietario.datosPersonaJuridica
                .empresaRepresentanteLegal?.cedulaRepresentanteLegalPdf,
              property.propietario.datosPersonaJuridica
                .empresaRepresentanteLegal?.rucEmpresaRepresentanteLegal
                ?.rucPdf,
            ]
          : []),
      ];
      return docs.filter(Boolean).length;
    } else if (property.propietario?.datosPersonaNatural) {
      const docs = [
        property.propietario.datosPersonaNatural.cedulaPdf,
        ...(property.propietario.datosPersonaNatural.aplicaRuc
          ? [property.propietario.datosPersonaNatural.rucPdf]
          : []),
      ];
      return docs.filter(Boolean).length;
    }
    return 0;
  };

  // Actualizar la lógica de documentos requeridos para la propiedad
  const getPropertyRequiredDocsCount = (property: Property) => {
    const baseRequiredDocs = 2; // escritura y acta de entrega
    const needsArrendamientoDoc = property.ocupantes?.some(
      (ocupante) => ocupante.tipoOcupante === "arrendatario"
    );
    return baseRequiredDocs + (needsArrendamientoDoc ? 1 : 0);
  };

  const getPropertyUploadedDocsCount = (property: Property) => {
    const docs = [
      property.escrituraPdf,
      property.actaEntregaPdf,
      ...(property.ocupantes?.some(
        (ocupante) => ocupante.tipoOcupante === "arrendatario"
      )
        ? [property.contratoArrendamientoPdf]
        : []),
    ];
    return docs.filter(Boolean).length;
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
          <Link
            href={`/dashboard/proyectos/${projectId}`}
            className="absolute top-6 left-6 z-10"
          >
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-8 h-8 bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30"
            >
              <ArrowLeftIcon className="w-4 h-4 text-white" />
            </Button>
          </Link>
          {isAdmin && (
            <Button
              className="absolute top-6 right-6 z-10 bg-[#008A4B] hover:bg-[#006837] text-white"
              onClick={() =>
                router.push(
                  `/dashboard/proyectos/${projectId}/propiedades/${propertyId}/editar`
                )
              }
            >
              Editar Propiedad
            </Button>
          )}
          <Image
            src="/ofibodega.png"
            alt={`${property.identificadores.superior} ${property.identificadores.idSuperior}`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-semibold">
                  {property.identificadores.superior}{" "}
                  {property.identificadores.idSuperior}
                </h1>
                <p className="text-white/90 mt-2">
                  {property.identificadores.inferior}{" "}
                  {property.identificadores.idInferior}
                </p>
              </div>
              <div className="flex gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm`}
                >
                  {property.areaTotal} m²
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Información básica */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Código Catastral
                </h3>
                <p className="text-base font-medium mt-1">
                  {property.codigoCatastral}
                </p>
              </div>
              {property.ocupantes && property.ocupantes.length > 0 && (
                <div className="mt-4 space-y-1">
                  <h3 className="text-sm font-medium text-gray-500">
                    Ocupante
                  </h3>
                  <p className="text-base mt-1">
                    {property.ocupantes[0].datosPersonaJuridica?.razonSocial ||
                      property.ocupantes[0].datosPersonaNatural?.razonSocial ||
                      property.ocupantes[0].perfilCliente?.datosPersonaJuridica
                        ?.razonSocial ||
                      property.ocupantes[0].perfilCliente?.datosPersonaNatural
                        ?.razonSocial}
                  </p>
                  <h3 className="text-sm font-medium text-gray-500">RUC</h3>
                  <p className="text-base mt-1">
                    {property.ocupantes[0].datosPersonaJuridica
                      ?.rucPersonaJuridica[0]?.ruc ||
                      property.ocupantes[0].datosPersonaNatural?.ruc ||
                      property.ocupantes[0].perfilCliente?.datosPersonaJuridica
                        ?.rucPersonaJuridica[0]?.ruc ||
                      property.ocupantes[0].perfilCliente?.datosPersonaNatural
                        ?.ruc ||
                      "-"}
                  </p>
                  <h3 className="text-sm text-gray-500">Actividad</h3>
                  {property.actividad ? (
                    <p className="text-base mt-1">
                      {property.actividad.replaceAll("_", " ")}
                    </p>
                  ) : (
                    <p className="text-base mt-1">-</p>
                  )}
                </div>
              )}
             
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Estado de Uso
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    property.estadoUso === "enUso"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {property.estadoUso === "enUso" ? "En uso" : "Disponible"}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Estado de Ocupación
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    property.ocupantes?.some(
                      (ocupante) => ocupante.tipoOcupante === "propietario"
                    )
                      ? "bg-purple-100 text-purple-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {property.ocupantes?.some(
                    (ocupante) => ocupante.tipoOcupante === "propietario"
                  )
                    ? "Uso propietario"
                    : "Arrendado"}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Estado de Construcción
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    property.estadoDeConstruccion === "finalizada"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {property.estadoDeConstruccion.charAt(0).toUpperCase() +
                    property.estadoDeConstruccion.slice(1)}
                </span>
              </div>
            </div>
          
          </div>
        </div>

        {/* Sección de Trampas de Grasa */}
        <div className="p-6 border-t">
          <h2 className="text-xl font-semibold mb-6">Trampas de Grasa</h2>
          
          <div className="space-y-6">
            {/* Estado de obligatoriedad */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center">
                <h2 className="text-sm text-gray-500 mr-3">Obligatoriedad:</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  property.componentesAdicionales?.ObligadoTrampaDeGrasa
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {property.componentesAdicionales?.ObligadoTrampaDeGrasa
                    ? "Obligado a tener trampas de grasa"
                    : "No obligado a tener trampas de grasa"}
                </span>
              </div>

              {property.componentesAdicionales?.ObligadoTrampaDeGrasa && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500">Trampas requeridas</div>
                    <div className="text-2xl font-semibold text-gray-900 mt-1">
                      {property.componentesAdicionales.CuantasTrampasEstaObligadoATener}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500">Trampas instaladas</div>
                    <div className="text-2xl font-semibold text-gray-900 mt-1">
                      {property.componentesAdicionales.trampasGrasa?.length || 0}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Lista de trampas instaladas */}
            {property.componentesAdicionales?.trampasGrasa && property.componentesAdicionales.trampasGrasa.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {property.componentesAdicionales.trampasGrasa.map((trampa, index) => (
                  <div key={index} className="bg-white rounded-xl border p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">Trampa {index + 1}</h3>
                        <p className="text-sm text-gray-500">{trampa.descripcion}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        trampa.estado === "activa" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {trampa.estado}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Capacidad:</span>
                        <span className="font-medium">{trampa.capacidad} litros</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tipo:</span>
                        <span className="font-medium">{trampa.tipo}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Ubicación:</span>
                        <span className="font-medium">{trampa.ubicacionInterna}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Fecha instalación:</span>
                        <span className="font-medium">{new Date(trampa.fechaInstalacion).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {trampa.documentosRespaldos && trampa.documentosRespaldos.length > 0 ? (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Documentos de respaldo</h4>
                        <div className="space-y-2">
                          {trampa.documentosRespaldos.map((doc, docIndex) => (
                            <a
                              key={docIndex}
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm text-blue-600 hover:text-blue-800"
                            >
                              {doc.nombre}
                            </a>
                          ))}
                        </div>
                      </div>
                    ):(
                     <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                            Documentos de respaldo pendientes
                          </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm"> </p>
            )}
          </div>
        </div>

        {/* Sección de Adecuaciones */}
        {/* <div className="p-6 border-t">
          <h2 className="text-xl font-semibold mb-6">Adecuaciones</h2>
          
          {property.componentesAdicionales?.adecuaciones && property.componentesAdicionales.adecuaciones.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {property.componentesAdicionales.adecuaciones.map((adecuacion, index) => (
                <div key={index} className="bg-white rounded-xl border p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">Adecuación {index + 1}</h3>
                      <p className="text-sm text-gray-500">{adecuacion.descripcion}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      adecuacion.estado === "completada" 
                        ? "bg-green-100 text-green-800" 
                        : adecuacion.estado === "en_proceso"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {adecuacion.estado.replace("_", " ")}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Costo:</span>
                      <span className="font-medium">${adecuacion?.costo?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tipo:</span>
                      <span className="font-medium">{adecuacion.tipoAdecuacion}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Responsable:</span>
                      <span className="font-medium">{adecuacion.responsable}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Fecha realización:</span>
                      <span className="font-medium">{new Date(adecuacion.fechaRealizacion).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {adecuacion.documentosRespaldos && adecuacion.documentosRespaldos.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Documentos de respaldo</h4>
                      <div className="space-y-2">
                        {adecuacion.documentosRespaldos.map((doc, docIndex) => (
                          <a
                            key={docIndex}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-blue-600 hover:text-blue-800"
                          >
                            {doc.nombre}
                            <div className="text-xs text-gray-500">
                              Válido: {new Date(doc.validoDesde).toLocaleDateString()} - {new Date(doc.validoHasta).toLocaleDateString()}
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay adecuaciones registradas</p>
          )}
        </div> */}
           </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Áreas */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-xl font-semibold mb-4">Áreas</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Área Total</h3>
                <p className="mt-1 text-2xl font-light">
                  {property.areaTotal} m²
                </p>
              </div>

              {property.areasDesglosadas &&
                property.areasDesglosadas.length > 0 &&
                property.areasDesglosadas.map((area) => (
                  <div key={area.id} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500">
                      {area.nombreAdicional || area.tipoDeArea}
                    </h3>
                    <p className="mt-1 text-xl font-light">{area.area} m²</p>
                    {area.tieneTasaAlicuotaOrdinariaEspecial && (
                      <p className="mt-1 text-xs text-gray-500">
                        Tasa especial: {area.tasaAlicuotaOrdinariaEspecial}%
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Montos */}
          <div className="bg-white rounded-xl border p-4 lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4">
              Valores Asociados a la Propiedad
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-medium text-gray-500">
                  {property.proyecto.nombre == "Almax 2"
                    ? "Aporte Patrimonial"
                    : "Fondo Inicial"}
                </h3>
                <p className="mt-1 text-lg font-light">
                  ${property.montoFondoInicial.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-medium text-gray-500">
                  Alícuota Ordinaria
                </h3>
                <p className="mt-1 text-lg font-light">
                  ${property.montoAlicuotaOrdinaria.toFixed(2)}
                </p>
              </div>
              {property.pagos && (
                <div className="col-span-2 bg-gray-50 rounded-lg p-3">
                  <h3 className="text-sm font-medium text-gray-500">
                    Información de Pago
                  </h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Encargado de pago:</span>{" "}
                      {property.pagos.encargadoDePago.charAt(0).toUpperCase() +
                        property.pagos.encargadoDePago.slice(1) || "-"}
                    </p>
                    {property.pagos.fechaExpiracionEncargadoDePago && (
                      <p className="text-sm">
                        <span className="font-medium">Fecha de expiración:</span>{" "}
                        {formatDate(
                          property.pagos.fechaExpiracionEncargadoDePago
                        )}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sección de Contactos */}
          {property.propietario && (
            <div className="bg-white rounded-xl border p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold mb-4">
                Información de Contacto
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Contacto de Accesos */}
                {property.propietario.contactoAccesos && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Contacto de Accesos
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <UserIcon className="w-4 h-4 text-gray-500 mt-0.5" />
                        <p className="text-sm">
                          <span className="font-medium">
                            {property.propietario.contactoAccesos.nombreCompleto}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <PhoneIcon className="w-4 h-4 text-gray-500 mt-0.5" />
                        <p className="text-sm">
                          <span className="font-medium">
                            {property.propietario.contactoAccesos.telefono}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <EnvelopeIcon className="w-4 h-4 text-gray-500 mt-0.5" />
                        <a
                          href={`mailto:${property.propietario.contactoAccesos.email}`}
                          className="text-sm font-medium text-[#008A4B] hover:underline"
                        >
                          {property.propietario.contactoAccesos.email}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contacto Administrativo */}
                {property.propietario.contactoAdministrativo && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Contacto Administrativo
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <PhoneIcon className="w-4 h-4 text-gray-500 mt-0.5" />
                        <p className="text-sm">
                          <span className="font-medium">
                            {property.propietario.contactoAdministrativo.telefono || "-"}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <EnvelopeIcon className="w-4 h-4 text-gray-500 mt-0.5" />
                        <a
                          href={`mailto:${property.propietario.contactoAdministrativo.email}`}
                          className="text-sm font-medium text-[#008A4B] hover:underline"
                        >
                          {property.propietario.contactoAdministrativo.email || "-"}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contacto Gerente */}
                {property.propietario.contactoGerente && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Contacto Gerente
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <PhoneIcon className="w-4 h-4 text-gray-500 mt-0.5" />
                        <p className="text-sm">
                          <span className="font-medium">
                            {property.propietario.contactoGerente.telefono || "-"}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <EnvelopeIcon className="w-4 h-4 text-gray-500 mt-0.5" />
                        <a
                          href={`mailto:${property.propietario.contactoGerente.email}`}
                          className="text-sm font-medium text-[#008A4B] hover:underline"
                        >
                          {property.propietario.contactoGerente.email || "-"}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contacto Proveedores */}
                {property.propietario.contactoProveedores && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Contacto Proveedores
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <PhoneIcon className="w-4 h-4 text-gray-500 mt-0.5" />
                        <p className="text-sm">
                          <span className="font-medium">
                            {property.propietario.contactoProveedores.telefono || "-"}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <EnvelopeIcon className="w-4 h-4 text-gray-500 mt-0.5" />
                        <a
                          href={`mailto:${property.propietario.contactoProveedores.email}`}
                          className="text-sm font-medium text-[#008A4B] hover:underline"
                        >
                          {property.propietario.contactoProveedores.email || "-"}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Documentos - Full Width */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              Información de la Propiedad
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Documentos de la Propiedad</h3>
              {/* Progress Indicator */}
              <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">
                  {`${getPropertyUploadedDocsCount(
                    property
                  )}/${getPropertyRequiredDocsCount(property)}`}
                </div>
                <div className="text-sm text-gray-500">documentos subidos</div>
              </div>
              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#008A4B] transition-all duration-300"
                  style={{
                    width: (() => {
                      const uploadedDocs = getPropertyUploadedDocsCount(property);
                      const requiredDocs = getPropertyRequiredDocsCount(property);
                      return `${(uploadedDocs / requiredDocs) * 100}%`;
                    })(),
                  }}
                />
              </div>
            </div>
            </div>
            {/* Escritura */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <DocumentArrowDownIcon className="w-6 h-6 text-gray-500" />
                <div>
                  <h4 className="text-base font-semibold text-gray-900">
                    Escritura
                  </h4>
                  {property.escrituraPdf ? (
                    <p className="text-sm text-gray-500">
                      {property.escrituraPdf.nombre}
                      {property.escrituraPdf.fechaSubida &&
                        ` - Subido el ${formatDate(
                          property.escrituraPdf.fechaSubida
                        )}`}
                    </p>
                  ) : (
                    <p className="text-sm text-amber-600">Pendiente de subir</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                className="text-[#008A4B] hover:text-[#006837]"
                onClick={() => window.open(property.escrituraPdf?.url, "_blank")}
                disabled={!property.escrituraPdf}
              >
                Descargar
              </Button>
            </div>

            {/* Acta de Entrega */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <DocumentArrowDownIcon className="w-6 h-6 text-gray-500" />
                <div>
                  <h4 className="text-base font-semibold text-gray-900">
                    Acta de Entrega
                  </h4>
                  {property.actaEntregaPdf ? (
                    <p className="text-sm text-gray-500">
                      {property.actaEntregaPdf.nombre}
                      {property.actaEntregaPdf.fechaSubida &&
                        ` - Subido el ${formatDate(
                          property.actaEntregaPdf.fechaSubida
                        )}`}
                    </p>
                  ) : (
                    <p className="text-sm text-amber-600">Pendiente de subir</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                className="text-[#008A4B] hover:text-[#006837]"
                onClick={() =>
                  window.open(property.actaEntregaPdf?.url, "_blank")
                }
                disabled={!property.actaEntregaPdf}
              >
                Descargar
              </Button>
            </div>

            {/* Contrato de Arrendamiento - solo si la propiedad está arrendada */}
            {property.ocupantes?.some(
              (ocupante) => ocupante.tipoOcupante === "arrendatario"
            ) && (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <DocumentArrowDownIcon className="w-6 h-6 text-gray-500" />
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">
                      Contrato de Arrendamiento
                    </h4>
                    {property.contratoArrendamientoPdf ? (
                      <p className="text-sm text-gray-500">
                        {property.contratoArrendamientoPdf.nombre}
                        {property.contratoArrendamientoPdf.fechaSubida &&
                          ` - Subido el ${formatDate(
                            property.contratoArrendamientoPdf.fechaSubida
                          )}`}
                      </p>
                    ) : (
                      <p className="text-sm text-amber-600">Pendiente de subir</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="text-[#008A4B] hover:text-[#006837]"
                  onClick={() =>
                    window.open(property.contratoArrendamientoPdf?.url, "_blank")
                  }
                  disabled={!property.contratoArrendamientoPdf}
                >
                  Descargar
                </Button>
              </div>
            )}
          </div>

          {/* Documentos del Propietario */}
          {property.propietario && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">
                    Documentos del Propietario
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {property.propietario.tipoPersona === "Juridica"
                      ? property.propietario.datosPersonaJuridica
                          ?.representanteLegalEsEmpresa
                        ? "Persona Jurídica con Empresa Representante Legal"
                        : "Persona Jurídica"
                      : "Persona Natural"}
                  </p>
                </div>
                {/* Progress Indicator for Owner Documents */}
                {(property.propietario.datosPersonaJuridica ||
                  property.propietario.datosPersonaNatural) && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">
                        {(() => {
                          const uploadedCount = getUploadedDocsCount(property);
                          const requiredCount = getRequiredDocsCount(property);
                          return `${uploadedCount}/${requiredCount}`;
                        })()}
                      </div>
                      <div className="text-sm text-gray-500">
                        documentos subidos
                      </div>
                    </div>
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#008A4B] transition-all duration-300"
                        style={{
                          width: `${
                            (getUploadedDocsCount(property) /
                              getRequiredDocsCount(property)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Nueva sección de información detallada del propietario */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-base font-semibold text-gray-900 mb-4">
                  Información del Propietario
                </h4>

                {/* Información para Persona Jurídica */}
                {property.propietario.datosPersonaJuridica && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Razón Social</p>
                      <p className="text-sm font-medium">
                        {property.propietario.datosPersonaJuridica.razonSocial}
                      </p>
                    </div>

                    {property.propietario.datosPersonaJuridica
                      .nombreComercial && (
                      <div>
                        <p className="text-sm text-gray-500">Nombre Comercial</p>
                        <p className="text-sm font-medium">
                          {property.propietario.datosPersonaJuridica
                            .nombreComercial || "-"}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-gray-500">RUC</p>
                      <p className="text-sm font-medium">
                        {property.propietario.datosPersonaJuridica.rucPersonaJuridica
                          .map((ruc) => ruc.ruc)
                          .join(", ")}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Representante Legal</p>
                      <p className="text-sm font-medium">
                        {property.propietario.datosPersonaJuridica
                          .razonSocialRepresentanteLegal || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Cédula del Representante Legal
                      </p>
                      <p className="text-sm font-medium">
                        {property.propietario.datosPersonaJuridica
                          .cedulaRepresentanteLegal || "-"}
                      </p>
                    </div>

                    {/* Información adicional cuando el representante legal es una empresa */}
                    {property.propietario.datosPersonaJuridica
                      .representanteLegalEsEmpresa &&
                      property.propietario.datosPersonaJuridica
                        .empresaRepresentanteLegal && (
                        <>
                          <div className="pt-2 border-t">
                            <p className="text-sm font-semibold text-gray-900 mb-2">
                              Información de la Empresa Representante Legal
                            </p>

                            {property.propietario.datosPersonaJuridica
                              .empresaRepresentanteLegal.nombreComercial && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                  Nombre Comercial
                                </p>
                                <p className="text-sm font-medium">
                                  {property.propietario.datosPersonaJuridica
                                    .empresaRepresentanteLegal.nombreComercial ||
                                    "-"}
                                </p>
                              </div>
                            )}

                            <div className="mt-2">
                              <p className="text-sm text-gray-500">
                                RUC de la Empresa
                              </p>
                              <p className="text-sm font-medium">
                                {property.propietario.datosPersonaJuridica
                                  .empresaRepresentanteLegal
                                  .rucEmpresaRepresentanteLegal.ruc || "-"}
                              </p>
                            </div>

                            {property.propietario.datosPersonaJuridica
                              .empresaRepresentanteLegal
                              .nombreRepresentanteLegalRL && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                  Nombre del Representante Legal
                                </p>
                                <p className="text-sm font-medium">
                                  {property.propietario.datosPersonaJuridica
                                    .empresaRepresentanteLegal
                                    .nombreRepresentanteLegalRL || "-"}
                                </p>
                              </div>
                            )}

                            {property.propietario.datosPersonaJuridica
                              .empresaRepresentanteLegal
                              .cedulaRepresentanteLegal && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                  Cédula del Representante Legal
                                </p>
                                <p className="text-sm font-medium">
                                  {property.propietario.datosPersonaJuridica
                                    .empresaRepresentanteLegal
                                    .cedulaRepresentanteLegal || "-"}
                                </p>
                              </div>
                            )}

                            {property.propietario.datosPersonaJuridica
                              .empresaRepresentanteLegal.direccionLegal && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                  Dirección Legal
                                </p>
                                <p className="text-sm font-medium">
                                  {property.propietario.datosPersonaJuridica
                                    .empresaRepresentanteLegal.direccionLegal ||
                                    "-"}
                                </p>
                              </div>
                            )}

                            {property.propietario.datosPersonaJuridica
                              .empresaRepresentanteLegal.observaciones && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                  Observaciones
                                </p>
                                <p className="text-sm font-medium">
                                  {property.propietario.datosPersonaJuridica
                                    .empresaRepresentanteLegal.observaciones ||
                                    "-"}
                                </p>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                  </div>
                )}

                {/* Información para Persona Natural */}
                {property.propietario.datosPersonaNatural && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Nombre/Razón Social</p>
                      <p className="text-sm font-medium">
                        {property.propietario.datosPersonaNatural.razonSocial}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Cédula</p>
                      <p className="text-sm font-medium">
                        {property.propietario.datosPersonaNatural.cedula}
                      </p>
                    </div>

                    {property.propietario.datosPersonaNatural.aplicaRuc &&
                      property.propietario.datosPersonaNatural.ruc && (
                        <div>
                          <p className="text-sm text-gray-500">RUC</p>
                          <p className="text-sm font-medium">
                            {property.propietario.datosPersonaNatural.ruc}
                          </p>
                        </div>
                      )}
                  </div>
                )}
              </div>

              {/* Listado de Documentos del Propietario */}
              <div className="space-y-4">
                {property.propietario.datosPersonaJuridica && (
                  <>
                    {/* RUC */}
                    {property.propietario.datosPersonaJuridica.rucPersonaJuridica.map(
                      (rucDoc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <DocumentArrowDownIcon className="w-6 h-6 text-gray-500" />
                            <div>
                              <h4 className="text-base font-semibold text-gray-900">
                                RUC
                              </h4>
                              {rucDoc.rucPdf ? (
                                <p className="text-sm text-gray-500">
                                  {rucDoc.ruc}
                                  {rucDoc.rucPdf.fechaSubida &&
                                    ` - Subido el ${formatDate(
                                      rucDoc.rucPdf.fechaSubida
                                    )}`}
                                </p>
                              ) : (
                                <p className="text-sm text-amber-600">
                                  Pendiente de subir
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            className="text-[#008A4B] hover:text-[#006837]"
                            onClick={() =>
                              window.open(rucDoc.rucPdf?.url, "_blank")
                            }
                            disabled={!rucDoc.rucPdf}
                          >
                            Descargar
                          </Button>
                        </div>
                      )
                    )}

                    {/* Cédula del Representante Legal */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <DocumentArrowDownIcon className="w-6 h-6 text-gray-500" />
                        <div>
                          <h4 className="text-base font-semibold text-gray-900">
                            Cédula del Representante Legal
                          </h4>
                          {property.propietario.datosPersonaJuridica
                            .cedulaRepresentanteLegalPdf ? (
                            <p className="text-sm text-gray-500">
                              {
                                property.propietario.datosPersonaJuridica
                                  .cedulaRepresentanteLegalPdf.nombre
                              }
                              {property.propietario.datosPersonaJuridica
                                .cedulaRepresentanteLegalPdf.fechaSubida &&
                                ` - Subido el ${formatDate(
                                  property.propietario.datosPersonaJuridica
                                    .cedulaRepresentanteLegalPdf.fechaSubida
                                )}`}
                            </p>
                          ) : (
                            <p className="text-sm text-amber-600">
                              Pendiente de subir
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="text-[#008A4B] hover:text-[#006837]"
                        onClick={() =>
                          window.open(
                            property.propietario?.datosPersonaJuridica
                              ?.cedulaRepresentanteLegalPdf?.url,
                            "_blank"
                          )
                        }
                        disabled={
                          !property.propietario?.datosPersonaJuridica
                            ?.cedulaRepresentanteLegalPdf
                        }
                      >
                        Descargar
                      </Button>
                    </div>

                    {/* Nombramiento del Representante Legal */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <DocumentArrowDownIcon className="w-6 h-6 text-gray-500" />
                        <div>
                          <h4 className="text-base font-semibold text-gray-900">
                            Nombramiento del Representante Legal
                          </h4>
                          {property.propietario.datosPersonaJuridica
                            .nombramientoRepresentanteLegalPdf ? (
                            <p className="text-sm text-gray-500">
                              {
                                property.propietario.datosPersonaJuridica
                                  .nombramientoRepresentanteLegalPdf.nombre
                              }
                              {property.propietario.datosPersonaJuridica
                                .nombramientoRepresentanteLegalPdf.fechaSubida &&
                                ` - Subido el ${formatDate(
                                  property.propietario.datosPersonaJuridica
                                    .nombramientoRepresentanteLegalPdf.fechaSubida
                                )}`}
                            </p>
                          ) : (
                            <p className="text-sm text-amber-600">
                              Pendiente de subir
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="text-[#008A4B] hover:text-[#006837]"
                        onClick={() =>
                          window.open(
                            property.propietario?.datosPersonaJuridica
                              ?.nombramientoRepresentanteLegalPdf?.url,
                            "_blank"
                          )
                        }
                        disabled={
                          !property.propietario?.datosPersonaJuridica
                            ?.nombramientoRepresentanteLegalPdf
                        }
                      >
                        Descargar
                      </Button>
                    </div>

                    {/* Documentos adicionales cuando el representante legal es una empresa */}
                    {property.propietario.datosPersonaJuridica
                      .representanteLegalEsEmpresa &&
                      property.propietario.datosPersonaJuridica
                        .empresaRepresentanteLegal && (
                        <>
                          {/* Autorización de representación */}
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <DocumentArrowDownIcon className="w-6 h-6 text-gray-500" />
                              <div>
                                <h4 className="text-base font-semibold text-gray-900">
                                  Autorización de representación
                                </h4>
                                {property.propietario.datosPersonaJuridica
                                  .empresaRepresentanteLegal
                                  .autorizacionRepresentacionPdf ? (
                                  <p className="text-sm text-gray-500">
                                    {
                                      property.propietario.datosPersonaJuridica
                                        .empresaRepresentanteLegal
                                        .autorizacionRepresentacionPdf.nombre
                                    }
                                    {property.propietario.datosPersonaJuridica
                                      .empresaRepresentanteLegal
                                      .autorizacionRepresentacionPdf
                                      .fechaSubida &&
                                      ` - Subido el ${formatDate(
                                        property.propietario.datosPersonaJuridica
                                          .empresaRepresentanteLegal
                                          .autorizacionRepresentacionPdf
                                          .fechaSubida
                                      )}`}
                                  </p>
                                ) : (
                                  <p className="text-sm text-amber-600">
                                    Pendiente de subir
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              className="text-[#008A4B] hover:text-[#006837]"
                              onClick={() =>
                                window.open(
                                  property?.propietario?.datosPersonaJuridica
                                    ?.empresaRepresentanteLegal
                                    ?.autorizacionRepresentacionPdf?.url,
                                  "_blank"
                                )
                              }
                              disabled={
                                !property?.propietario?.datosPersonaJuridica
                                  ?.empresaRepresentanteLegal
                                  ?.autorizacionRepresentacionPdf
                              }
                            >
                              Descargar
                            </Button>
                          </div>

                          {/* Cédula del representante legal de la empresa */}
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <DocumentArrowDownIcon className="w-6 h-6 text-gray-500" />
                              <div>
                                <h4 className="text-base font-semibold text-gray-900">
                                  Cédula del representante legal de la empresa
                                </h4>
                                {property.propietario.datosPersonaJuridica
                                  .empresaRepresentanteLegal
                                  .cedulaRepresentanteLegalPdf ? (
                                  <p className="text-sm text-gray-500">
                                    {
                                      property.propietario.datosPersonaJuridica
                                        .empresaRepresentanteLegal
                                        .cedulaRepresentanteLegalPdf.nombre
                                    }
                                    {property.propietario.datosPersonaJuridica
                                      .empresaRepresentanteLegal
                                      .cedulaRepresentanteLegalPdf.fechaSubida &&
                                      ` - Subido el ${formatDate(
                                        property.propietario.datosPersonaJuridica
                                          .empresaRepresentanteLegal
                                          .cedulaRepresentanteLegalPdf.fechaSubida
                                      )}`}
                                  </p>
                                ) : (
                                  <p className="text-sm text-amber-600">
                                    Pendiente de subir
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              className="text-[#008A4B] hover:text-[#006837]"
                              onClick={() =>
                                window.open(
                                  property?.propietario?.datosPersonaJuridica
                                    ?.empresaRepresentanteLegal
                                    ?.cedulaRepresentanteLegalPdf?.url,
                                  "_blank"
                                )
                              }
                              disabled={
                                !property?.propietario?.datosPersonaJuridica
                                  ?.empresaRepresentanteLegal
                                  ?.cedulaRepresentanteLegalPdf
                              }
                            >
                              Descargar
                            </Button>
                          </div>

                          {/* RUC de la empresa representante legal */}
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <DocumentArrowDownIcon className="w-6 h-6 text-gray-500" />
                              <div>
                                <h4 className="text-base font-semibold text-gray-900">
                                  RUC de la empresa representante legal
                                </h4>
                                {property.propietario.datosPersonaJuridica
                                  .empresaRepresentanteLegal
                                  .rucEmpresaRepresentanteLegal.rucPdf ? (
                                  <p className="text-sm text-gray-500">
                                    {
                                      property.propietario.datosPersonaJuridica
                                        .empresaRepresentanteLegal
                                        .rucEmpresaRepresentanteLegal.rucPdf
                                        .nombre
                                    }
                                    {property.propietario.datosPersonaJuridica
                                      .empresaRepresentanteLegal
                                      .rucEmpresaRepresentanteLegal.rucPdf
                                      .fechaSubida &&
                                      ` - Subido el ${formatDate(
                                        property.propietario.datosPersonaJuridica
                                          .empresaRepresentanteLegal
                                          .rucEmpresaRepresentanteLegal.rucPdf
                                          .fechaSubida
                                      )}`}
                                  </p>
                                ) : (
                                  <p className="text-sm text-amber-600">
                                    Pendiente de subir
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              className="text-[#008A4B] hover:text-[#006837]"
                              onClick={() =>
                                window.open(
                                  property?.propietario?.datosPersonaJuridica
                                    ?.empresaRepresentanteLegal
                                    ?.rucEmpresaRepresentanteLegal?.rucPdf?.url,
                                  "_blank"
                                )
                              }
                              disabled={
                                !property?.propietario?.datosPersonaJuridica
                                  ?.empresaRepresentanteLegal
                                  ?.rucEmpresaRepresentanteLegal?.rucPdf
                              }
                            >
                              Descargar
                            </Button>
                          </div>
                        </>
                      )}
                  </>
                )}

                {/* Documentos para Persona Natural */}
                {property.propietario.datosPersonaNatural && (
                  <>
                    {/* Cédula */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <DocumentArrowDownIcon className="w-6 h-6 text-gray-500" />
                        <div>
                          <h4 className="text-base font-semibold text-gray-900">
                            Cédula
                          </h4>
                          {property.propietario.datosPersonaNatural.cedulaPdf ? (
                            <p className="text-sm text-gray-500">
                              {
                                property.propietario.datosPersonaNatural.cedulaPdf
                                  .nombre
                              }
                              {property.propietario.datosPersonaNatural.cedulaPdf
                                .fechaSubida &&
                                ` - Subido el ${formatDate(
                                  property.propietario.datosPersonaNatural
                                    .cedulaPdf.fechaSubida
                                )}`}
                            </p>
                          ) : (
                            <p className="text-sm text-amber-600">
                              Pendiente de subir
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="text-[#008A4B] hover:text-[#006837]"
                        onClick={() =>
                          window.open(
                            property.propietario?.datosPersonaNatural?.cedulaPdf
                              ?.url,
                            "_blank"
                          )
                        }
                        disabled={
                          !property.propietario?.datosPersonaNatural?.cedulaPdf
                        }
                      >
                        Descargar
                      </Button>
                    </div>

                    {/* RUC (si aplica) */}
                    {property.propietario.datosPersonaNatural.aplicaRuc && (
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <DocumentArrowDownIcon className="w-6 h-6 text-gray-500" />
                          <div>
                            <h4 className="text-base font-semibold text-gray-900">
                              RUC
                            </h4>
                            {property.propietario.datosPersonaNatural.rucPdf ? (
                              <p className="text-sm text-gray-500">
                                {
                                  property.propietario.datosPersonaNatural.rucPdf
                                    .nombre
                                }
                                {property.propietario.datosPersonaNatural.rucPdf
                                  .fechaSubida &&
                                  ` - Subido el ${formatDate(
                                    property.propietario.datosPersonaNatural
                                      .rucPdf.fechaSubida
                                  )}`}
                              </p>
                            ) : (
                              <p className="text-sm text-amber-600">
                                Pendiente de subir
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          className="text-[#008A4B] hover:text-[#006837]"
                          onClick={() =>
                            window.open(
                              property.propietario?.datosPersonaNatural?.rucPdf
                                ?.url,
                              "_blank"
                            )
                          }
                          disabled={
                            !property.propietario?.datosPersonaNatural?.rucPdf
                          }
                        >
                          Descargar
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Ocupantes */}
        {property.ocupantes && property.ocupantes.length > 0 && (
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-xl font-semibold mb-6">Ocupantes</h2>
            <div className="space-y-6">
              {property.ocupantes.map((ocupante, index) => {
                // Determinar si es un ocupante externo o un propietario/arrendatario
                const isExternalOccupant = ocupante.tipoOcupante === "externo";

                // Obtener los datos según el tipo de ocupante
                const datosPersonaJuridica = isExternalOccupant
                  ? ocupante.datosPersonaJuridica
                  : ocupante.perfilCliente?.datosPersonaJuridica;

                const datosPersonaNatural = isExternalOccupant
                  ? ocupante.datosPersonaNatural
                  : ocupante.perfilCliente?.datosPersonaNatural;

                // Calcular documentos requeridos y subidos
                const getDocumentCounts = () => {
                  if (datosPersonaJuridica) {
                    const requiredDocs = 3; // RUC, cédula y nombramiento
                    const uploadedDocs = [
                      ...(datosPersonaJuridica.rucPersonaJuridica?.map(
                        (rucDoc) => rucDoc.rucPdf
                      ) || []),
                      datosPersonaJuridica.cedulaRepresentanteLegalPdf,
                      datosPersonaJuridica.nombramientoRepresentanteLegalPdf,
                    ].filter(Boolean).length;
                    return { requiredDocs, uploadedDocs };
                  } else if (datosPersonaNatural) {
                    const requiredDocs =
                      1 + (datosPersonaNatural.aplicaRuc ? 1 : 0);
                    const uploadedDocs = [
                      datosPersonaNatural.cedulaPdf,
                      ...(datosPersonaNatural.aplicaRuc
                        ? [datosPersonaNatural.rucPdf]
                        : []),
                    ].filter(Boolean).length;
                    return { requiredDocs, uploadedDocs };
                  }
                  return { requiredDocs: 0, uploadedDocs: 0 };
                };

                const { requiredDocs, uploadedDocs } = getDocumentCounts();

                return (
                  <div
                    key={index}
                    className="border-t pt-4 first:border-t-0 first:pt-0"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium">
                          {ocupante.tipoOcupante.charAt(0).toUpperCase() +
                            ocupante.tipoOcupante.slice(1)}
                        </h3>
                        {/* Mostrar razón social */}
                        {(datosPersonaJuridica?.razonSocial ||
                          datosPersonaNatural?.razonSocial) && (
                          <p className="text-sm text-gray-600 mt-1">
                            {datosPersonaJuridica?.razonSocial ||
                              datosPersonaNatural?.razonSocial}
                          </p>
                        )}
                      </div>
                      {/* Progress Indicator for Occupant Documents */}
                      {requiredDocs > 0 && (
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">
                              {`${uploadedDocs}/${requiredDocs}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              documentos subidos
                            </div>
                          </div>
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#008A4B] transition-all duration-300"
                              style={{
                                width: `${(uploadedDocs / requiredDocs) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Información detallada del ocupante */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h4 className="text-base font-semibold text-gray-900 mb-4">
                        Información del Ocupante
                      </h4>

                      {/* Información para Persona Jurídica */}
                      {datosPersonaJuridica && (
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">Razón Social</p>
                            <p className="text-sm font-medium">
                              {datosPersonaJuridica.razonSocial}
                            </p>
                          </div>

                          {datosPersonaJuridica.rucPersonaJuridica &&
                            datosPersonaJuridica.rucPersonaJuridica.length >
                              0 && (
                              <div>
                                <p className="text-sm text-gray-500">RUC</p>
                                <p className="text-sm font-medium">
                                  {datosPersonaJuridica.rucPersonaJuridica
                                    .map((ruc) => ruc.ruc)
                                    .join(", ")}
                                </p>
                              </div>
                            )}

                          {/* Contactos del ocupante si tiene perfil cliente */}
                          {ocupante.perfilCliente && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h5 className="text-sm font-semibold text-gray-900 mb-3">
                                Información de Contacto
                              </h5>
                              <div className="space-y-3">
                                {ocupante.perfilCliente.contactoAccesos && (
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Contacto de Accesos
                                    </p>
                                    <div className="mt-1 space-y-1">
                                      <p className="text-sm">
                                        {
                                          ocupante.perfilCliente.contactoAccesos
                                            .nombreCompleto
                                        }
                                      </p>
                                      <p className="text-sm">
                                        {
                                          ocupante.perfilCliente.contactoAccesos
                                            .telefono
                                        }
                                      </p>
                                      <p className="text-sm">
                                        {
                                          ocupante.perfilCliente.contactoAccesos
                                            .email
                                        }
                                      </p>
                                    </div>
                                  </div>
                                )}
                                {ocupante.perfilCliente
                                  .contactoAdministrativo && (
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Contacto Administrativo
                                    </p>
                                    <div className="mt-1 space-y-1">
                                      <p className="text-sm">
                                        {
                                          ocupante.perfilCliente
                                            .contactoAdministrativo.telefono
                                        }
                                      </p>
                                      <p className="text-sm">
                                        {
                                          ocupante.perfilCliente
                                            .contactoAdministrativo.email
                                        }
                                      </p>
                                    </div>
                                  </div>
                                )}
                                {ocupante.perfilCliente.contactoGerente && (
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Contacto Gerente
                                    </p>
                                    <div className="mt-1 space-y-1">
                                      <p className="text-sm">
                                        {
                                          ocupante.perfilCliente.contactoGerente
                                            .telefono
                                        }
                                      </p>
                                      <p className="text-sm">
                                        {
                                          ocupante.perfilCliente.contactoGerente
                                            .email
                                        }
                                      </p>
                                    </div>
                                  </div>
                                )}
                                {ocupante.perfilCliente.contactoProveedores && (
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Contacto Proveedores
                                    </p>
                                    <div className="mt-1 space-y-1">
                                      <p className="text-sm">
                                        {
                                          ocupante.perfilCliente
                                            .contactoProveedores.telefono
                                        }
                                      </p>
                                      <p className="text-sm">
                                        {
                                          ocupante.perfilCliente
                                            .contactoProveedores.email
                                        }
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Información para Persona Natural */}
                      {datosPersonaNatural && (
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">
                              Nombre/Razón Social
                            </p>
                            <p className="text-sm font-medium">
                              {datosPersonaNatural.razonSocial}
                            </p>
                          </div>

                          {datosPersonaNatural.aplicaRuc && (
                            <div>
                              <p className="text-sm text-gray-500">RUC</p>
                              <p className="text-sm font-medium">
                                {datosPersonaNatural.ruc || "-"}
                              </p>
                            </div>
                          )}

                          {/* Contactos del ocupante si tiene perfil cliente */}
                          {ocupante.perfilCliente && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h5 className="text-sm font-semibold text-gray-900 mb-3">
                                Información de Contacto
                              </h5>
                              <div className="space-y-3">
                                {ocupante.perfilCliente.contactoAccesos && (
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Contacto de Accesos
                                    </p>
                                    <div className="mt-1 space-y-1">
                                      <p className="text-sm">
                                        {
                                          ocupante.perfilCliente.contactoAccesos
                                            .nombreCompleto
                                        }
                                      </p>
                                      <p className="text-sm">
                                        {
                                          ocupante.perfilCliente.contactoAccesos
                                            .telefono
                                        }
                                      </p>
                                      <p className="text-sm">
                                        {
                                          ocupante.perfilCliente.contactoAccesos
                                            .email
                                        }
                                      </p>
                                    </div>
                                  </div>
                                )}
                                {ocupante.perfilCliente
                                  .contactoAdministrativo && (
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Contacto Administrativo
                                    </p>
                                    <div className="mt-1 space-y-1">
                                      <p className="text-sm">
                                        {
                                          ocupante.perfilCliente
                                            .contactoAdministrativo.telefono
                                        }
                                      </p>
                                      <p className="text-sm">
                                        {
                                          ocupante.perfilCliente
                                            .contactoAdministrativo.email
                                        }
                                      </p>
                                    </div>
                                  </div>
                                )}
                                {ocupante.perfilCliente.contactoGerente && (
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Contacto Gerente
                                    </p>
                                    <div className="mt-1 space-y-1">
                                      <p className="text-sm">
                                        {
                                          ocupante.perfilCliente.contactoGerente
                                            .telefono
                                        }
                                      </p>
                                      <p className="text-sm">
                                        {
                                          ocupante.perfilCliente.contactoGerente
                                            .email
                                        }
                                      </p>
                                    </div>
                                  </div>
                                )}
                                {ocupante.perfilCliente.contactoProveedores && (
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Contacto Proveedores
                                    </p>
                                    <div className="mt-1 space-y-1">
                                      <p className="text-sm">
                                        {
                                          ocupante.perfilCliente
                                            .contactoProveedores.telefono
                                        }
                                      </p>
                                      <p className="text-sm">
                                        {
                                          ocupante.perfilCliente
                                            .contactoProveedores.email
                                        }
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Documentos del Ocupante */}
                    <div className="space-y-4">
                      {datosPersonaJuridica && (
                        <>
                          {/* RUC */}
                          {datosPersonaJuridica.rucPersonaJuridica.map(
                            (rucDoc, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-4 border rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <DocumentArrowDownIcon className="w-6 h-6 text-gray-500" />
                                  <div>
                                    <h4 className="text-base font-semibold text-gray-900">
                                      RUC
                                    </h4>
                                    {rucDoc.rucPdf ? (
                                      <p className="text-sm text-gray-500">
                                        {rucDoc.ruc}
                                        {rucDoc.rucPdf.fechaSubida &&
                                          ` - Subido el ${formatDate(
                                            rucDoc.rucPdf.fechaSubida
                                          )}`}
                                      </p>
                                    ) : (
                                      <p className="text-sm text-amber-600">
                                        Pendiente de subir
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  className="text-[#008A4B] hover:text-[#006837]"
                                  onClick={() =>
                                    window.open(rucDoc.rucPdf?.url, "_blank")
                                  }
                                  disabled={!rucDoc.rucPdf}
                                >
                                  Descargar
                                </Button>
                              </div>
                            )
                          )}

                          {/* Cédula del Representante Legal */}
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <DocumentArrowDownIcon className="w-6 h-6 text-gray-500" />
                              <div>
                                <h4 className="text-base font-semibold text-gray-900">
                                  Cédula del representante legal
                                </h4>
                                {datosPersonaJuridica.cedulaRepresentanteLegalPdf ? (
                                  <p className="text-sm text-gray-500">
                                    {
                                      datosPersonaJuridica
                                        .cedulaRepresentanteLegalPdf.nombre
                                    }
                                    {datosPersonaJuridica
                                      .cedulaRepresentanteLegalPdf.fechaSubida &&
                                      ` - Subido el ${formatDate(
                                        datosPersonaJuridica
                                          .cedulaRepresentanteLegalPdf.fechaSubida
                                      )}`}
                                  </p>
                                ) : (
                                  <p className="text-sm text-amber-600">
                                    Pendiente de subir
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              className="text-[#008A4B] hover:text-[#006837]"
                              onClick={() =>
                                window.open(
                                  datosPersonaJuridica.cedulaRepresentanteLegalPdf
                                    ?.url,
                                  "_blank"
                                )
                              }
                              disabled={
                                !datosPersonaJuridica.cedulaRepresentanteLegalPdf
                              }
                            >
                              Descargar
                            </Button>
                          </div>

                          {/* Nombramiento del Representante Legal */}
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <DocumentArrowDownIcon className="w-6 h-6 text-gray-500" />
                              <div>
                                <h4 className="text-base font-semibold text-gray-900">
                                  Nombramiento del representante legal
                                </h4>
                                {datosPersonaJuridica.nombramientoRepresentanteLegalPdf ? (
                                  <p className="text-sm text-gray-500">
                                    {
                                      datosPersonaJuridica
                                        .nombramientoRepresentanteLegalPdf.nombre
                                    }
                                    {datosPersonaJuridica
                                      .nombramientoRepresentanteLegalPdf
                                      .fechaSubida &&
                                      ` - Subido el ${formatDate(
                                        datosPersonaJuridica
                                          .nombramientoRepresentanteLegalPdf
                                          .fechaSubida
                                      )}`}
                                  </p>
                                ) : (
                                  <p className="text-sm text-amber-600">
                                    Pendiente de subir
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              className="text-[#008A4B] hover:text-[#006837]"
                              onClick={() =>
                                window.open(
                                  datosPersonaJuridica
                                    .nombramientoRepresentanteLegalPdf?.url,
                                  "_blank"
                                )
                              }
                              disabled={
                                !datosPersonaJuridica.nombramientoRepresentanteLegalPdf
                              }
                            >
                              Descargar
                            </Button>
                          </div>
                        </>
                      )}

                      {datosPersonaNatural && (
                        <>
                          {/* Cédula */}
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <DocumentArrowDownIcon className="w-6 h-6 text-gray-500" />
                              <div>
                                <h4 className="text-base font-semibold text-gray-900">
                                  Cédula de identidad
                                </h4>
                                {datosPersonaNatural.cedulaPdf ? (
                                  <p className="text-sm text-gray-500">
                                    {datosPersonaNatural.cedulaPdf.nombre}
                                    {datosPersonaNatural.cedulaPdf.fechaSubida &&
                                      ` - Subido el ${formatDate(
                                        datosPersonaNatural.cedulaPdf.fechaSubida
                                      )}`}
                                  </p>
                                ) : (
                                  <p className="text-sm text-amber-600">
                                    Pendiente de subir
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              className="text-[#008A4B] hover:text-[#006837]"
                              onClick={() =>
                                window.open(
                                  datosPersonaNatural.cedulaPdf?.url,
                                  "_blank"
                                )
                              }
                              disabled={!datosPersonaNatural.cedulaPdf}
                            >
                              Descargar
                            </Button>
                          </div>

                          {/* RUC (si aplica) */}
                          {datosPersonaNatural.aplicaRuc && (
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <DocumentArrowDownIcon className="w-6 h-6 text-gray-500" />
                                <div>
                                  <h4 className="text-base font-semibold text-gray-900">
                                    RUC
                                  </h4>
                                  {datosPersonaNatural.rucPdf ? (
                                    <p className="text-sm text-gray-500">
                                      {datosPersonaNatural.rucPdf.nombre}
                                      {datosPersonaNatural.rucPdf.fechaSubida &&
                                        ` - Subido el ${formatDate(
                                          datosPersonaNatural.rucPdf.fechaSubida
                                        )}`}
                                    </p>
                                  ) : (
                                    <p className="text-sm text-amber-600">
                                      Pendiente de subir
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                className="text-[#008A4B] hover:text-[#006837]"
                                onClick={() =>
                                  window.open(
                                    datosPersonaNatural.rucPdf?.url,
                                    "_blank"
                                  )
                                }
                                disabled={!datosPersonaNatural.rucPdf}
                              >
                                Descargar
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
   

      {/* Solicitudes Recientes */}
      {property.solicitudes && property.solicitudes.length > 0 && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-xl font-semibold mb-6">Solicitudes Recientes</h2>
          <div className="space-y-4">
            {property.solicitudes.map((solicitud, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">
                  {solicitud.detallesSolicitud.motivoSolicitud}
                </h3>
                <p className="text-sm text-gray-500">
                  {solicitud.detallesSolicitud.descripcion}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

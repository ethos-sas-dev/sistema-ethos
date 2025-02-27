"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { gql, useMutation, useQuery } from "@apollo/client";
import Image from "next/image";
import { use } from "react";

// Componentes UI
import { Button } from "@/_components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/_components/ui/card";
import { Input } from "@/_components/ui/input";
import { Switch } from "@/_components/ui/switch";
import { ArrowLeftIcon, ArrowRightIcon, DocumentArrowUpIcon } from "@heroicons/react/24/outline";
import { UploadButton } from "@/utils/uploadthing";

// Definición de tipos
interface PageProps {
  params: Promise<{ projectId: string; propertyId: string }>;
}

// Interfaces para los datos del propietario
interface Document {
  url: string;
  fechaSubida: string;
  nombre: string;
  documentId: string;
}

interface ContactInfo {
  email?: string;
  telefono?: string;
}

interface ContactInfoConNombre extends ContactInfo {
  nombreCompleto?: string;
  cedula?: string;
}

interface RucDocument {
  ruc: string;
  rucPdf: Document;
}

interface EmpresaRepresentanteLegal {
  autorizacionRepresentacionPdf: Document;
  cedulaRepresentanteLegalPdf: Document;
  rucEmpresaRepresentanteLegal: RucDocument[];
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
  documentId: string;
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

// Consulta GraphQL para obtener la propiedad con el propietario
const GET_PROPERTY = gql`
  query GetProperty($documentId: ID!) {
    propiedad(documentId: $documentId) {
      documentId
      propietario {
        documentId
        tipoPersona
        contactoAccesos {
          nombreCompleto
          email
          telefono
          cedula
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
        datosPersonaNatural {
          cedula
          cedulaPdf {
            documentId
            url
            fechaSubida
            nombre
          }
          aplicaRuc
          ruc
          rucPdf {
            documentId
            url
            fechaSubida
            nombre
          }
          razonSocial
        }
        datosPersonaJuridica {
          razonSocial
          nombreComercial
          razonSocialRepresentanteLegal
          cedulaRepresentanteLegal
          representanteLegalEsEmpresa
          cedulaRepresentanteLegalPdf {
            documentId
            url
            fechaSubida
            nombre
          }
          nombramientoRepresentanteLegalPdf {
            documentId
            url
            fechaSubida
            nombre
          }
          rucPersonaJuridica {
            ruc
            rucPdf {
              documentId
              url
              fechaSubida
              nombre
            }
          }
          empresaRepresentanteLegal {
            nombreComercial
            nombreRepresentanteLegalRL
            cedulaRepresentanteLegal
            direccionLegal
            observaciones
            autorizacionRepresentacionPdf {
              documentId
              url
              fechaSubida
              nombre
            }
            cedulaRepresentanteLegalPdf {
              documentId
              url
              fechaSubida
              nombre
            }
            rucEmpresaRepresentanteLegal {
              ruc
              rucPdf {
                documentId
                url
                fechaSubida
                nombre
              }
            }
          }
        }
      }
    }
  }
`;

// Mutación para actualizar el propietario
const UPDATE_PROPIETARIO = gql`
  mutation UpdatePropietario(
    $propertyId: ID!
    $propietarioId: ID!
    $tipoPersona: String!
    $datosPersonaNatural: PropietarioDatosPersonaNaturalInput
    $datosPersonaJuridica: PropietarioDatosPersonaJuridicaInput
    $contactoAccesos: PropietarioContactoConNombreInput!
    $contactoAdministrativo: PropietarioContactoInput
    $contactoGerente: PropietarioContactoInput
    $contactoProveedores: PropietarioContactoInput
  ) {
    updatePropietario(
      propertyId: $propertyId
      propietarioId: $propietarioId
      tipoPersona: $tipoPersona
      datosPersonaNatural: $datosPersonaNatural
      datosPersonaJuridica: $datosPersonaJuridica
      contactoAccesos: $contactoAccesos
      contactoAdministrativo: $contactoAdministrativo
      contactoGerente: $contactoGerente
      contactoProveedores: $contactoProveedores
    ) {
      documentId
      tipoPersona
    }
  }
`;

export default function EditarPropietarioPage({ params }: PageProps) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { projectId, propertyId } = unwrappedParams;

  // Estados para el formulario
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [tipoPersona, setTipoPersona] = useState<"Natural" | "Juridica">("Natural");

  // Estados para manejar las subidas de documentos
  const [cedulaUrl, setCedulaUrl] = useState<string | null>(null);
  const [cedulaNombre, setCedulaNombre] = useState<string | null>(null);
  const [rucUrl, setRucUrl] = useState<string | null>(null);
  const [rucNombre, setRucNombre] = useState<string | null>(null);
  const [aplicaRuc, setAplicaRuc] = useState(false);

  // Estados para documentos de persona jurídica
  const [cedulaRepresentanteUrl, setCedulaRepresentanteUrl] = useState<string | null>(null);
  const [cedulaRepresentanteNombre, setCedulaRepresentanteNombre] = useState<string | null>(null);
  const [nombramientoUrl, setNombramientoUrl] = useState<string | null>(null);
  const [nombramientoNombre, setNombramientoNombre] = useState<string | null>(null);
  const [rucJuridicoUrl, setRucJuridicoUrl] = useState<string | null>(null);
  const [rucJuridicoNombre, setRucJuridicoNombre] = useState<string | null>(null);
  const [representanteLegalEsEmpresa, setRepresentanteLegalEsEmpresa] = useState(false);

  // Estados para documentos de empresa representante legal
  const [autorizacionRepresentacionUrl, setAutorizacionRepresentacionUrl] = useState<string | null>(null);
  const [autorizacionRepresentacionNombre, setAutorizacionRepresentacionNombre] = useState<string | null>(null);
  const [cedulaRepresentanteEmpresaUrl, setCedulaRepresentanteEmpresaUrl] = useState<string | null>(null);
  const [cedulaRepresentanteEmpresaNombre, setCedulaRepresentanteEmpresaNombre] = useState<string | null>(null);
  const [rucEmpresaRepresentanteUrl, setRucEmpresaRepresentanteUrl] = useState<string | null>(null);
  const [rucEmpresaRepresentanteNombre, setRucEmpresaRepresentanteNombre] = useState<string | null>(null);

  // Estados para documentos subidos
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, { url: string; name: string }>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Obtener los datos de la propiedad y el propietario
  const { data, loading, error } = useQuery(GET_PROPERTY, {
    variables: { documentId: propertyId },
    fetchPolicy: "network-only",
  });

  // Configurar los formularios por paso
  const formPersonaNatural = useForm({
    defaultValues: {
      cedula: "",
      razonSocial: "",
      ruc: "",
    }
  });

  const formPersonaJuridica = useForm({
    defaultValues: {
      razonSocial: "",
      nombreComercial: "",
      razonSocialRepresentanteLegal: "",
      cedulaRepresentanteLegal: "",
    }
  });

  const formContacto = useForm({
    defaultValues: {
      contactoAccesos: {
        nombreCompleto: "",
        email: "",
        telefono: "",
        cedula: "",
      },
      contactoAdministrativo: {
        email: "",
        telefono: "",
      },
      contactoGerente: {
        email: "",
        telefono: "",
      },
      contactoProveedores: {
        email: "",
        telefono: "",
      },
    }
  });

  // Formulario para empresa representante legal
  const formEmpresaRepresentante = useForm({
    defaultValues: {
      nombreComercial: "",
      nombreRepresentanteLegalRL: "",
      cedulaRepresentanteLegal: "",
      direccionLegal: "",
      observaciones: "",
    }
  });

  // Mutación para actualizar el propietario
  const [updatePropietario, { loading: updateLoading }] = useMutation(UPDATE_PROPIETARIO, {
    onCompleted: () => {
      setStatusMessage({
        type: "success",
        message: "Propietario actualizado exitosamente"
      });
      setTimeout(() => {
        router.push(`/dashboard/proyectos/${projectId}/propiedades/${propertyId}`);
      }, 1500);
    },
    onError: (error) => {
      setStatusMessage({
        type: "error",
        message: `Error al actualizar: ${error.message}`
      });
      setIsLoading(false);
    }
  });

  useEffect(() => {
    if (data?.propiedad?.propietario) {
      const propietario = data.propiedad.propietario;
      console.log("Datos del propietario recibidos:", propietario);
      setTipoPersona(propietario.tipoPersona);
      
      if (propietario.tipoPersona === "Natural" && propietario.datosPersonaNatural) {
        console.log("Cargando datos de persona natural:", propietario.datosPersonaNatural);
        formPersonaNatural.reset({
          cedula: propietario.datosPersonaNatural.cedula || "",
          razonSocial: propietario.datosPersonaNatural.razonSocial || "",
          ruc: propietario.datosPersonaNatural.ruc || "",
        });
        
        setAplicaRuc(propietario.datosPersonaNatural.aplicaRuc || false);
        
        if (propietario.datosPersonaNatural.cedulaPdf) {
          setCedulaUrl(propietario.datosPersonaNatural.cedulaPdf.url);
          setCedulaNombre(propietario.datosPersonaNatural.cedulaPdf.nombre);
        }
        
        if (propietario.datosPersonaNatural.rucPdf) {
          setRucUrl(propietario.datosPersonaNatural.rucPdf.url);
          setRucNombre(propietario.datosPersonaNatural.rucPdf.nombre);
        }
      } else if (propietario.tipoPersona === "Juridica" && propietario.datosPersonaJuridica) {
        console.log("Cargando datos de persona jurídica:", propietario.datosPersonaJuridica);
        // Inicializar el formulario para persona jurídica
        formPersonaJuridica.reset({
          razonSocial: propietario.datosPersonaJuridica.razonSocial || "",
          nombreComercial: propietario.datosPersonaJuridica.nombreComercial || "",
          razonSocialRepresentanteLegal: propietario.datosPersonaJuridica.razonSocialRepresentanteLegal || "",
          cedulaRepresentanteLegal: propietario.datosPersonaJuridica.cedulaRepresentanteLegal || "",
        });
        
        // Establecer el estado de si el representante legal es empresa
        setRepresentanteLegalEsEmpresa(propietario.datosPersonaJuridica.representanteLegalEsEmpresa || false);
        
        // Manejar documentos de persona jurídica
        if (propietario.datosPersonaJuridica.cedulaRepresentanteLegalPdf) {
          setCedulaRepresentanteUrl(propietario.datosPersonaJuridica.cedulaRepresentanteLegalPdf.url);
          setCedulaRepresentanteNombre(propietario.datosPersonaJuridica.cedulaRepresentanteLegalPdf.nombre);
        }
        
        if (propietario.datosPersonaJuridica.nombramientoRepresentanteLegalPdf) {
          setNombramientoUrl(propietario.datosPersonaJuridica.nombramientoRepresentanteLegalPdf.url);
          setNombramientoNombre(propietario.datosPersonaJuridica.nombramientoRepresentanteLegalPdf.nombre);
        }
        
        if (propietario.datosPersonaJuridica.rucPersonaJuridica && 
            propietario.datosPersonaJuridica.rucPersonaJuridica.length > 0 && 
            propietario.datosPersonaJuridica.rucPersonaJuridica[0].rucPdf) {
          setRucJuridicoUrl(propietario.datosPersonaJuridica.rucPersonaJuridica[0].rucPdf.url);
          setRucJuridicoNombre(propietario.datosPersonaJuridica.rucPersonaJuridica[0].rucPdf.nombre);
        }

        // Cargar datos de empresa representante legal si existe
        if (representanteLegalEsEmpresa && propietario.datosPersonaJuridica.empresaRepresentanteLegal) {
          const empresaRL = propietario.datosPersonaJuridica.empresaRepresentanteLegal;
          
          formEmpresaRepresentante.reset({
            nombreComercial: empresaRL.nombreComercial || "",
            nombreRepresentanteLegalRL: empresaRL.nombreRepresentanteLegalRL || "",
            cedulaRepresentanteLegal: empresaRL.cedulaRepresentanteLegal || "",
            direccionLegal: empresaRL.direccionLegal || "",
            observaciones: empresaRL.observaciones || "",
          });
          
          if (empresaRL.autorizacionRepresentacionPdf) {
            setAutorizacionRepresentacionUrl(empresaRL.autorizacionRepresentacionPdf.url);
            setAutorizacionRepresentacionNombre(empresaRL.autorizacionRepresentacionPdf.nombre);
          }
          
          if (empresaRL.cedulaRepresentanteLegalPdf) {
            setCedulaRepresentanteEmpresaUrl(empresaRL.cedulaRepresentanteLegalPdf.url);
            setCedulaRepresentanteEmpresaNombre(empresaRL.cedulaRepresentanteLegalPdf.nombre);
          }
          
          if (empresaRL.rucEmpresaRepresentanteLegal && 
              empresaRL.rucEmpresaRepresentanteLegal.length > 0 && 
              empresaRL.rucEmpresaRepresentanteLegal[0].rucPdf) {
            setRucEmpresaRepresentanteUrl(empresaRL.rucEmpresaRepresentanteLegal[0].rucPdf.url);
            setRucEmpresaRepresentanteNombre(empresaRL.rucEmpresaRepresentanteLegal[0].rucPdf.nombre);
          }
        }
      }
      
      // Inicializar el formulario de contacto
      console.log("Cargando datos de contacto:", {
        contactoAccesos: propietario.contactoAccesos,
        contactoAdministrativo: propietario.contactoAdministrativo,
        contactoGerente: propietario.contactoGerente,
        contactoProveedores: propietario.contactoProveedores
      });
      
      if (propietario.contactoAccesos) {
        formContacto.setValue("contactoAccesos", {
          nombreCompleto: propietario.contactoAccesos.nombreCompleto || "",
          email: propietario.contactoAccesos.email || "",
          telefono: propietario.contactoAccesos.telefono || "",
          cedula: propietario.contactoAccesos.cedula || "",
        });
      }
      
      if (propietario.contactoAdministrativo) {
        formContacto.setValue("contactoAdministrativo", {
          email: propietario.contactoAdministrativo.email || "",
          telefono: propietario.contactoAdministrativo.telefono || "",
        });
      }
      
      if (propietario.contactoGerente) {
        formContacto.setValue("contactoGerente", {
          email: propietario.contactoGerente.email || "",
          telefono: propietario.contactoGerente.telefono || "",
        });
      }
      
      if (propietario.contactoProveedores) {
        formContacto.setValue("contactoProveedores", {
          email: propietario.contactoProveedores.email || "",
          telefono: propietario.contactoProveedores.telefono || "",
        });
      }
    }
  }, [data, formPersonaNatural, formPersonaJuridica, formEmpresaRepresentante, formContacto]);

  // Funciones de navegación entre pasos
  const goToNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // Función para manejar la subida de documentos
  const handleDocumentUpload = (field: string, url: string, name: string) => {
    setUploadedDocuments((prev) => ({
      ...prev,
      [field]: { url, name }
    }));
  };

  // Función para enviar el formulario
  const handleSubmit = async () => {
    setIsLoading(true);
    console.log("Iniciando el envío del formulario. Tipo de persona:", tipoPersona);

    try {
      // Preparar los datos según el tipo de persona
      let datosPersonaNatural = null;
      let datosPersonaJuridica = null;

      if (tipoPersona === "Natural") {
        const naturalData = formPersonaNatural.getValues();
        console.log("Datos de persona natural a enviar:", naturalData);
        datosPersonaNatural = {
          cedula: naturalData.cedula,
          razonSocial: naturalData.razonSocial,
          aplicaRuc: aplicaRuc,
          ruc: aplicaRuc ? naturalData.ruc : undefined,
          cedulaPdf: cedulaUrl 
            ? { 
                documentId: cedulaNombre, 
                url: cedulaUrl, 
                nombre: cedulaNombre, 
                fechaSubida: new Date().toISOString() 
              } 
            : undefined,
          rucPdf: aplicaRuc && rucUrl 
            ? { 
                documentId: rucNombre, 
                url: rucUrl, 
                nombre: rucNombre, 
                fechaSubida: new Date().toISOString() 
              } 
            : undefined,
        };
      } else if (tipoPersona === "Juridica") {
        const juridicaData = formPersonaJuridica.getValues();
        console.log("Datos de persona jurídica a enviar:", juridicaData);
        
        // Construir el objeto rucPersonaJuridica si tenemos datos de RUC
        const rucPersonaJuridica = rucJuridicoUrl 
          ? [{
              ruc: juridicaData.razonSocial, // Ajustar esto si hay un campo específico para el número de RUC
              rucPdf: {
                documentId: rucJuridicoNombre,
                url: rucJuridicoUrl,
                nombre: rucJuridicoNombre,
                fechaSubida: new Date().toISOString()
              }
            }]
          : undefined;
        
        // Agregar los datos de empresa representante legal si aplica
        let empresaRepresentanteLegal;
        if (representanteLegalEsEmpresa) {
          const empresaRL = formEmpresaRepresentante.getValues();
          console.log("Datos de empresa representante legal a enviar:", empresaRL);
          
          // Construir el objeto rucEmpresaRepresentanteLegal si tenemos datos de RUC
          const rucEmpresaRepresentanteLegal = rucEmpresaRepresentanteUrl 
            ? [{
                ruc: empresaRL.nombreComercial, // Ajustar esto si hay un campo específico para el número de RUC
                rucPdf: {
                  documentId: rucEmpresaRepresentanteNombre,
                  url: rucEmpresaRepresentanteUrl,
                  nombre: rucEmpresaRepresentanteNombre,
                  fechaSubida: new Date().toISOString()
                }
              }]
            : undefined;
          
          empresaRepresentanteLegal = {
            nombreComercial: empresaRL.nombreComercial || undefined,
            nombreRepresentanteLegalRL: empresaRL.nombreRepresentanteLegalRL || undefined,
            cedulaRepresentanteLegal: empresaRL.cedulaRepresentanteLegal || undefined,
            direccionLegal: empresaRL.direccionLegal || undefined,
            observaciones: empresaRL.observaciones || undefined,
            autorizacionRepresentacionPdf: autorizacionRepresentacionUrl
              ? {
                  documentId: autorizacionRepresentacionNombre,
                  url: autorizacionRepresentacionUrl,
                  nombre: autorizacionRepresentacionNombre,
                  fechaSubida: new Date().toISOString()
                }
              : undefined,
            cedulaRepresentanteLegalPdf: cedulaRepresentanteEmpresaUrl
              ? {
                  documentId: cedulaRepresentanteEmpresaNombre,
                  url: cedulaRepresentanteEmpresaUrl,
                  nombre: cedulaRepresentanteEmpresaNombre,
                  fechaSubida: new Date().toISOString()
                }
              : undefined,
            rucEmpresaRepresentanteLegal: rucEmpresaRepresentanteLegal,
          };
        }
        
        datosPersonaJuridica = {
          razonSocial: juridicaData.razonSocial,
          nombreComercial: juridicaData.nombreComercial || undefined,
          razonSocialRepresentanteLegal: juridicaData.razonSocialRepresentanteLegal,
          cedulaRepresentanteLegal: juridicaData.cedulaRepresentanteLegal,
          representanteLegalEsEmpresa: representanteLegalEsEmpresa,
          cedulaRepresentanteLegalPdf: cedulaRepresentanteUrl
            ? {
                documentId: cedulaRepresentanteNombre,
                url: cedulaRepresentanteUrl,
                nombre: cedulaRepresentanteNombre,
                fechaSubida: new Date().toISOString()
              }
            : undefined,
          nombramientoRepresentanteLegalPdf: nombramientoUrl
            ? {
                documentId: nombramientoNombre,
                url: nombramientoUrl,
                nombre: nombramientoNombre,
                fechaSubida: new Date().toISOString()
              }
            : undefined,
          rucPersonaJuridica: rucPersonaJuridica,
          empresaRepresentanteLegal: empresaRepresentanteLegal,
        };
      }

      // Preparar datos de contactos
      const contactData = formContacto.getValues();
      console.log("Datos de contacto a enviar:", contactData);
      
      // Convertir los datos de contacto al formato esperado por el backend
      const contactoAccesos = {
        nombreCompleto: contactData.contactoAccesos.nombreCompleto,
        email: contactData.contactoAccesos.email,
        telefono: contactData.contactoAccesos.telefono,
        cedula: contactData.contactoAccesos.cedula,
      };
      
      const contactoAdministrativo = contactData.contactoAdministrativo?.email ? {
        email: contactData.contactoAdministrativo.email,
        telefono: contactData.contactoAdministrativo.telefono,
      } : undefined;
      
      const contactoGerente = contactData.contactoGerente?.email ? {
        email: contactData.contactoGerente.email,
        telefono: contactData.contactoGerente.telefono,
      } : undefined;
      
      const contactoProveedores = contactData.contactoProveedores?.email ? {
        email: contactData.contactoProveedores.email,
        telefono: contactData.contactoProveedores.telefono,
      } : undefined;
      
      // Ejecutar la mutación con los datos
      console.log("Variables para la mutación:", {
        propertyId: propertyId,
        propietarioId: data?.propiedad?.propietario?.documentId || "",
        tipoPersona,
        datosPersonaNatural,
        datosPersonaJuridica,
        contactoAccesos: contactoAccesos,
        contactoAdministrativo,
        contactoGerente,
        contactoProveedores,
      });
      
      await updatePropietario({
        variables: {
          propertyId: propertyId,
          propietarioId: data?.propiedad?.propietario?.documentId || "",
          tipoPersona,
          datosPersonaNatural,
          datosPersonaJuridica,
          contactoAccesos,
          contactoAdministrativo,
          contactoGerente,
          contactoProveedores,
        }
      });
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      setStatusMessage({
        type: "error",
        message: `Error al actualizar: ${error instanceof Error ? error.message : "Error desconocido"}`
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Editar Propietario</h1>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
            <p className="text-center mt-4">Cargando información del propietario...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-red-500">Error al cargar los datos: {error.message}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Indicador de pasos */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                  1
                </div>
                <span className="mt-2 text-sm">Tipo de Persona</span>
              </div>
              <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"}`}></div>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                  2
                </div>
                <span className="mt-2 text-sm">Datos Personales</span>
              </div>
              <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? "bg-blue-600" : "bg-gray-200"}`}></div>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                  3
                </div>
                <span className="mt-2 text-sm">Información de Contacto</span>
              </div>
            </div>
          </div>

          {/* Contenido del formulario según el paso actual */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {currentStep === 1 && "Seleccionar Tipo de Persona"}
                {currentStep === 2 && "Información Personal"}
                {currentStep === 3 && "Datos de Contacto"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentStep === 1 && (
                <div className="space-y-6">
                  <p>Seleccione el tipo de persona del propietario:</p>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setTipoPersona("Natural")}
                      className={`flex-1 p-4 border-2 rounded-lg ${
                        tipoPersona === "Natural" ? "border-blue-600 bg-blue-50" : "border-gray-200"
                      }`}
                    >
                      <h3 className="font-semibold">Persona Natural</h3>
                      <p className="text-sm text-gray-500 mt-2">
                        Para individuos o personas físicas
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoPersona("Juridica")}
                      className={`flex-1 p-4 border-2 rounded-lg ${
                        tipoPersona === "Juridica" ? "border-blue-600 bg-blue-50" : "border-gray-200"
                      }`}
                    >
                      <h3 className="font-semibold">Persona Jurídica</h3>
                      <p className="text-sm text-gray-500 mt-2">
                        Para empresas o entidades legales
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 2 && tipoPersona === "Natural" && (
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Cédula</label>
                      <Input 
                        {...formPersonaNatural.register("cedula")}
                        placeholder="Ingrese el número de cédula" 
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nombres Completos</label>
                      <Input 
                        {...formPersonaNatural.register("razonSocial")}
                        placeholder="Ingrese nombres completos" 
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="border p-4 rounded-lg">
                    <h3 className="font-medium mb-4">Documento de Cédula</h3>
                    <div className="flex items-center gap-4">
                      {cedulaUrl ? (
                        <div className="border rounded-lg p-2 flex items-center gap-2 bg-gray-50 flex-1">
                          <DocumentArrowUpIcon className="w-5 h-5 text-blue-600" />
                          <span className="text-sm truncate">{cedulaNombre}</span>
                          <a 
                            href={cedulaUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-auto text-xs text-blue-600 hover:underline"
                          >
                            Ver
                          </a>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 mb-2">
                            Suba el documento de cédula en formato PDF
                          </p>
                          <UploadButton
                            endpoint="propertyDocument"
                            onClientUploadComplete={(res) => {
                              if (res && res.length > 0) {
                                setCedulaUrl(res[0].url);
                                setCedulaNombre(res[0].name);
                              }
                            }}
                            className="ut-button:bg-blue-600 ut-button:ut-readying:bg-blue-500 ut-button:ut-uploading:bg-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="aplica-ruc"
                      checked={aplicaRuc}
                      onCheckedChange={setAplicaRuc}
                    />
                    <label htmlFor="aplica-ruc" className="text-sm font-medium">
                      ¿La persona tiene RUC?
                    </label>
                  </div>

                  {aplicaRuc && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-1">Número de RUC</label>
                        <Input 
                          {...formPersonaNatural.register("ruc")}
                          placeholder="Ingrese el número de RUC" 
                          className="w-full"
                        />
                      </div>

                      <div className="border p-4 rounded-lg">
                        <h3 className="font-medium mb-4">Documento de RUC</h3>
                        <div className="flex items-center gap-4">
                          {rucUrl ? (
                            <div className="border rounded-lg p-2 flex items-center gap-2 bg-gray-50 flex-1">
                              <DocumentArrowUpIcon className="w-5 h-5 text-blue-600" />
                              <span className="text-sm truncate">{rucNombre}</span>
                              <a 
                                href={rucUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="ml-auto text-xs text-blue-600 hover:underline"
                              >
                                Ver
                              </a>
                            </div>
                          ) : (
                            <div className="flex-1">
                              <p className="text-sm text-gray-500 mb-2">
                                Suba el documento de RUC en formato PDF
                              </p>
                              <UploadButton
                                endpoint="propertyDocument"
                                onClientUploadComplete={(res) => {
                                  if (res && res.length > 0) {
                                    setRucUrl(res[0].url);
                                    setRucNombre(res[0].name);
                                  }
                                }}
                                className="ut-button:bg-blue-600 ut-button:ut-readying:bg-blue-500 ut-button:ut-uploading:bg-blue-500"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              )}

              {currentStep === 2 && tipoPersona === "Juridica" && (
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Razón Social</label>
                      <Input 
                        {...formPersonaJuridica.register("razonSocial")}
                        placeholder="Razón social de la empresa" 
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nombre Comercial</label>
                      <Input 
                        {...formPersonaJuridica.register("nombreComercial")}
                        placeholder="Nombre comercial (opcional)" 
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Razón Social del Representante Legal</label>
                      <Input 
                        {...formPersonaJuridica.register("razonSocialRepresentanteLegal")}
                        placeholder="Razón social del representante legal" 
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Cédula del Representante Legal</label>
                      <Input 
                        {...formPersonaJuridica.register("cedulaRepresentanteLegal")}
                        placeholder="Cédula del representante legal" 
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="border p-4 rounded-lg">
                    <h3 className="font-medium mb-4">Documento de Cédula del Representante Legal</h3>
                    <div className="flex items-center gap-4">
                      {cedulaRepresentanteUrl ? (
                        <div className="border rounded-lg p-2 flex items-center gap-2 bg-gray-50 flex-1">
                          <DocumentArrowUpIcon className="w-5 h-5 text-blue-600" />
                          <span className="text-sm truncate">{cedulaRepresentanteNombre}</span>
                          <a 
                            href={cedulaRepresentanteUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-auto text-xs text-blue-600 hover:underline"
                          >
                            Ver
                          </a>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 mb-2">
                            Suba el documento de cédula del representante legal en formato PDF
                          </p>
                          <UploadButton
                            endpoint="propertyDocument"
                            onClientUploadComplete={(res) => {
                              if (res && res.length > 0) {
                                setCedulaRepresentanteUrl(res[0].url);
                                setCedulaRepresentanteNombre(res[0].name);
                              }
                            }}
                            className="ut-button:bg-blue-600 ut-button:ut-readying:bg-blue-500 ut-button:ut-uploading:bg-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border p-4 rounded-lg">
                    <h3 className="font-medium mb-4">Nombramiento del Representante Legal</h3>
                    <div className="flex items-center gap-4">
                      {nombramientoUrl ? (
                        <div className="border rounded-lg p-2 flex items-center gap-2 bg-gray-50 flex-1">
                          <DocumentArrowUpIcon className="w-5 h-5 text-blue-600" />
                          <span className="text-sm truncate">{nombramientoNombre}</span>
                          <a 
                            href={nombramientoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-auto text-xs text-blue-600 hover:underline"
                          >
                            Ver
                          </a>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 mb-2">
                            Suba el nombramiento del representante legal en formato PDF
                          </p>
                          <UploadButton
                            endpoint="propertyDocument"
                            onClientUploadComplete={(res) => {
                              if (res && res.length > 0) {
                                setNombramientoUrl(res[0].url);
                                setNombramientoNombre(res[0].name);
                              }
                            }}
                            className="ut-button:bg-blue-600 ut-button:ut-readying:bg-blue-500 ut-button:ut-uploading:bg-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border p-4 rounded-lg">
                    <h3 className="font-medium mb-4">RUC de la Persona Jurídica</h3>
                    <div className="flex items-center gap-4">
                      {rucJuridicoUrl ? (
                        <div className="border rounded-lg p-2 flex items-center gap-2 bg-gray-50 flex-1">
                          <DocumentArrowUpIcon className="w-5 h-5 text-blue-600" />
                          <span className="text-sm truncate">{rucJuridicoNombre}</span>
                          <a 
                            href={rucJuridicoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-auto text-xs text-blue-600 hover:underline"
                          >
                            Ver
                          </a>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 mb-2">
                            Suba el RUC de la persona jurídica en formato PDF
                          </p>
                          <UploadButton
                            endpoint="propertyDocument"
                            onClientUploadComplete={(res) => {
                              if (res && res.length > 0) {
                                setRucJuridicoUrl(res[0].url);
                                setRucJuridicoNombre(res[0].name);
                              }
                            }}
                            className="ut-button:bg-blue-600 ut-button:ut-readying:bg-blue-500 ut-button:ut-uploading:bg-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      id="representante-es-empresa"
                      checked={representanteLegalEsEmpresa}
                      onCheckedChange={setRepresentanteLegalEsEmpresa}
                    />
                    <label htmlFor="representante-es-empresa" className="text-sm font-medium">
                      ¿El representante legal es una empresa?
                    </label>
                  </div>
                  
                  {/* Añadir los campos para empresa representante legal */}
                  {currentStep === 2 && tipoPersona === "Juridica" && representanteLegalEsEmpresa && (
                    <div className="mt-8 border-t pt-8">
                      <h3 className="text-lg font-medium mb-6">Datos de la Empresa Representante Legal</h3>
                      
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium mb-1">Nombre Comercial</label>
                            <Input 
                              {...formEmpresaRepresentante.register("nombreComercial")}
                              placeholder="Nombre comercial de la empresa representante" 
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Nombre del Representante Legal</label>
                            <Input 
                              {...formEmpresaRepresentante.register("nombreRepresentanteLegalRL")}
                              placeholder="Nombre del representante legal de la empresa" 
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Cédula del Representante Legal</label>
                            <Input 
                              {...formEmpresaRepresentante.register("cedulaRepresentanteLegal")}
                              placeholder="Cédula del representante legal de la empresa" 
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Dirección Legal</label>
                            <Input 
                              {...formEmpresaRepresentante.register("direccionLegal")}
                              placeholder="Dirección legal de la empresa" 
                              className="w-full"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Observaciones</label>
                          <Input 
                            {...formEmpresaRepresentante.register("observaciones")}
                            placeholder="Observaciones adicionales" 
                            className="w-full"
                          />
                        </div>
                        
                        <div className="border p-4 rounded-lg">
                          <h3 className="font-medium mb-4">Autorización de Representación</h3>
                          <div className="flex items-center gap-4">
                            {autorizacionRepresentacionUrl ? (
                              <div className="border rounded-lg p-2 flex items-center gap-2 bg-gray-50 flex-1">
                                <DocumentArrowUpIcon className="w-5 h-5 text-blue-600" />
                                <span className="text-sm truncate">{autorizacionRepresentacionNombre}</span>
                                <a 
                                  href={autorizacionRepresentacionUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ml-auto text-xs text-blue-600 hover:underline"
                                >
                                  Ver
                                </a>
                              </div>
                            ) : (
                              <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-2">
                                  Suba el documento de autorización de representación en formato PDF
                                </p>
                                <UploadButton
                                  endpoint="propertyDocument"
                                  onClientUploadComplete={(res) => {
                                    if (res && res.length > 0) {
                                      setAutorizacionRepresentacionUrl(res[0].url);
                                      setAutorizacionRepresentacionNombre(res[0].name);
                                    }
                                  }}
                                  className="ut-button:bg-blue-600 ut-button:ut-readying:bg-blue-500 ut-button:ut-uploading:bg-blue-500"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="border p-4 rounded-lg">
                          <h3 className="font-medium mb-4">Cédula del Representante Legal de la Empresa</h3>
                          <div className="flex items-center gap-4">
                            {cedulaRepresentanteEmpresaUrl ? (
                              <div className="border rounded-lg p-2 flex items-center gap-2 bg-gray-50 flex-1">
                                <DocumentArrowUpIcon className="w-5 h-5 text-blue-600" />
                                <span className="text-sm truncate">{cedulaRepresentanteEmpresaNombre}</span>
                                <a 
                                  href={cedulaRepresentanteEmpresaUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ml-auto text-xs text-blue-600 hover:underline"
                                >
                                  Ver
                                </a>
                              </div>
                            ) : (
                              <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-2">
                                  Suba el documento de cédula del representante legal de la empresa en formato PDF
                                </p>
                                <UploadButton
                                  endpoint="propertyDocument"
                                  onClientUploadComplete={(res) => {
                                    if (res && res.length > 0) {
                                      setCedulaRepresentanteEmpresaUrl(res[0].url);
                                      setCedulaRepresentanteEmpresaNombre(res[0].name);
                                    }
                                  }}
                                  className="ut-button:bg-blue-600 ut-button:ut-readying:bg-blue-500 ut-button:ut-uploading:bg-blue-500"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="border p-4 rounded-lg">
                          <h3 className="font-medium mb-4">RUC de la Empresa Representante</h3>
                          <div className="flex items-center gap-4">
                            {rucEmpresaRepresentanteUrl ? (
                              <div className="border rounded-lg p-2 flex items-center gap-2 bg-gray-50 flex-1">
                                <DocumentArrowUpIcon className="w-5 h-5 text-blue-600" />
                                <span className="text-sm truncate">{rucEmpresaRepresentanteNombre}</span>
                                <a 
                                  href={rucEmpresaRepresentanteUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ml-auto text-xs text-blue-600 hover:underline"
                                >
                                  Ver
                                </a>
                              </div>
                            ) : (
                              <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-2">
                                  Suba el documento de RUC de la empresa representante en formato PDF
                                </p>
                                <UploadButton
                                  endpoint="propertyDocument"
                                  onClientUploadComplete={(res) => {
                                    if (res && res.length > 0) {
                                      setRucEmpresaRepresentanteUrl(res[0].url);
                                      setRucEmpresaRepresentanteNombre(res[0].name);
                                    }
                                  }}
                                  className="ut-button:bg-blue-600 ut-button:ut-readying:bg-blue-500 ut-button:ut-uploading:bg-blue-500"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              )}

              {currentStep === 3 && (
                <form className="space-y-8">
                  <div className="border p-4 rounded-lg space-y-6">
                    <h3 className="font-medium">Contacto para Accesos</h3>
                    <p className="text-sm text-gray-500">
                      Esta persona recibirá las credenciales para acceder al sistema.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-1">Nombre Completo</label>
                        <Input 
                          {...formContacto.register("contactoAccesos.nombreCompleto")}
                          placeholder="Nombre completo"
                          className="w-full" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Cédula</label>
                        <Input 
                          {...formContacto.register("contactoAccesos.cedula")}
                          placeholder="Número de cédula"
                          className="w-full" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <Input 
                          {...formContacto.register("contactoAccesos.email")}
                          type="email"
                          placeholder="correo@ejemplo.com"
                          className="w-full" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Teléfono</label>
                        <Input 
                          {...formContacto.register("contactoAccesos.telefono")}
                          placeholder="09XXXXXXXX"
                          className="w-full" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border p-4 rounded-lg space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Contacto Administrativo</h3>
                      <div className="text-sm text-gray-500">Opcional</div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <Input 
                          {...formContacto.register("contactoAdministrativo.email")}
                          type="email"
                          placeholder="correo@ejemplo.com"
                          className="w-full" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Teléfono</label>
                        <Input 
                          {...formContacto.register("contactoAdministrativo.telefono")}
                          placeholder="09XXXXXXXX"
                          className="w-full" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border p-4 rounded-lg space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Contacto Gerente</h3>
                      <div className="text-sm text-gray-500">Opcional</div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <Input 
                          {...formContacto.register("contactoGerente.email")}
                          type="email"
                          placeholder="correo@ejemplo.com"
                          className="w-full" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Teléfono</label>
                        <Input 
                          {...formContacto.register("contactoGerente.telefono")}
                          placeholder="09XXXXXXXX"
                          className="w-full" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border p-4 rounded-lg space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Contacto para Proveedores</h3>
                      <div className="text-sm text-gray-500">Opcional</div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <Input 
                          {...formContacto.register("contactoProveedores.email")}
                          type="email"
                          placeholder="correo@ejemplo.com"
                          className="w-full" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Teléfono</label>
                        <Input 
                          {...formContacto.register("contactoProveedores.telefono")}
                          placeholder="09XXXXXXXX"
                          className="w-full" 
                        />
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {statusMessage && (
            <div className={`mb-4 p-4 rounded-lg ${
              statusMessage.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}>
              {statusMessage.message}
            </div>
          )}

          {/* Botones de navegación */}
          <div className="flex justify-between mt-6">
            {currentStep > 1 ? (
              <Button variant="outline" onClick={goToPreviousStep}>
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Anterior
              </Button>
            ) : (
              <div></div>
            )}
            
            {currentStep < 3 ? (
              <Button onClick={goToNextStep}>
                Siguiente
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                disabled={isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
} 
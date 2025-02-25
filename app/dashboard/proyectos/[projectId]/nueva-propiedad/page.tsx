"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Switch } from "@/_components/ui/switch";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { ArrowLeftIcon, DocumentArrowUpIcon } from "@heroicons/react/24/outline";
import { UploadButton } from "@/utils/uploadthing";
import { gql, useMutation, useQuery } from "@apollo/client";
import { StatusModal } from "@/_components/StatusModal";
import { useProject } from "@/dashboard/_hooks/useProject";

// Constantes
const IDENTIFICADORES_SUPERIOR = [
  { value: "Manzana", label: "Manzana" },
  { value: "Bloque", label: "Bloque" },
  { value: "Lote", label: "Lote" },
  { value: "Edificio", label: "Edificio" }
] as const;

const IDENTIFICADORES_INFERIOR = [
  { value: "Bodega", label: "Bodega" },
  { value: "Ofibodega", label: "Ofibodega" },
  { value: "Local", label: "Local" },
  { value: "Oficina", label: "Oficina" },
  { value: "Macrolote", label: "Macrolote" },
  { value: "Departamento", label: "Departamento" },
  { value: "Solar", label: "Solar" }
] as const;

const ESTADOS_CONSTRUCCION = [
  { value: "terreno", label: "Terreno" },
  { value: "enPlanos", label: "En Planos" },
  { value: "enConstruccion", label: "En Construcción" },
  { value: "obraGris", label: "Obra Gris" },
  { value: "acabados", label: "Acabados" },
  { value: "finalizada", label: "Finalizada" },
  { value: "remodelacion", label: "Remodelación" },
  { value: "demolicion", label: "Demolición" },
  { value: "abandonada", label: "Abandonada" },
  { value: "paralizada", label: "Paralizada" }
] as const;

const TIPOS_AREA = [
  { value: "util", label: "Útil" },
  { value: "parqueo", label: "Parqueo" },
  { value: "patio", label: "Patio" },
  { value: "plantaBaja", label: "Planta Baja" },
  { value: "pisoUno", label: "Piso Uno" },
  { value: "pisoDos", label: "Piso Dos" },
  { value: "maniobra", label: "Maniobra" },
  { value: "terreno", label: "Terreno" },
  { value: "mezzanine", label: "Mezzanine" },
  { value: "pasillo", label: "Pasillo" },
  { value: "adicional", label: "Adicional" }
] as const;

const ACTIVIDADES = [
  { value: "No_definida", label: "No definida" },
  { value: "Comercio_y_distribucion_de_productos", label: "Comercio y distribución de productos" },
  { value: "Venta_al_por_mayor_y_menor", label: "Venta al por mayor y menor" },
  { value: "Distribucion_de_equipos_electronicos", label: "Distribución de equipos electrónicos" },
  { value: "Almacenaje_y_distribucion_de_productos_alimenticios", label: "Almacenaje y distribución de productos alimenticios" },
  { value: "Distribucion_de_ropa_o_textiles", label: "Distribución de ropa o textiles" },
  { value: "Servicios_de_logistica", label: "Servicios de logística" },
  { value: "Almacenaje_y_gestion_de_inventarios", label: "Almacenaje y gestión de inventarios" },
  { value: "Servicios_de_transporte_y_distribucion", label: "Servicios de transporte y distribución" },
  { value: "Operaciones_de_comercio_electronico", label: "Operaciones de comercio electrónico (E-commerce) y envío de productos" },
  { value: "Manufactura_y_ensamblaje", label: "Manufactura y ensamblaje" },
  { value: "Ensamblaje_de_productos_electronicos", label: "Ensamblaje de productos electrónicos" },
  { value: "Fabricacion_de_productos_pequenos", label: "Fabricación de productos pequeños (como accesorios de moda o artículos de oficina)" },
  { value: "Imprentas_y_serigrafia", label: "Imprentas y serigrafía" },
  { value: "Carpinteria_o_fabricacion_de_muebles", label: "Carpintería o fabricación de muebles" },
  { value: "Servicios_de_tecnologia", label: "Servicios de tecnología" },
  { value: "Reparacion_y_mantenimiento_de_equipos_electronicos", label: "Reparación y mantenimiento de equipos electrónicos" },
  { value: "Desarrollo_de_software_o_aplicaciones", label: "Desarrollo de software o aplicaciones" },
  { value: "Soporte_tecnico_y_consultoria_informatica", label: "Soporte técnico y consultoría informática" },
  { value: "Diseno_grafico_y_multimedia", label: "Diseño gráfico y multimedia" },
  { value: "Oficina_administrativa", label: "Oficina administrativa" },
  { value: "Consultoria_en_diversas_areas", label: "Consultoría en diversas áreas (financiera, jurídica, recursos humanos, etc.)" },
  { value: "Agencias_de_marketing_digital", label: "Agencias de marketing digital" },
  { value: "Gestion_de_proyectos_o_eventos", label: "Gestión de proyectos o eventos" },
  { value: "Servicios_contables_y_auditoria", label: "Servicios contables y auditoría" },
  { value: "Alquiler_de_espacios", label: "Alquiler de espacios" },
  { value: "Alquiler_de_bodegas_para_almacenamiento", label: "Alquiler de bodegas para almacenamiento" },
  { value: "Alquiler_de_oficinas_compartidas_o_coworking", label: "Alquiler de oficinas compartidas o coworking" },
  { value: "Servicios_de_impresion", label: "Servicios de impresión" },
  { value: "Impresion_de_gran_formato", label: "Impresión de gran formato" },
  { value: "Servicios_de_fotocopiado_y_escaneo", label: "Servicios de fotocopiado y escaneo" },
  { value: "Impresion_y_produccion_de_material_publicitario", label: "Impresión y producción de material publicitario" },
  { value: "Comercio_de_repuestos_o_autopartes", label: "Comercio de repuestos o autopartes" },
  { value: "Venta_de_piezas_y_repuestos_de_vehiculos", label: "Venta de piezas y repuestos de vehículos" },
  { value: "Venta_de_equipos_y_herramientas_especializadas", label: "Venta de equipos y herramientas especializadas" },
  { value: "Agencias_de_seguridad", label: "Agencias de seguridad" },
  { value: "Venta_y_distribucion_de_sistemas_de_seguridad", label: "Venta y distribución de sistemas de seguridad (alarmas, cámaras)" },
  { value: "Instalacion_de_equipos_de_seguridad", label: "Instalación de equipos de seguridad" },
  { value: "Artes_y_entretenimiento", label: "Artes y entretenimiento" },
  { value: "Estudio_de_fotografia_o_grabacion_de_videos", label: "Estudio de fotografía o grabación de videos" },
  { value: "Taller_de_pintura_o_escultura", label: "Taller de pintura o escultura" },
  { value: "Produccion_de_eventos_o_espectaculos", label: "Producción de eventos o espectáculos" },
  { value: "Servicios_de_reparacion_y_mantenimiento", label: "Servicios de reparación y mantenimiento" },
  { value: "Reparacion_de_electrodomesticos", label: "Reparación de electrodomésticos" },
  { value: "Reparacion_de_computadoras_o_equipos_electronicos", label: "Reparación de computadoras o equipos electrónicos" },
  { value: "Mantenimiento_de_maquinaria_o_vehiculos", label: "Mantenimiento de maquinaria o vehículos" },
  { value: "Servicios_educativos", label: "Servicios educativos" },
  { value: "Centro_de_formacion_o_capacitacion", label: "Centro de formación o capacitación (presencial o en línea)" },
  { value: "Clases_de_computacion_o_diseno_grafico", label: "Clases de computación o diseño gráfico" },
  { value: "Talleres_y_cursos_especializados", label: "Talleres y cursos especializados" },
  { value: "Cuidado_personal", label: "Cuidado personal" },
  { value: "Centro_de_estetica_o_peluqueria", label: "Centro de estética o peluquería" },
  { value: "Gimnasio_o_centro_de_entrenamiento_fisico", label: "Gimnasio o centro de entrenamiento físico" },
  { value: "Restauracion_y_alimentos", label: "Restauración y alimentos" },
  { value: "Produccion_de_alimentos_empaquetados", label: "Producción de alimentos empaquetados" },
  { value: "Fabricacion_de_productos_de_panaderia_o_reposteria", label: "Fabricación de productos de panadería o repostería" }
] as const;

const CREATE_ARCHIVO = gql`
  mutation CreateArchivo($data: ArchivoInput!) {
    createArchivo(data: $data) {
      documentId
      nombre
      url
      fechaSubida
      tipoArchivo
    }
  }
`;

const CREATE_PROPIEDAD = gql`
  mutation CreatePropiedad($data: PropiedadInput!) {
    createPropiedad(data: $data) {
      documentId
      identificadores {
        idSuperior
        superior
        idInferior
        inferior
      }
      estadoEntrega
      estadoUso
      estadoDeConstruccion
      areaTotal
      areasDesglosadas {
        area
        tipoDeArea
        nombreAdicional
        tieneTasaAlicuotaOrdinariaEspecial
        tasaAlicuotaOrdinariaEspecial
      }
      montoFondoInicial
      montoAlicuotaOrdinaria
      modoIncognito
      actividad
      imagen {
        documentId
        nombre
        url
        fechaSubida
      }
      pagos {
        encargadoDePago
        fechaExpiracionEncargadoDePago
      }
    }
  }
`;

const GET_PROJECT_RATES = gql`
  query GetProjectRates($projectId: ID!) {
    proyecto(documentId: $projectId) {
      tasaBaseFondoInicial
      tasaBaseAlicuotaOrdinaria
    }
  }
`;

// Interfaces
interface PropertyFormData {
  // Paso 1: Información básica
  identificadores: {
    superior: typeof IDENTIFICADORES_SUPERIOR[number]["value"];
    idSuperior: string;
    inferior: typeof IDENTIFICADORES_INFERIOR[number]["value"];
    idInferior: string;
  };
  codigoCatastral: string;
  usarAreasDesglosadas: boolean;
  areaTotal: number;
  areasDesglosadas?: Array<{
    area: number;
    tipoDeArea: typeof TIPOS_AREA[number]["value"];
    nombreAdicional?: string;
    tieneTasaAlicuotaOrdinariaEspecial: boolean;
    tasaAlicuotaOrdinariaEspecial?: number;
  }>;
  documentoEscritura?: {
    documentId: string;
    nombre: string;
    url: string;
    fechaSubida: string;
  };

  // Paso 2: Estados
  estadoUso: "enUso" | "disponible";
  estadoEntrega: "entregado" | "noEntregado";
  estadoDeConstruccion: typeof ESTADOS_CONSTRUCCION[number]["value"];
  modoIncognito: boolean;
  actividad: typeof ACTIVIDADES[number]["value"];
  actaEntregaPdf?: {
    documentId: string;
    nombre: string;
    url: string;
    fechaSubida: string;
  };

  // Paso 3: Imagen
  imagen?: {
    documentId: string;
    nombre: string;
    url: string;
    fechaSubida: string;
  };
}

// Componentes
function AreasDesglosadas({ methods }: { methods: any }) {
  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "areasDesglosadas"
  });

  const calcularAreaTotal = () => {
    const areas = methods.getValues("areasDesglosadas") || [];
    const total = areas.reduce((sum: number, area: { area: number }) => sum + (Number(area.area) || 0), 0);
    methods.setValue("areaTotal", total);
  };

  const handleSwitchChange = (checked: boolean) => {
    methods.setValue("usarAreasDesglosadas", checked);
    
    if (checked && (!fields.length || fields.length === 0)) {
      const areaTotal = methods.getValues("areaTotal") || 0;
      append({
        area: areaTotal,
        tipoDeArea: "adicional",
        tieneTasaAlicuotaOrdinariaEspecial: false
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Switch
          checked={methods.watch("usarAreasDesglosadas")}
          onCheckedChange={handleSwitchChange}
        />
        <label>¿Deseas desglosar las áreas?</label>
      </div>

      {!methods.watch("usarAreasDesglosadas") ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área Total (m²)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...methods.register("areaTotal", {
                setValueAs: (v: string | number | undefined) => {
                  if (!v) return 0;
                  const parsed = parseFloat(v.toString());
                  return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
                }
              })}
              onBlur={(e) => {
                const value = e.target.value;
                if (value) {
                  const rounded = Math.round(parseFloat(value) * 100) / 100;
                  methods.setValue("areaTotal", rounded, { shouldValidate: true });
                }
              }}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => {
            const tipoDeArea = methods.watch(`areasDesglosadas.${index}.tipoDeArea`);
            const tieneTasaEspecial = methods.watch(`areasDesglosadas.${index}.tieneTasaAlicuotaOrdinariaEspecial`);

            return (
              <div key={field.id} className="space-y-4 p-4 border rounded-lg relative">
                <button
                  type="button"
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  onClick={() => {
                    remove(index);
                    calcularAreaTotal();
                    if (fields.length === 1) {
                      methods.setValue("usarAreasDesglosadas", false);
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Área
                    </label>
                    <select
                      className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A4B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...methods.register(`areasDesglosadas.${index}.tipoDeArea`)}
                    >
                      <option value="adicional">Adicional</option>
                      {TIPOS_AREA.filter(option => {
                        if (option.value === "adicional") {
                          return false;
                        }
                        if (option.value === methods.watch(`areasDesglosadas.${index}.tipoDeArea`)) {
                          return true;
                        }
                        const tiposSeleccionados = methods.getValues("areasDesglosadas")
                          ?.filter((_: any, i: number) => i !== index)
                          .map((area: any) => area.tipoDeArea)
                          .filter(Boolean) || [];
                        return !tiposSeleccionados.includes(option.value);
                      }).map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Área (m²)
                    </label>
                    <Input
                      placeholder="100"
                      type="number"
                      step="0.01"
                      min="0"
                      {...methods.register(`areasDesglosadas.${index}.area`, {
                        setValueAs: (v: string | number | undefined) => {
                          if (!v) return 0;
                          const parsed = parseFloat(v.toString());
                          return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
                        }
                      })}
                      onChange={(e) => {
                        methods.register(`areasDesglosadas.${index}.area`).onChange(e);
                        calcularAreaTotal();
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        if (value) {
                          const rounded = Math.round(parseFloat(value) * 100) / 100;
                          methods.setValue(
                            `areasDesglosadas.${index}.area`,
                            rounded,
                            { shouldValidate: true }
                          );
                          calcularAreaTotal();
                        }
                      }}
                    />
                  </div>
                </div>

                {tipoDeArea === "adicional" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del área adicional
                    </label>
                    <Input
                      {...methods.register(`areasDesglosadas.${index}.nombreAdicional`)}
                      placeholder="Ej: Área de carga, Piso X, etc."
                    />
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={methods.watch(`areasDesglosadas.${index}.tieneTasaAlicuotaOrdinariaEspecial`)}
                      onCheckedChange={(checked: boolean) => {
                        methods.setValue(`areasDesglosadas.${index}.tieneTasaAlicuotaOrdinariaEspecial`, checked);
                        if (checked) {
                          methods.setValue(`areasDesglosadas.${index}.tasaAlicuotaOrdinariaEspecial`, 0);
                        }
                      }}
                    />
                    <label className="text-sm">Tasa alícuota especial</label>
                  </div>

                  {methods.watch(`areasDesglosadas.${index}.tieneTasaAlicuotaOrdinariaEspecial`) && (
                    <div className="flex-1">
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className="pr-8"
                          placeholder="0.00"
                          {...methods.register(`areasDesglosadas.${index}.tasaAlicuotaOrdinariaEspecial`, {
                            setValueAs: (v: string | number | undefined) => {
                              if (!v) return 0;
                              const parsed = parseFloat(v.toString());
                              return isNaN(parsed) ? 0 : parseFloat(parsed.toFixed(2));
                            }
                          })}
                          onBlur={(e) => {
                            const value = e.target.value;
                            if (value) {
                              const rounded = parseFloat(parseFloat(value).toFixed(2));
                              methods.setValue(
                                `areasDesglosadas.${index}.tasaAlicuotaOrdinariaEspecial`,
                                rounded,
                                { shouldValidate: true }
                              );
                            }
                          }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          <Button
            type="button"
            variant="outline"
            onClick={() => append({
              area: 0,
              tipoDeArea: "adicional",
              tieneTasaAlicuotaOrdinariaEspecial: false
            })}
          >
            Añadir Área
          </Button>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">
              Área Total: {methods.watch("areaTotal") || 0} m²
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Añadir esta función de formateo después de las constantes
const formatCurrency = (number: number) => {
  return number.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Página principal
export default function NuevaPropiedadPage() {
  const [paso, setPaso] = useState(1);
  const router = useRouter();
  const { projectId } = useParams();
  const { mutate } = useProject(typeof projectId === 'string' ? projectId : null);
  
  // Obtener tasas del proyecto
  const { data: projectData } = useQuery(GET_PROJECT_RATES, {
    variables: { projectId },
    skip: !projectId
  });
  
  const methods = useForm<PropertyFormData>({
    defaultValues: {
      identificadores: {
        superior: "Manzana",
        idSuperior: "",
        inferior: "Local",
        idInferior: ""
      },
      codigoCatastral: "",
      modoIncognito: true,
      usarAreasDesglosadas: false,
      areaTotal: 0,
      areasDesglosadas: [],
      estadoUso: "enUso",
      estadoEntrega: "noEntregado",
      estadoDeConstruccion: "terreno",
      actividad: "No_definida",
      actaEntregaPdf: undefined,
      imagen: undefined
    }
  });

  const [crearArchivo] = useMutation(CREATE_ARCHIVO);
  const [crearPropiedad] = useMutation(CREATE_PROPIEDAD);

  // Calcular montos basados en áreas y tasas
  const calcularMontos = () => {
    const tasaBaseFondoInicial = Number(projectData?.proyecto?.tasaBaseFondoInicial) || 0;
    const tasaBaseAlicuotaOrdinaria = Number(projectData?.proyecto?.tasaBaseAlicuotaOrdinaria) || 0;
    const areaTotal = Number(methods.watch("areaTotal")) || 0;
    const usarDesglose = methods.watch("usarAreasDesglosadas");

    // El fondo inicial siempre se calcula igual: área total × tasa base fondo inicial
    const fondoInicial = parseFloat((areaTotal * tasaBaseFondoInicial).toFixed(2));

    // Para la alícuota ordinaria, depende si hay desglose o no
    let alicuotaOrdinaria = 0;

    if (!usarDesglose) {
      // Si no hay desglose, es simplemente área total × tasa base alícuota ordinaria
      alicuotaOrdinaria = parseFloat((areaTotal * tasaBaseAlicuotaOrdinaria).toFixed(2));
    } else {
      // Si hay desglose, calculamos la alícuota para cada área
      const areas = methods.watch("areasDesglosadas") || [];
      
      areas.forEach(area => {
        const areaValue = Number(area.area) || 0;
        
        if (area.tieneTasaAlicuotaOrdinariaEspecial && area.tasaAlicuotaOrdinariaEspecial) {
          const tasaEspecial = Number(area.tasaAlicuotaOrdinariaEspecial);
          alicuotaOrdinaria += parseFloat((areaValue * tasaEspecial).toFixed(2));
        } else {
          alicuotaOrdinaria += parseFloat((areaValue * tasaBaseAlicuotaOrdinaria).toFixed(2));
        }
      });
    }

    return { fondoInicial, alicuotaOrdinaria };
  };

  const onSubmit = async (data: PropertyFormData) => {
    if (paso === 1) {
      setPaso(2);
      return;
    }
    if (paso === 2) {
      setPaso(3);
      return;
    }

    try {
      const { fondoInicial, alicuotaOrdinaria } = calcularMontos();
      const dataToSubmit = {
        proyecto: projectId,
        identificadores: {
          superior: data.identificadores.superior,
          idSuperior: data.identificadores.idSuperior,
          inferior: data.identificadores.inferior,
          idInferior: data.identificadores.idInferior
        },
        codigoCatastral: data.codigoCatastral,
        areaTotal: data.areaTotal,
        areasDesglosadas: data.usarAreasDesglosadas && data.areasDesglosadas ? data.areasDesglosadas.map(area => ({
          area: area.area,
          tipoDeArea: area.tipoDeArea,
          nombreAdicional: area.nombreAdicional,
          tieneTasaAlicuotaOrdinariaEspecial: area.tieneTasaAlicuotaOrdinariaEspecial,
          tasaAlicuotaOrdinariaEspecial: area.tasaAlicuotaOrdinariaEspecial
        })) : [],
        escrituraPdf: data.documentoEscritura?.documentId,
        actaEntregaPdf: data.actaEntregaPdf?.documentId,
        estadoUso: data.estadoUso,
        estadoEntrega: data.estadoEntrega,
        estadoDeConstruccion: data.estadoDeConstruccion,
        modoIncognito: data.modoIncognito,
        actividad: data.actividad,
        imagen: data.imagen?.documentId,
        montoFondoInicial: fondoInicial,
        montoAlicuotaOrdinaria: alicuotaOrdinaria
      };
      
      const response = await crearPropiedad({
        variables: {
          data: dataToSubmit
        }
      });

      if (response.data?.createPropiedad) {
        const newPropertyId = response.data.createPropiedad.documentId;
        setNewPropertyId(newPropertyId);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const { fondoInicial, alicuotaOrdinaria } = calcularMontos();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [newPropertyId, setNewPropertyId] = useState<string>();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-3xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-500"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-semibold">Nueva Propiedad</h1>
        </div>
        <div className="text-sm text-gray-500">
          Paso {paso} de 3
        </div>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white rounded-xl border p-6">
            {paso === 1 ? (
              <div className="space-y-6">
                {/* Identificadores */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {methods.watch("identificadores.superior") === "Manzana" ? "Está en una:" : "Está en un:"}
                    </label>
                    <select
                      className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A4B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...methods.register("identificadores.superior")}
                    >
                      {IDENTIFICADORES_SUPERIOR.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre/Identificador {methods.watch("identificadores.superior").toLowerCase() === "manzana" ? "de la" : "del"} {methods.watch("identificadores.superior").toLowerCase()}
                      </label>
                      <Input
                        {...methods.register("identificadores.idSuperior")}
                        placeholder={`Ej: ${
                          methods.watch("identificadores.superior") === "Manzana" ? "A" :
                          methods.watch("identificadores.superior") === "Bloque" ? "1" :
                          methods.watch("identificadores.superior") === "Lote" ? "L-01" :
                          methods.watch("identificadores.superior") === "Edificio" ? "Torre 1" : ""
                        }`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    {methods.watch("identificadores.inferior") === "Bodega" || 
                     methods.watch("identificadores.inferior") === "Ofibodega" || 
                     methods.watch("identificadores.inferior") === "Oficina" ? 
                     "Es una:" : "Es un:"}
                    </label>
                    <select
                      className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A4B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...methods.register("identificadores.inferior")}
                    >
                      {IDENTIFICADORES_INFERIOR.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre/Identificador {methods.watch("identificadores.inferior") === "Bodega" || 
                        methods.watch("identificadores.inferior") === "Ofibodega" || 
                        methods.watch("identificadores.inferior") === "Oficina" ? 
                        "de la" : "del"} {methods.watch("identificadores.inferior").toLowerCase()}
                      </label>
                      <Input
                        {...methods.register("identificadores.idInferior")}
                        placeholder={`Ej: ${
                          methods.watch("identificadores.inferior") === "Bodega" ? "101" :
                          methods.watch("identificadores.inferior") === "Ofibodega" ? "OB-101" :
                          methods.watch("identificadores.inferior") === "Local" ? "L-101" :
                          methods.watch("identificadores.inferior") === "Oficina" ? "OF-101" :
                          methods.watch("identificadores.inferior") === "Macrolote" ? "ML-101" :
                          methods.watch("identificadores.inferior") === "Departamento" ? "DEP-101" :
                          methods.watch("identificadores.inferior") === "Solar" ? "S-101" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Código Catastral */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código Catastral
                    </label>
                    <Input
                      placeholder="Ej: 01-0001-001-0001-0-1-1" 
                      {...methods.register("codigoCatastral")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado de Construcción
                    </label>
                    <select
                      className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A4B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...methods.register("estadoDeConstruccion")}
                    >
                      {ESTADOS_CONSTRUCCION.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Áreas */}
                <div className="space-y-4">
                  <AreasDesglosadas methods={methods} />
                </div>

                {/* Escritura */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Escritura
                  </label>
                  <div className="flex items-center gap-2">
                    <UploadButton
                      endpoint="propertyDocument"
                      onClientUploadComplete={async (res) => {
                        if (res && res[0]) {
                          try {
                            const { data } = await crearArchivo({
                              variables: {
                                data: {
                                  nombre: res[0].name,
                                  url: res[0].ufsUrl,
                                  tipoArchivo: "pdf",
                                  fechaSubida: new Date().toISOString()
                                }
                              }
                            });

                            if (data?.createArchivo) {
                              methods.setValue("documentoEscritura", data.createArchivo);
                            }
                          } catch (error) {
                            console.error("Error al crear el archivo:", error);
                          }
                        }
                      }}
                      onUploadError={(error: Error) => {
                        console.error("Error uploading:", error);
                      }}
                      appearance={{
                        button: "border border-[#008A4B] !text-[#008A4B] hover:bg-[#008A4B] hover:!text-white text-sm font-medium px-4 py-2 rounded-md transition-all flex items-center gap-2",
                        allowedContent: "hidden"
                      }}
                      content={{
                        button({ ready }) {
                          if (ready) {
                            return (
                              <>
                                <DocumentArrowUpIcon className="w-4 h-4" />
                                <span>Subir archivo</span>
                              </>
                            );
                          }
                          return "Cargando...";
                        }
                      }}
                    />
                    {methods.watch("documentoEscritura") && (
                      <span className="text-sm text-green-600">
                        ✓ Archivo subido correctamente
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : paso === 2 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado de Entrega
                    </label>
                    <select
                      className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A4B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...methods.register("estadoEntrega")}
                    >
                      <option value="noEntregado">No Entregado</option>
                      <option value="entregado">Entregado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Actividad
                    </label>
                    <select
                      className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A4B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...methods.register("actividad")}
                    >
                      {ACTIVIDADES.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {methods.watch("estadoEntrega") === "entregado" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Acta de Entrega
                    </label>
                    <div className="flex items-center gap-2">
                      <UploadButton
                        endpoint="propertyDocument"
                        onClientUploadComplete={async (res) => {
                          if (res && res[0]) {
                            try {
                              const { data } = await crearArchivo({
                                variables: {
                                  data: {
                                    nombre: res[0].name,
                                    url: res[0].ufsUrl,
                                    tipoArchivo: "pdf",
                                    fechaSubida: new Date().toISOString()
                                  }
                                }
                              });

                              if (data?.createArchivo) {
                                methods.setValue("actaEntregaPdf", data.createArchivo);
                              }
                            } catch (error) {
                              console.error("Error al crear el archivo:", error);
                            }
                          }
                        }}
                        onUploadError={(error: Error) => {
                          console.error("Error uploading:", error);
                        }}
                        appearance={{
                          button: "border border-[#008A4B] !text-[#008A4B] hover:bg-[#008A4B] hover:!text-white text-sm font-medium px-4 py-2 rounded-md transition-all flex items-center gap-2",
                          allowedContent: "hidden"
                        }}
                        content={{
                          button({ ready }) {
                            if (ready) {
                              return (
                                <>
                                  <DocumentArrowUpIcon className="w-4 h-4" />
                                  <span>Subir archivo</span>
                                </>
                              );
                            }
                            return "Cargando...";
                          }
                        }}
                      />
                      {methods.watch("actaEntregaPdf") && (
                        <span className="text-sm text-green-600">
                          ✓ Archivo subido correctamente
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Mostrar montos calculados */}
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Montos Calculados</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700">
                        Monto Fondo Inicial
                      </label>
                      <p className="mt-1 text-2xl font-light">
                        ${formatCurrency(fondoInicial)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Basado en el área total y la tasa base del proyecto
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700">
                        Monto Alícuota Ordinaria
                      </label>
                      <p className="mt-1 text-2xl font-light">
                        ${formatCurrency(alicuotaOrdinaria)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {methods.watch("usarAreasDesglosadas") 
                          ? "Calculado por áreas desglosadas y sus tasas específicas"
                          : "Basado en el área total y la tasa base del proyecto"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Foto de la Propiedad
                  </label>
                  <div className="flex items-center gap-2">
                    <UploadButton
                      endpoint="propertyImage"
                      onClientUploadComplete={async (res) => {
                        if (res && res[0]) {
                          try {
                            const { data } = await crearArchivo({
                              variables: {
                                data: {
                                  nombre: res[0].name,
                                  url: res[0].ufsUrl,
                                  tipoArchivo: "imagen",
                                  fechaSubida: new Date().toISOString()
                                }
                              }
                            });

                            if (data?.createArchivo) {
                              methods.setValue("imagen", data.createArchivo);
                            }
                          } catch (error) {
                            console.error("Error al crear el archivo:", error);
                          }
                        }
                      }}
                      onUploadError={(error: Error) => {
                        console.error("Error uploading:", error);
                      }}
                      appearance={{
                        button: "border border-[#008A4B] !text-[#008A4B] hover:bg-[#008A4B] hover:!text-white text-sm font-medium px-4 py-2 rounded-md transition-all flex items-center gap-2",
                        allowedContent: "hidden"
                      }}
                      content={{
                        button({ ready }) {
                          if (ready) {
                            return (
                              <>
                                <DocumentArrowUpIcon className="w-4 h-4" />
                                <span>Subir imagen</span>
                              </>
                            );
                          }
                          return "Cargando...";
                        }
                      }}
                    />
                    {methods.watch("imagen") && (
                      <span className="text-sm text-green-600">
                        ✓ Imagen subida correctamente
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            {paso > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setPaso(p => p - 1)}
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Anterior
              </Button>
            )}
            
            <Button
              type="submit"
              className="ml-auto"
            >
              {paso < 3 ? "Siguiente" : "Crear Propiedad"}
            </Button>
          </div>
        </form>
      </FormProvider>

      {showSuccessModal && (
        <StatusModal
          type="success"
          title="¡Propiedad creada exitosamente!"
          message="La propiedad ha sido creada correctamente."
          onClose={() => setShowSuccessModal(false)}
          actionLabel="Ver Propiedad"
          onAction={() => {
            router.push(
              `/dashboard/proyectos/${projectId}/propiedades/${newPropertyId}`
            );
          }}
        />
      )}

      {showErrorModal && (
        <StatusModal
          type="error"
          title="Error al crear la propiedad"
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
          actionLabel="Intentar nuevamente"
          onAction={() => {
            setShowErrorModal(false);
            methods.handleSubmit(onSubmit);
          }}
        />
      )}
    </motion.div>
  );
} 
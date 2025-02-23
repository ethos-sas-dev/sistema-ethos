"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../../_components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { useForm, FormProvider } from "react-hook-form";
import { Input } from "@/_components/ui/input";
import { Select } from "@/_components/ui/select";

// Tipos para el formulario
interface PropertyFormData {
  // Paso 1: Información básica
  identificadores: {
    idSuperior: string;
    superior: string;
    idInferior: string;
    inferior: string;
  };
  codigoCatastral: string;
  areaTotal: number;
  areasDesglosadas: Array<{
    area: number;
    tipoDeArea: string;
    nombreAdicional?: string;
    tieneTasaAlicuotaOrdinariaEspecial: boolean;
    tasaAlicuotaOrdinariaEspecial?: number;
  }>;
  
  // Paso 2: Estados y valores
  estadoUso: "enUso" | "disponible";
  estadoEntrega: "entregado" | "noEntregado";
  estadoDeConstruccion: "enPlanos" | "enConstruccion" | "obraGris" | "acabados" | "finalizada" | "remodelacion" | "demolicion" | "abandonada" | "paralizada";
  montoFondoInicial: number;
  montoAlicuotaOrdinaria: number;
  actividad?: string;
  
  // Paso 3: Ocupantes
  tipoOcupante: "propietario" | "arrendatario" | null;
  ocupanteExistente?: string; // ID del ocupante existente
  crearNuevoOcupante?: boolean;
  
  // ... más campos según se necesite
}

const estadosConstruccion = [
  { value: "enPlanos", label: "En Planos" },
  { value: "enConstruccion", label: "En Construcción" },
  { value: "obraGris", label: "Obra Gris" },
  { value: "acabados", label: "Acabados" },
  { value: "finalizada", label: "Finalizada" },
  { value: "remodelacion", label: "Remodelación" },
  { value: "demolicion", label: "Demolición" },
  { value: "abandonada", label: "Abandonada" },
  { value: "paralizada", label: "Paralizada" }
];

const tiposArea = [
  { value: "areaUtil", label: "Área Útil" },
  { value: "areaComun", label: "Área Común" },
  { value: "areaVerde", label: "Área Verde" },
  { value: "areaParqueo", label: "Área de Parqueo" },
  { value: "areaBodega", label: "Área de Bodega" }
];

export default function NuevaPropiedadPage({ params }: { params: { projectId: string } }) {
  const [paso, setPaso] = useState(1);
  const [cargando, setCargando] = useState(false);
  const router = useRouter();
  const methods = useForm<PropertyFormData>();
  
  const totalPasos = 3;

  const renderPaso = () => {
    switch (paso) {
      case 1:
        return <PasoInformacionBasica />;
      case 2:
        return <PasoEstadosValores />;
      case 3:
        return <PasoOcupantes />;
      default:
        return null;
    }
  };

  const siguiente = async () => {
    const isValid = await methods.trigger();
    if (isValid) {
      if (paso < totalPasos) {
        setPaso(paso + 1);
      } else {
        // Enviar formulario
        handleSubmit();
      }
    }
  };

  const anterior = () => {
    if (paso > 1) {
      setPaso(paso - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    try {
      setCargando(true);
      const data = methods.getValues();
      // Aquí iría la lógica para enviar los datos
      console.log(data);
      router.push(`/dashboard/proyectos/${params.projectId}`);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={anterior}
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            {paso === 1 ? "Volver al proyecto" : "Anterior"}
          </Button>
          <h1 className="text-2xl font-semibold">Nueva Propiedad</h1>
          <div className="mt-4 flex gap-2">
            {Array.from({ length: totalPasos }).map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full flex-1 ${
                  i + 1 <= paso ? "bg-[#008A4B]" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Contenido del paso actual */}
        <AnimatePresence mode="wait">
          <motion.div
            key={paso}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl border p-6"
          >
            {renderPaso()}
          </motion.div>
        </AnimatePresence>

        {/* Botones de navegación */}
        <div className="mt-8 flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={anterior}
          >
            {paso === 1 ? "Cancelar" : "Anterior"}
          </Button>
          <Button
            onClick={siguiente}
            disabled={cargando}
            className="bg-[#008A4B] hover:bg-[#006837]"
          >
            {cargando ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : paso === totalPasos ? (
              "Crear Propiedad"
            ) : (
              <>
                Siguiente
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </FormProvider>
  );
}

// Componentes para cada paso
function PasoInformacionBasica() {
  const { register, formState: { errors } } = useForm();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Información Básica</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Identificador Superior
          </label>
          <Input
            {...register("identificadores.superior")}
            placeholder="Ej: Bloque"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número/Letra Superior
          </label>
          <Input
            {...register("identificadores.idSuperior")}
            placeholder="Ej: A"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Identificador Inferior
          </label>
          <Input
            {...register("identificadores.inferior")}
            placeholder="Ej: Local"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número/Letra Inferior
          </label>
          <Input
            {...register("identificadores.idInferior")}
            placeholder="Ej: 101"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Código Catastral
        </label>
        <Input
          {...register("codigoCatastral")}
          placeholder="Ingrese el código catastral"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Área Total (m²)
        </label>
        <Input
          type="number"
          {...register("areaTotal")}
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Áreas Desglosadas
        </label>
        {/* Aquí iría un componente para manejar áreas desglosadas dinámicamente */}
      </div>
    </div>
  );
}

function PasoEstadosValores() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Estados y Valores</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado de Uso
          </label>
          <Select>
            <option value="disponible">Disponible</option>
            <option value="enUso">En Uso</option>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado de Entrega
          </label>
          <Select>
            <option value="noEntregado">No Entregado</option>
            <option value="entregado">Entregado</option>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estado de Construcción
        </label>
        <Select>
          {estadosConstruccion.map(estado => (
            <option key={estado.value} value={estado.value}>
              {estado.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monto Fondo Inicial ($)
          </label>
          <Input
            type="number"
            placeholder="0.00"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monto Alícuota Ordinaria ($)
          </label>
          <Input
            type="number"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Actividad
        </label>
        <Input
          placeholder="Ej: Comercial, Industrial, etc."
        />
      </div>
    </div>
  );
}

function PasoOcupantes() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Ocupantes</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Ocupante
        </label>
        <Select>
          <option value="">Seleccione un tipo</option>
          <option value="propietario">Propietario</option>
          <option value="arrendatario">Arrendatario</option>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <input
            type="radio"
            name="tipoSeleccion"
            value="existente"
            className="text-[#008A4B]"
          />
          <label>Seleccionar ocupante existente</label>
        </div>
        
        <div className="flex items-center gap-4">
          <input
            type="radio"
            name="tipoSeleccion"
            value="nuevo"
            className="text-[#008A4B]"
          />
          <label>Crear nuevo ocupante</label>
        </div>
      </div>

      {/* Aquí irían los campos adicionales según la selección */}
    </div>
  );
} 
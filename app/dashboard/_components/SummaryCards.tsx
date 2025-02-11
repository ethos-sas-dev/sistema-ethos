'use client'

import { motion } from "framer-motion"
import { ArrowRightIcon } from "@heroicons/react/24/outline"
import { PieChart, Pie, ResponsiveContainer, Cell } from "recharts"
import type { UserRole } from '../../_lib/auth/AuthContext'
import Image from 'next/image'
import Link from 'next/link'

interface SummaryCardsProps {
  role: UserRole
}

// Datos de ejemplo - esto vendría de tu API
const mockData = {
  jefeOperativo: {
    charts: [
      {
        title: "Propiedades activas",
        subtitle: "95% de ocupación",
        value: "195 / 205",
        data: [
          { name: "Ocupadas", value: 195 },
          { name: "Disponibles", value: 10 }
        ]
      }
    ]
  },
  administrador: {
    charts: [
      {
        title: "Propiedades activas",
        subtitle: "95% de ocupación",
        value: "195 / 205",
        data: [
          { name: "Ocupadas", value: 195 },
          { name: "Disponibles", value: 10 }
        ]
      },
      {
        title: "Solicitudes pendientes",
        subtitle: "100% por resolver",
        value: "3 / 3",
        data: [
          { name: "Pendientes", value: 3 }
        ]
      }
    ]
  },
  directorio: {
    charts: [
      {
        title: "Propiedades activas",
        subtitle: "95% de ocupación",
        value: "195 / 205",
        data: [
          { name: "Ocupadas", value: 195 },
          { name: "Disponibles", value: 10 }
        ]
      },
      {
        title: "Solicitudes pendientes",
        subtitle: "100% por resolver",
        value: "3 / 3",
        data: [
          { name: "Pendientes", value: 3 }
        ]
      }
    ]
  },
  propietario: {
    properties: [
      {
        id: "B03",
        name: "Bodega 03",
        location: "Lote 1",
        area: "513 m²",
        status: "En venta",
        image: "/bodega.png"
      },
      {
        id: "B04",
        name: "Bodega 04",
        location: "Lote 2",
        area: "397 m²",
        status: "En renta",
        image: "/bodega.png"
      },
      {
        id: "B09",
        name: "Bodega 09",
        location: "Lote 7",
        area: "423 m²",
        status: "",
        image: "/bodega.png"
      }
    ]
  },
  arrendatario: {
    properties: [
      {
        id: "B07",
        name: "Bodega 07",
        location: "Lote 4",
        area: "405 m²",
        status: "Arrendada",
        image: "/bodega.png"
      }
    ]
  }
}

const statusColors = {
  'En venta': 'bg-emerald-100 text-emerald-800',
  'En renta': 'bg-blue-100 text-blue-800',
  'Arrendada': 'bg-gray-100 text-gray-800'
}

export function SummaryCards({ role }: SummaryCardsProps) {
  const data = mockData[role]

  // Para roles que ven gráficas (jefe operativo, administrador, directorio)
  if ('charts' in data) {
    return (
      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.charts.map((chart, index) => (
          <div 
            key={index}
            className="bg-white rounded-2xl border p-8 group hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex flex-col items-center">
              <h2 className="text-lg font-medium">{chart.title}</h2>
              <p className="text-gray-500 text-md mt-2">{chart.subtitle}</p>
              <div className="text-3xl font-light my-8">{chart.value}</div>
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chart.data}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={90}
                      startAngle={90}
                      endAngle={-270}
                    >
                      {chart.data.map((entry, index) => (
                        <Cell 
                          key={index} 
                          fill={index === 0 ? "#024728" : "#E5E7EB"} 
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <motion.button 
                className="mt-8 flex items-center gap-2 text-gray-600 hover:text-[#008A4B] text-base font-medium group-hover:text-[#008A4B] transition-colors"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                Ver detalles
                <ArrowRightIcon className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        ))}
      </motion.div>
    )
  }

  // Para propietarios y arrendatarios que ven sus propiedades
  return (
    <motion.div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Tus propiedades</h2>
        <Link 
          href={role === 'propietario' ? "/dashboard/mis-propiedades" : "/dashboard/mi-alquiler"}
          className="text-[#008A4B] hover:text-[#006837] text-sm font-medium"
        >
          Ver todas
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.properties.map((property) => (
          <motion.div
            key={property.id}
            className="bg-white rounded-xl overflow-hidden border group hover:shadow-lg transition-all duration-200"
            whileHover={{ y: -4 }}
          >
            <div className="relative h-48">
              <Image
                src={property.image}
                alt={property.name}
                fill
                className="object-cover"
              />
              {property.status && (
                <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${statusColors[property.status as keyof typeof statusColors]}`}>
                  {property.status}
                </span>
              )}
              <div className="absolute top-4 left-4 bg-white/90 px-2 py-1 rounded text-xs font-medium">
                {property.area}
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold">{property.name}</h3>
              <p className="text-gray-500 text-sm">{property.location}</p>
              <Link 
                href={`/dashboard/${role === 'propietario' ? 'mis-propiedades' : 'mi-alquiler'}/${property.id}`}
                className="mt-4 text-[#008A4B] hover:text-[#006837] text-sm font-medium flex items-center gap-2"
              >
                Ver detalles
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
} 
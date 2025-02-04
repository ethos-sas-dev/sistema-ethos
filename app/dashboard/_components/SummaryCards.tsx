'use client'

import { Card, CardContent, CardHeader, CardTitle } from "../../_components/ui/card"
import { Bar, BarChart, Line, LineChart, Pie, PieChart, ResponsiveContainer } from "recharts"

export function SummaryCards() {
  const cards = [
    {
      title: "Propiedades activas",
      value: "195 / 205",
      data: [
        { name: "Activas", value: 195 },
        { name: "Inactivas", value: 10 },
      ],
    },
    {
      title: "Solicitudes pendientes",
      value: "3 / 3",
      data: [
        { name: "Ene", value: 2 },
        { name: "Feb", value: 3 },
        { name: "Mar", value: 1 },
        { name: "Abr", value: 3 },
        { name: "May", value: 2 },
      ],
    },
    {
      title: "Solicitudes completadas",
      value: "15 / 18",
      data: [
        { name: "Completadas", value: 15 },
        { name: "Pendientes", value: 3 },
      ],
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">{card.value}</div>
            <div className="h-[200px]">
              {index === 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={card.data}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#024728"
                      label
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              {index === 1 && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={card.data}>
                    <Line type="monotone" dataKey="value" stroke="#024728" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
              {index === 2 && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={card.data}>
                    <Bar dataKey="value" fill="#024728" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <button className="mt-4 bg-[#008A4B] text-white py-2 px-4 rounded-lg text-sm w-full hover:bg-[#006837] transition-colors">
              Ver detalles
            </button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 
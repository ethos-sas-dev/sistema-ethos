import { SummaryCards } from "./_components/SummaryCards"
import { RecentRequests } from "./_components/RecentRequests"
import { Button } from "../_components/ui/button"

export default function DashboardPage() {
  return (
    <div className="ml-[294px] p-8">
      <h1 className="text-5xl font-bold mb-4 font-instrumentSans">¡Bienvenido!</h1>
      <p className="text-2xl mb-8 font-instrumentSans">Resumen de Ethos para Febrero 2025</p>
      <SummaryCards />
      <div className="mt-12 flex justify-between items-center">
        <h2 className="text-2xl font-medium font-instrumentSans">Solicitudes Recientes</h2>
        <Button variant="outline" className="border-[#008A4B] text-[#008A4B] hover:bg-[#008A4B] hover:text-white">
          Exportar a Excel
        </Button>
      </div>
      <div className="mt-6">
        <RecentRequests />
      </div>
    </div>
  )
} 
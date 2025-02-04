import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../_components/ui/table"
import { Button } from "../../_components/ui/button"

const requests = [
  { id: "001", property: "Propiedad A", type: "Mantenimiento", status: "Pendiente", date: "2025-02-15" },
  { id: "002", property: "Propiedad B", type: "Reparación", status: "En progreso", date: "2025-02-14" },
  { id: "003", property: "Propiedad C", type: "Inspección", status: "Completado", date: "2025-02-13" },
]

export function RecentRequests() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Propiedad</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Acción</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell>{request.id}</TableCell>
            <TableCell>{request.property}</TableCell>
            <TableCell>{request.type}</TableCell>
            <TableCell>{request.status}</TableCell>
            <TableCell>{request.date}</TableCell>
            <TableCell>
              <Button variant="outline" className="border-[#008A4B] text-[#008A4B] hover:bg-[#008A4B] hover:text-white">
                Ver detalles
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 
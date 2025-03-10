"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../_lib/auth/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../_components/ui/card";
import { Badge } from "../../_components/ui/badge";
import { Button } from "../../_components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../_components/ui/tabs";
import { Loader2, Mail, AlertTriangle, ListFilter, ArrowDown, ArrowUp, RefreshCw } from "lucide-react";
import { EmailModal } from "./_components/email-modal";
import { EmailList } from "./_components/email-list";
import { EmailStats } from "./_components/email-stats";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../_components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../_components/ui/dropdown-menu";
import { useEmails } from "../_hooks/useEmails";
import type { Email } from "../_hooks/useEmails";
// Importar las utilidades de limpieza de texto para emails
import { cleanEmailString } from "../../utils/email-formatters";

// Opciones de cantidad para mostrar
const displayOptions = [20, 50, 100];

// Extender la interfaz Email para incluir los campos adicionales que necesitamos
interface ExtendedEmail extends Email {
  to?: string;
  fullContent?: string;
}

export default function CorreosPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  
  // Usar el hook de emails con SWR
  const { 
    emails, 
    stats, 
    isLoading, 
    isRefreshing, 
    error, 
    refreshEmails, 
    updateEmail 
  } = useEmails({ 
    // Desactivar refresco automático para evitar el efecto "tieso"
    refreshInterval: undefined,
    revalidateOnFocus: false
  });

  const [selectedEmail, setSelectedEmail] = useState<ExtendedEmail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("necesitaAtencion");
  const [totalEmails, setTotalEmails] = useState(0);
  const [displayLimit, setDisplayLimit] = useState(20);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [viewThreads, setViewThreads] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const renderCountRef = useRef<{[key: string]: number}>({});

  // Verificar si el usuario tiene permisos para ver esta página
  useEffect(() => {
    // Si no hay usuario o no está autorizado, redirigir
    if (user) {
      const isAuthorized = 
        user.email === 'administraciona3@almax.ec' || 
        user.username === 'administraciona3';
      
      if (!isAuthorized) {
        // Redirigir al dashboard si no tiene permisos
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  // Si el usuario no tiene el correo correcto, mostrar mensaje
  if (user && user.email !== 'administraciona3@almax.ec' && user.username !== 'administraciona3') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] p-4 text-center">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Acceso restringido</h1>
        <p className="text-gray-600 max-w-md">
          Este módulo solo está disponible para el usuario administrador del correo administraciona3@almax.ec.
        </p>
        <Button 
          className="mt-6" 
          onClick={() => router.push('/dashboard')}
        >
          Volver al dashboard
        </Button>
      </div>
    );
  }

  // Función para manejar el cambio de ordenación
  const handleSortChange = (order: "asc" | "desc") => {
    // Convertir de asc/desc a newest/oldest
    setSortOrder(order === "desc" ? "newest" : "oldest");
  };

  // Obtener el valor de ordenación para EmailList
  const getListSortOrder = (): "asc" | "desc" => {
    return sortOrder === "newest" ? "desc" : "asc";
  };

  // Efecto para calcular el total de emails
  useEffect(() => {
    setTotalEmails(emails.length);
  }, [emails]);

  // Cambiar el límite de correos mostrados sin recargar
  const handleDisplayLimitChange = (value: string) => {
    setDisplayLimit(Number(value));
  };

  // Optimización: Usar React.useMemo para calcular los correos filtrados
  const filteredEmails = useMemo(() => {
    // Controlar logs duplicados
    renderCountRef.current['filteredEmails'] = (renderCountRef.current['filteredEmails'] || 0) + 1;
    if (renderCountRef.current['filteredEmails'] % 2 === 1) { // Solo mostrar en renderizados impares
      console.log("Recalculando emails filtrados con orden:", sortOrder);
    }
    
    // Primero filtramos por estado
    const filtered = emails.filter((email) => email.status === activeTab);
    
    // Aplicamos el orden directamente en el useMemo
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.receivedDate).getTime();
      const dateB = new Date(b.receivedDate).getTime();
      // Aplicar el criterio de ordenación según sortOrder
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    }).slice(0, displayLimit);
  }, [emails, activeTab, displayLimit, sortOrder]);

  // Optimización: Usar React.useMemo para los hilos de correo
  const emailsToDisplay = useMemo(() => {
    // Controlar logs duplicados
    renderCountRef.current['emailsToDisplay'] = (renderCountRef.current['emailsToDisplay'] || 0) + 1;
    if (renderCountRef.current['emailsToDisplay'] % 2 === 1) { // Solo mostrar en renderizados impares
      console.log("Recalculando hilos de correo");
    }
    
    if (!viewThreads) return filteredEmails;
    
    // Agrupar por asunto (simplificado)
    const threadMap = new Map();
    filteredEmails.forEach(email => {
      const normalizedSubject = email.subject.replace(/^(Re:|RE:|Fwd:|FWD:)\s*/g, '').trim();
      if (!threadMap.has(normalizedSubject)) {
        threadMap.set(normalizedSubject, []);
      }
      threadMap.get(normalizedSubject).push(email);
    });
    
    // Mostrar solo el email más reciente de cada hilo
    return Array.from(threadMap.values())
      .map(thread => thread.sort((a: Email, b: Email) => 
        new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime())[0]
      );
  }, [filteredEmails, viewThreads]);

  // Obtener el conteo de emails por categoría de manera optimizada
  const emailCount = useMemo(() => 
    emails.filter(email => email.status === activeTab).length,
  [emails, activeTab]);
  
  // Callback para actualizar la pestaña activa de manera optimizada
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);
  
  // Actualizar las funciones de manejo de correos para limpiar los datos
  
  const handleUpdateStatus = async (emailId: string, newStatus: "necesitaAtencion" | "informativo" | "respondido") => {
    try {
      await fetch(`/api/emails/update-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailId, status: newStatus }),
      });
      
      // Actualizar el estado localmente
      updateEmail(emailId, { status: newStatus });
      
    } catch (error) {
      console.error(`Error al actualizar estado a ${newStatus}:`, error);
    }
  };
  
  // Usar esta función para abrir un correo y asegurarse de que su contenido esté limpio
  const handleOpenEmail = (email: Email) => {
    // Convertir a ExtendedEmail y limpiar los campos
    const extendedEmail = email as ExtendedEmail;
    
    // Limpiar los campos del correo seleccionado
    const cleanedEmail: ExtendedEmail = {
      ...extendedEmail,
      from: cleanEmailString(extendedEmail.from),
      subject: cleanEmailString(extendedEmail.subject),
      preview: cleanEmailString(extendedEmail.preview),
      // Estos campos pueden no existir en todos los correos
      to: extendedEmail.to ? cleanEmailString(extendedEmail.to) : undefined,
      fullContent: extendedEmail.fullContent ? cleanEmailString(extendedEmail.fullContent) : extendedEmail.preview
    };
    
    setSelectedEmail(cleanedEmail);
    setModalOpen(true);
  };

  // Marcar correo como informativo
  const handleMarkAsInformative = async (emailId: string) => {
    try {
      await handleUpdateStatus(emailId, "informativo");
    } catch (error) {
      console.error("Error al marcar como informativo:", error);
    }
  };

  // Marcar correo como respondido
  const handleMarkAsResponded = async (emailId: string) => {
    try {
      await handleUpdateStatus(emailId, "respondido");
    } catch (error) {
      console.error("Error al marcar como respondido:", error);
    }
  };

  // Marcar como necesita atención
  const handleMarkAsNeedsAttention = async (emailId: string) => {
    try {
      await handleUpdateStatus(emailId, "necesitaAtencion");
    } catch (error) {
      console.error("Error al marcar como necesita atención:", error);
    }
  };

  // Alternar vista de hilos
  const toggleThreadView = () => {
    setViewThreads(prev => !prev);
  };

  // Manejar refresh de correos
  const handleRefresh = async () => {
    // Si ya está refrescando, no hacer nada
    if (isRefreshing) {
      console.log("Ya se está actualizando, ignorando solicitud");
      // Usar el notification provider del proyecto
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('showNotification', {
          detail: {
            type: 'info',
            title: 'Actualización en progreso',
            message: 'Espere un momento, ya se está actualizando la bandeja de correos'
          }
        });
        window.dispatchEvent(event);
      }
      return;
    }
    
    try {
      // Llamar directamente a la API con parámetros para forzar la actualización
      const response = await fetch('/api/emails/fetch?refresh=true&force=true&getAllEmails=true');
      
      if (!response.ok) {
        throw new Error(`Error al actualizar correos: ${response.status} ${response.statusText}`);
      }
      
      // Actualizar correos después de la sincronización forzada
      await refreshEmails();
      
      // Solo actualizamos la fecha después de refresh exitoso
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error al refrescar correos:", error);
      // Usar el notification provider del proyecto
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('showNotification', {
          detail: {
            type: 'error',
            title: 'Error al actualizar',
            message: 'No se pudieron sincronizar los correos. Intente nuevamente.'
          }
        });
        window.dispatchEvent(event);
      }
    }
  };

  // Establecer la fecha de última actualización al cargar los correos
  useEffect(() => {
    if (emails.length > 0 && !lastUpdated) {
      setLastUpdated(new Date());
    }
  }, [emails, lastUpdated]);

  // Formatear la fecha de última actualización
  const formattedLastUpdated = useMemo(() => {
    if (!lastUpdated) return '';
    
    // Formatear la fecha en español
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(lastUpdated);
  }, [lastUpdated]);

  return (
    <div className="container mx-auto py-6">
      {/* Elemento oculto para rastrear el estado de refreshing */}
      <div id="refreshing-indicator" data-refreshing={isRefreshing.toString()} style={{ display: 'none' }}></div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Correos</h1>
        <div className="flex flex-col items-end">
          <Button onClick={handleRefresh} disabled={isRefreshing} className="mb-1">
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar
              </>
            )}
          </Button>
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Último actualizado: {formattedLastUpdated}
            </span>
          )}
        </div>
      </div>

      <EmailStats stats={stats} />

      <Card className="mt-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Bandeja de Entrada</CardTitle>
              <CardDescription>
                Gestiona tus correos según su estado y prioridad
              </CardDescription>
            </div>
            <div className="flex flex-col items-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex gap-2">
                    <ListFilter className="h-4 w-4" />
                    Opciones
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Configuración de vista</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center justify-between cursor-pointer" onClick={toggleThreadView}>
                    Vista de conversaciones
                    <input type="checkbox" checked={viewThreads} onChange={() => {}} className="ml-2" />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Correos a mostrar</DropdownMenuLabel>
                  {displayOptions.map(option => (
                    <DropdownMenuItem 
                      key={option} 
                      className="cursor-pointer" 
                      onClick={() => handleDisplayLimitChange(option.toString())}
                    >
                      {option} correos
                      {displayLimit === option && <span className="ml-2">✓</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="text-xs text-gray-500 mt-1">
                {emailsToDisplay.length} - {emailCount} correos en esta categoría
              </span>
              {viewThreads && (
                <span className="text-xs text-gray-500 mt-1">
                  Vista de conversaciones activa - mostrando solo el último mensaje de cada hilo
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="necesitaAtencion" value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="necesitaAtencion">
                Necesita Atención
                <Badge className="ml-2 bg-red-500 text-white">{stats.necesitaAtencion}</Badge>
              </TabsTrigger>
              <TabsTrigger value="informativo">
                Informativo
                <Badge className="ml-2 bg-gray-200 text-gray-800">{stats.informativo}</Badge>
              </TabsTrigger>
              <TabsTrigger value="respondido">
                Respondido
                <Badge className="ml-2 border border-gray-300 bg-transparent">{stats.respondido}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="necesitaAtencion">
              {isLoading && !emails.length ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : emailsToDisplay.length > 0 ? (
                <EmailList 
                  emails={emailsToDisplay} 
                  onOpenEmail={handleOpenEmail} 
                  onMarkAsInformative={handleMarkAsInformative} 
                  onMarkAsResponded={handleMarkAsResponded}
                  onUpdateStatus={handleUpdateStatus}
                  emptyMessage="No hay correos que necesiten atención"
                  showInformativeButton={true}
                  sortOrder={getListSortOrder()}
                  onChangeSortOrder={handleSortChange}
                />
              ) : (
                <div className="flex justify-center py-8 text-gray-500">
                  No hay correos que necesiten atención
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="informativo">
              {isLoading && !emails.length ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : emailsToDisplay.length > 0 ? (
                <EmailList 
                  emails={emailsToDisplay} 
                  onOpenEmail={handleOpenEmail} 
                  onMarkAsInformative={handleMarkAsInformative}
                  onMarkAsResponded={handleMarkAsResponded}
                  onUpdateStatus={handleUpdateStatus}
                  emptyMessage="No hay correos informativos"
                  showInformativeButton={false}
                  sortOrder={getListSortOrder()}
                  onChangeSortOrder={handleSortChange}
                />
              ) : (
                <div className="flex justify-center py-8 text-gray-500">
                  No hay correos informativos
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="respondido">
              {isLoading && !emails.length ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : emailsToDisplay.length > 0 ? (
                <EmailList 
                  emails={emailsToDisplay} 
                  onOpenEmail={handleOpenEmail}
                  onMarkAsInformative={handleMarkAsInformative}
                  onMarkAsResponded={handleMarkAsResponded}
                  onUpdateStatus={handleUpdateStatus}
                  emptyMessage="No hay correos respondidos"
                  showInformativeButton={false}
                  sortOrder={getListSortOrder()}
                  onChangeSortOrder={handleSortChange}
                />
              ) : (
                <div className="flex justify-center py-8 text-gray-500">
                  No hay correos respondidos
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {selectedEmail && (
        <EmailModal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          email={selectedEmail}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
} 
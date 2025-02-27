"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { DocumentArrowDownIcon, DocumentArrowUpIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { UploadButton } from "../utils/uploadthing";
import type { OurFileRouter } from "../api/uploadthing/core";

interface DocumentUploadButtonProps {
  documentType: string;
  propertyId: string;
  onUploadComplete: (url: string, name: string) => Promise<void>;
  disabled?: boolean;
  currentDocument?: {
    url?: string;
    nombre?: string;
    fechaSubida?: string;
    id: string;
  };
  uploadId?: string; // Identificador único para cada botón de upload
  onDeleteDocument?: () => void;
}

export function DocumentUploadButton({
  documentType,
  propertyId,
  onUploadComplete,
  disabled,
  currentDocument,
  uploadId = Math.random().toString(36).substring(7), // Generar ID único si no se proporciona
  onDeleteDocument
}: DocumentUploadButtonProps) {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [showFeedback, setShowFeedback] = useState(false);

  const handleUploadComplete = async (res: { url: string; name: string }[]) => {
    try {
      setUploadStatus('uploading');
      setShowFeedback(true);
      
      await onUploadComplete(res[0].url, res[0].name);
      
      setUploadStatus('success');
      // No ocultamos el feedback hasta que se complete la actualización
    } catch (error) {
      console.error('Error en la subida:', error);
      setUploadStatus('error');
      setTimeout(() => {
        setShowFeedback(false);
        setUploadStatus('idle');
      }, 3000);
    }
  };

  // Cuando el documento cambia (se actualiza), ocultamos el feedback
  useEffect(() => {
    if (currentDocument?.url && uploadStatus === 'success') {
      setTimeout(() => {
        setShowFeedback(false);
        setUploadStatus('idle');
      }, 1000);
    }
  }, [currentDocument, uploadStatus]);

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <DocumentArrowDownIcon className="w-6 h-6 text-gray-500" />
        <div>
          <h4 className="text-base font-semibold text-gray-900">
            {documentType}
          </h4>
          {currentDocument?.url ? (
            <p className="text-sm text-gray-500">
              {currentDocument.nombre}
              {currentDocument.fechaSubida && 
                ` - Subido el ${new Date(currentDocument.fechaSubida).toLocaleDateString()}`
              }
            </p>
          ) : (
            <p className="text-sm text-amber-600">
              {uploadStatus === 'uploading' ? "Subiendo..." : 
               uploadStatus === 'success' ? "Procesando..." : 
               "Pendiente de subir"}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex gap-2">
        {currentDocument?.url ? (
          <>
            <Button
              variant="ghost"
              className="text-[#008A4B] hover:text-[#006837]"
              onClick={() => window.open(currentDocument.url, "_blank")}
            >
              <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
              Visualizar
            </Button>

            {/* Menú de opciones para el documento */}
            <div className="relative group">
              <Button
                variant="ghost"
                className="text-gray-500 hover:text-gray-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </Button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <div className="p-1">
                  <button 
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={() => {
                      // Reiniciar el estado para permitir una nueva subida
                      setUploadStatus('idle');
                      setShowFeedback(false);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Cambiar documento
                  </button>
                  
                  {onDeleteDocument && (
                    <button 
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md"
                      onClick={onDeleteDocument}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar documento
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="relative">
            <UploadButton
              endpoint="propertyDocument"
              onClientUploadComplete={handleUploadComplete}
              onUploadError={(error: Error) => {
                console.error('Error uploading:', error);
                setUploadStatus('error');
                setShowFeedback(true);
                setTimeout(() => {
                  setShowFeedback(false);
                  setUploadStatus('idle');
                }, 3000);
              }}
              appearance={{
                button: `border border-[#008A4B] !text-[#008A4B] hover:bg-[#008A4B] hover:!text-white text-sm font-medium px-4 py-2 rounded-md transition-all flex items-center gap-2 ${
                  uploadStatus !== 'idle' ? 'opacity-50 cursor-not-allowed' : ''
                }`,
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
                  return 'Cargando...';
                }
              }}
              disabled={uploadStatus !== 'idle'}
            />
            
            {showFeedback && (
              <div className={`
                absolute inset-0 flex items-center justify-center rounded-md
                ${uploadStatus === 'success' ? 'bg-green-50' : 
                  uploadStatus === 'error' ? 'bg-red-50' : 
                  'bg-gray-50'}
              `}>
                {uploadStatus === 'success' && (
                  <CheckCircleIcon className="w-6 h-6 text-green-600 animate-pulse" />
                )}
                {uploadStatus === 'error' && (
                  <XCircleIcon className="w-6 h-6 text-red-600" />
                )}
                {uploadStatus === 'uploading' && (
                  <div className="w-6 h-6 border-2 border-[#008A4B] border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
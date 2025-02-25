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
  };
  uploadId?: string; // Identificador único para cada botón de upload
}

export function DocumentUploadButton({
  documentType,
  propertyId,
  onUploadComplete,
  disabled,
  currentDocument,
  uploadId = Math.random().toString(36).substring(7) // Generar ID único si no se proporciona
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
          <Button
            variant="ghost"
            className="text-[#008A4B] hover:text-[#006837]"
            onClick={() => window.open(currentDocument.url, "_blank")}
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            Visualizar
          </Button>
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
"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { DocumentIcon } from "@heroicons/react/24/outline";
import { UploadButton } from "../utils/uploadthing";
import { gql, useMutation } from "@apollo/client";

const CREATE_ARCHIVO = gql`
  mutation CreateArchivo($data: ArchivoInput!) {
    createArchivo(data: $data) {
      documentId
      nombre
      url
      tipoArchivo
    }
  }
`;

interface SimpleDocumentUploadProps {
  onUploadComplete: (documentId: string, url: string, name: string) => void;
  currentDocument?: {
    url?: string;
    nombre?: string;
  };
  label?: string;
}

export function SimpleDocumentUpload({
  onUploadComplete,
  currentDocument,
  label = "documento"
}: SimpleDocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [createArchivo] = useMutation(CREATE_ARCHIVO);

  const handleUploadComplete = async (res: { url: string; name: string }[]) => {
    try {
      const { data: archivoData } = await createArchivo({
        variables: {
          data: {
            nombre: res[0].name,
            url: res[0].url,
            tipoArchivo: "pdf",
            fechaSubida: new Date().toISOString()
          }
        }
      });

      console.log('Archivo creado:', archivoData);

      onUploadComplete(
        archivoData.createArchivo.documentId,
        res[0].url,
        res[0].name
      );
    } catch (error) {
      console.error('Error al crear archivo:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (currentDocument?.url) {
    return (
      <Button
        type="button"
        variant="outline"
        className="flex items-center gap-2 text-[#008A4B]! text-sm"
        onClick={() => window.open(currentDocument.url, "_blank")}
      >
        <DocumentIcon className="w-5 h-5" />
        Ver {label}
      </Button>
    );
  }

  return (
    <UploadButton
      endpoint="propertyDocument"
      onUploadBegin={() => {
        setIsUploading(true);
      }}
      onClientUploadComplete={handleUploadComplete}
      onUploadError={(error: Error) => {
        console.error('Error uploading:', error);
        setIsUploading(false);
      }}
      appearance={{
        button: `border border-gray-300 text-gray-700 hover:bg-gray-50 !text-[#008A4B] text-sm font-medium px-4 py-2 rounded-md transition-all flex items-center gap-2 ${
          isUploading ? 'opacity-50 cursor-not-allowed' : ''
        }`,
        allowedContent: "hidden"
      }}
      content={{
        button({ ready }) {
          if (!ready) return 'Cargando...';
          if (isUploading) {
            return (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent" />
                <span>Subiendo...</span>
              </>
            );
          }
          return (
            <>
              <DocumentIcon className="w-5 h-5" />
              <span>Subir {label}</span>
            </>
          );
        }
      }}
    />
  );
}
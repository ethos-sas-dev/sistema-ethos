import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  propertyDocument: f({
    pdf: {
      maxFileSize: "32MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      // Aquí deberías implementar tu lógica de autenticación real
      // y verificar si el usuario es admin o directorio
      return { 
        documentType: req.headers.get("x-document-type"),
        propertyId: req.headers.get("x-property-id")
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Aquí podrías crear el registro en tu base de datos
      return { 
        url: file.url,
        documentType: metadata.documentType,
        propertyId: metadata.propertyId
      };
    }),
    
  propertyImage: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      return { 
        propertyId: req.headers.get("x-property-id")
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { 
        url: file.url,
        propertyId: metadata.propertyId
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter; 
import { NextResponse } from 'next/server';

// Helper function to clean GraphQL fields and internal fields
function cleanGraphQLFields(obj: any): any {
  if (!obj) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => cleanGraphQLFields(item));
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    const fieldsToExclude = ['__typename', 'documentId', 'id', 'createdAt', 'updatedAt', 'publishedAt'];
    
    for (const key in obj) {
      if (!fieldsToExclude.includes(key) && !key.startsWith('__')) {
        // Si es un campo que termina en 'Pdf', solo enviar el documentId
        if (key.endsWith('Pdf') && typeof obj[key] === 'object') {
          cleaned[key] = obj[key]?.documentId || null;
        } else {
          cleaned[key] = cleanGraphQLFields(obj[key]);
        }
      }
    }
    return cleaned;
  }
  
  return obj;
}

export async function PUT(request: Request) {
  try {
    const { documentId, field, archivoId, type, currentData, tipoOcupante } = await request.json();
    
    // Clean currentData from GraphQL fields and convert document relations
    const cleanedData = cleanGraphQLFields(currentData);

    console.log('Recibida petición para actualizar documento:', {
      documentId,
      field,
      archivoId,
      type,
      currentData
    });

    let endpoint = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api`;
    let body: Record<string, any> = {
      data: {}
    };

    if (type === 'propietario' || (type === 'ocupante' && tipoOcupante === 'arrendatario')) {
      endpoint += `/perfiles-cliente/${documentId}`;
      
      // Manejar arrays de RUC
      if (field.includes('datosPersonaJuridica.empresaRepresentanteLegal.rucEmpresaRepresentanteLegal') || 
          field.includes('datosPersonaJuridica.rucPersonaJuridica')) {
        
        // Determinar qué array de RUCs estamos actualizando
        const isEmpresaRuc = field.includes('empresaRepresentanteLegal');
        const currentRucs = isEmpresaRuc 
          ? cleanedData?.datosPersonaJuridica?.empresaRepresentanteLegal?.rucEmpresaRepresentanteLegal || []
          : cleanedData?.datosPersonaJuridica?.rucPersonaJuridica || [];
        
        // Obtener el índice del RUC que estamos actualizando
        const rucIndex = parseInt(field.split('[').pop()?.split(']')[0] || '0');
        
        // Actualizar solo el rucPdf del elemento específico
        const updatedRucs = [...currentRucs];
        updatedRucs[rucIndex] = {
          ...currentRucs[rucIndex],
          rucPdf: archivoId
        };
        
        body.data = {
          ...cleanedData,
          datosPersonaJuridica: {
            ...cleanedData.datosPersonaJuridica,
            ...(isEmpresaRuc ? {
              empresaRepresentanteLegal: {
                ...cleanedData.datosPersonaJuridica.empresaRepresentanteLegal,
                rucEmpresaRepresentanteLegal: updatedRucs
              }
            } : {
              rucPersonaJuridica: updatedRucs
            })
          }
        };
      } else {
        // Para campos no-array, también mantener datos existentes
        const fieldParts = field.split('.');
        let currentObj = { ...cleanedData };
        let bodyObj = body.data = { ...cleanedData }; // Mantener toda la estructura
        
        fieldParts.forEach((part: string, index: number) => {
          if (index === fieldParts.length - 1) {
            bodyObj[part] = archivoId;
          } else {
            if (!bodyObj[part]) bodyObj[part] = {};
            bodyObj[part] = { ...currentObj[part] };
            bodyObj = bodyObj[part];
            currentObj = currentObj[part] || {};
          }
        });
      }
    } else if (type === 'ocupante') {
      endpoint += `/ocupantes/${documentId}`;
      
      // Usar la misma lógica de RUCs para ocupantes externos
      if (field.includes('datosPersonaJuridica.empresaRepresentanteLegal.rucEmpresaRepresentanteLegal') || 
          field.includes('datosPersonaJuridica.rucPersonaJuridica')) {
        
        const isEmpresaRuc = field.includes('empresaRepresentanteLegal');
        const currentRucs = isEmpresaRuc 
          ? cleanedData?.datosPersonaJuridica?.empresaRepresentanteLegal?.rucEmpresaRepresentanteLegal || []
          : cleanedData?.datosPersonaJuridica?.rucPersonaJuridica || [];
        
        const rucIndex = parseInt(field.split('[').pop()?.split(']')[0] || '0');
        
        const updatedRucs = [...currentRucs];
        updatedRucs[rucIndex] = {
          ...currentRucs[rucIndex],
          rucPdf: archivoId
        };
        
        body.data = {
          ...cleanedData,
          datosPersonaJuridica: {
            ...cleanedData.datosPersonaJuridica,
            ...(isEmpresaRuc ? {
              empresaRepresentanteLegal: {
                ...cleanedData.datosPersonaJuridica.empresaRepresentanteLegal,
                rucEmpresaRepresentanteLegal: updatedRucs
              }
            } : {
              rucPersonaJuridica: updatedRucs
            })
          }
        };
      } else {
        // Para campos no-array en ocupantes externos
        body.data = {
          ...cleanedData,
          tipoOcupante
        };
      }
    } else if (type === 'property') {
      endpoint += `/propiedades/${documentId}`;
      body.data = {
        ...cleanedData,
        [field]: archivoId
      };
    }

    console.log('Enviando petición a:', endpoint);
    console.log('Body de la petición:', JSON.stringify(body, null, 2));

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en la respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        endpoint,
        requestBody: body
      });
      
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Respuesta exitosa:', data);
    
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Error completo al actualizar documento:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });

    // Si es un error de red
    if (error instanceof TypeError) {
      console.error('Error de red:', error);
      return NextResponse.json(
        { error: 'Error de conexión con el servidor' },
        { status: 503 }
      );
    }

    // Si es un error de parsing JSON
    if (error instanceof SyntaxError) {
      console.error('Error al procesar JSON:', error);
      return NextResponse.json(
        { error: 'Error al procesar la respuesta del servidor' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Error al actualizar el documento',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 
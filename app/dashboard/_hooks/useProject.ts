import useSWR from 'swr';
import { gql } from '@apollo/client';
import { client } from '../../_lib/apollo/apolloClient';
import type { Project } from '../../types';

const GET_PROJECT_DETAILS = gql`
  query GetProjectDetails($documentId: ID!) {
    proyecto(documentId: $documentId) {
      documentId
      nombre
      descripcion
      ubicacion
      tasaBaseFondoInicial
      tasaBaseAlicuotaOrdinaria
      perfilOperacional {
        usuario {
          username
        }
      }
      unidadNegocio {
        nombre
      }
      fotoProyecto {
        url
      }
      propiedades(pagination: { limit: -1 }) {
        imagen {
          documentId
          url
        }
        documentId
        identificadores {
          idSuperior
          superior
          idInferior
          inferior
        }
        estadoUso
        estadoEntrega
        estadoDeConstruccion
        actividad
        montoFondoInicial
        montoAlicuotaOrdinaria
        areaTotal
        areasDesglosadas {
          area
          tipoDeArea
        }
        modoIncognito
        ocupantes {
          tipoOcupante
        }
        propietario {
          tipoPersona
          datosPersonaNatural {
            razonSocial
            cedula
            ruc
          }
          datosPersonaJuridica {
            razonSocial
            nombreComercial
          }
          contactoAccesos {
            nombreCompleto
            email
            telefono
          }
        }
      }
      createdAt
      updatedAt
      publishedAt
    }
  }
`;

const projectFetcher = async (projectId: string): Promise<Project> => {
  try {
    const { data } = await client.query({
      query: GET_PROJECT_DETAILS,
      variables: { documentId: projectId },
    });

    if (!data || !data.proyecto) {
      throw new Error('No se encontraron datos del proyecto');
    }

    return {
      ...data.proyecto,
      perfilOperacional: data.proyecto?.perfilOperacional,
      unidadNegocio: data.proyecto?.unidadNegocio,
      fotoProyecto: data.proyecto?.fotoProyecto,
      propiedades: data.proyecto?.propiedades || []
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
};

// Tipado correcto para el provider de caché
type CacheMap = Map<string, any>;

const localStorageProvider = () => {
  if (typeof window === 'undefined') return new Map() as CacheMap;
  
  const map = new Map(
    JSON.parse(localStorage.getItem('app-cache') || '[]')
  ) as CacheMap;
  
  window.addEventListener('beforeunload', () => {
    const appCache = JSON.stringify(Array.from(map.entries()));
    localStorage.setItem('app-cache', appCache);
  });

  return map;
};

export function useProject(projectId: string | null) {
  const { data, error, mutate } = useSWR<Project>(
    projectId ? `project-${projectId}` : null,
    projectId ? () => projectFetcher(projectId) : null,
    {
      revalidateOnFocus: false,      // No revalidar al focus para evitar llamadas innecesarias
      revalidateOnReconnect: true,   // Sí revalidar al reconectar por si hubo cambios
      dedupingInterval: 5000,        // Deduplicar requests en 5 segundos
      loadingTimeout: 3000,
      onErrorRetry: (error: any, key, config, revalidate, { retryCount }) => {
        if (error.status === 404) return;
        if (retryCount >= 3) return;
        setTimeout(() => revalidate({ retryCount }), 5000);
      },
    }
  );

  return {
    project: data,
    isLoading: !error && !data,
    isError: error,
    mutate,  // Exponemos mutate para usarlo manualmente cuando sea necesario
  };
} 
import useSWR from 'swr';
import { gql } from '@apollo/client';
import { client } from '../../_lib/apollo/apolloClient';
import type { Property } from '../../types';

const GET_PROPERTY_DETAILS = gql`
  query GetPropertyDetails($documentId: ID!) {
    propiedad(documentId: $documentId) {
      documentId
      identificadores {
        idSuperior
        superior
        idInferior
        inferior
      }
      imagen {
        documentId
        url
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
      createdAt
      updatedAt
    }
  }
`;

const propertyFetcher = async (propertyId: string): Promise<Property> => {
  try {
    const { data } = await client.query({
      query: GET_PROPERTY_DETAILS,
      variables: { documentId: propertyId },
    });

    if (!data || !data.propiedad) {
      throw new Error('No se encontraron datos de la propiedad');
    }

    return data.propiedad;
  } catch (error) {
    console.error('Error fetching property:', error);
    throw error;
  }
};

export function useProperty(propertyId: string | null) {
  const { data, error, mutate } = useSWR<Property>(
    propertyId ? `property-${propertyId}` : null,
    propertyId ? () => propertyFetcher(propertyId) : null,
    {
      revalidateOnFocus: false,      // No revalidar al focus
      revalidateOnReconnect: true,   // Sí revalidar al reconectar
      dedupingInterval: 5000,        // Deduplicar requests
      loadingTimeout: 3000,
      onErrorRetry: (error: any, key, config, revalidate, { retryCount }) => {
        if (error.status === 404) return;
        if (retryCount >= 3) return;
        setTimeout(() => revalidate({ retryCount }), 5000);
      },
    }
  );

  return {
    property: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
} 
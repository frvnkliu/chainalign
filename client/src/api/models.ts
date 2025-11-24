import { Model, MediaType } from '../types/chain';

/**
 * Server response format for individual model
 */
interface ModelResponse {
  id: string;
  name: string;
  provider: string;
  input_type: string;
  output_type: string;
  description?: string;
  capabilities?: string[];
}

/**
 * Convert snake_case MediaType from server to our enum
 */
function parseMediaType(type: string): MediaType {
  if (!type) {
    throw new Error('Media type is undefined or null');
  }

  switch (type.toLowerCase()) {
    case 'text':
      return MediaType.Text;
    case 'audio':
      return MediaType.Audio;
    case 'video':
      return MediaType.Video;
    case 'image':
      return MediaType.Image;
    default:
      throw new Error(`Unknown media type: ${type}`);
  }
}

/**
 * Fetch all available models from the server.
 *
 * @returns Array of available models
 * @throws Error if fetch fails
 */
export async function fetchAvailableModels(): Promise<Model[]> {
  const response = await fetch('/models');

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.statusText}`);
  }

  const data: ModelResponse[] = await response.json();

  return data.map((model) => ({
    id: model.id,
    name: model.name,
    provider: model.provider,
    inputType: parseMediaType(model.input_type),
    outputType: parseMediaType(model.output_type),
  }));
}

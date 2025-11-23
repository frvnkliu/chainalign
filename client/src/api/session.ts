import { Model } from '../types/chain';

/**
 * Validation result for model chains
 */
interface ChainValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Request payload for starting a new session
 */
interface StartSessionRequest {
  model_chains: string[][];
}

/**
 * Response from starting a new session
 */
interface StartSessionResponse {
  session_id: string;
  num_chains: number;
  message: string;
}

/**
 * Validates that adjacent models in a chain have compatible types.
 * Output type of one model must match input type of the next model.
 */
function validateChainCompatibility(models: Model[]): ChainValidationResult {
  const errors: string[] = [];

  for (let i = 0; i < models.length - 1; i++) {
    const currentModel = models[i];
    const nextModel = models[i + 1];

    if (currentModel.outputType !== nextModel.inputType) {
      errors.push(
        `Incompatible types between ${currentModel.name} and ${nextModel.name}: ` +
        `${currentModel.name} outputs ${currentModel.outputType} but ${nextModel.name} expects ${nextModel.inputType}`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates that all chains have the same input and output types.
 * This ensures chains can be fairly compared in the arena.
 */
function validateChainConsistency(chains: Model[][]): ChainValidationResult {
  const errors: string[] = [];

  if (chains.length === 0) {
    return { isValid: true, errors: [] };
  }

  // Get reference input/output types from first chain
  const firstChain = chains[0];
  if (firstChain.length === 0) {
    errors.push('Chain 1 is empty');
    return { isValid: false, errors };
  }

  const expectedInputType = firstChain[0].inputType;
  const expectedOutputType = firstChain[firstChain.length - 1].outputType;

  // Validate each chain
  for (let i = 0; i < chains.length; i++) {
    const chain = chains[i];
    const chainNum = i + 1;

    if (chain.length === 0) {
      errors.push(`Chain ${chainNum} is empty`);
      continue;
    }

    const chainInputType = chain[0].inputType;
    const chainOutputType = chain[chain.length - 1].outputType;

    if (chainInputType !== expectedInputType) {
      errors.push(
        `Chain ${chainNum} has inconsistent input type: expected ${expectedInputType} but got ${chainInputType}`
      );
    }

    if (chainOutputType !== expectedOutputType) {
      errors.push(
        `Chain ${chainNum} has inconsistent output type: expected ${expectedOutputType} but got ${chainOutputType}`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates all model chains for the session.
 * Checks both internal chain compatibility and cross-chain consistency.
 */
export function validateModelChains(chains: Model[][]): ChainValidationResult {
  const errors: string[] = [];

  // Validate each chain's internal compatibility
  for (let i = 0; i < chains.length; i++) {
    const chain = chains[i];
    const chainNum = i + 1;
    const result = validateChainCompatibility(chain);

    if (!result.isValid) {
      errors.push(`Chain ${chainNum}: ${result.errors.join(', ')}`);
    }
  }

  // Validate consistency across all chains
  const consistencyResult = validateChainConsistency(chains);
  if (!consistencyResult.isValid) {
    errors.push(...consistencyResult.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Starts a new arena session with the provided model chains.
 *
 * SERVER-SIDE IMPLEMENTATION REQUIRED:
 * - Validate that all model IDs exist in the database
 * - Verify models support the declared input/output types
 * - Initialize ELO ratings for each chain (default: 1200)
 * - Create session record in database with timestamp
 * - Set up matchup tracking data structures
 * - Generate unique session_id (UUID4)
 *
 * @param modelChains - Array of model chains to compete in the arena
 * @returns Session information including session_id
 * @throws Error if validation fails or server request fails
 */
export async function startSession(modelChains: Model[][]): Promise<StartSessionResponse> {
  // Validate chains before sending to server
  const validation = validateModelChains(modelChains);
  if (!validation.isValid) {
    throw new Error(`Invalid model chains:\n${validation.errors.join('\n')}`);
  }

  // Convert model chains to format expected by server (just model names)
  const request: StartSessionRequest = {
    model_chains: modelChains.map(chain => chain.map(model => model.name)),
  };

  // Make request to server
  const response = await fetch('/session/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(`Failed to start session: ${errorData.detail || response.statusText}`);
  }

  return await response.json();
}

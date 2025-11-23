import { useState, useEffect } from 'react';
import MultiChainSelector from '../components/MultiChainSelector';
import { fetchAvailableModels } from '../api/models';
import { Model } from '../types/chain';

export default function Setup() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadModels() {
      try {
        const availableModels = await fetchAvailableModels();
        setModels(availableModels);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load models');
      } finally {
        setLoading(false);
      }
    }

    loadModels();
  }, []);

  return (
    <div style={{
      flex: '1',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        paddingTop: '1rem',
        marginBottom: '1rem',
        textTransform: 'uppercase',
        borderBottom: '3px solid black',
        paddingBottom: '1rem',
        display: 'block'
      }}>
        Setup
      </h1>

      {loading && <div>Loading models...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      {!loading && !error && <MultiChainSelector availableModels={models} />}
    </div>
  );
}

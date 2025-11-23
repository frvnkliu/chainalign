import MultiChainSelector from '../components/MultiChainSelector';

const AVAILABLE_MODELS = [
  { id: 'gpt4', name: 'GPT-4' },
  { id: 'gpt3', name: 'GPT-3.5' },
  { id: 'claude', name: 'Claude' },
  { id: 'llama', name: 'Llama' },
  { id: 'palm', name: 'PaLM' },
  { id: 'gemini', name: 'Gemini' },
  { id: 'mistral', name: 'Mistral' },
];

export default function Setup() {
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
        display: 'block'  // Prevent header from shrinking
      }}>
        Setup
      </h1>

      <MultiChainSelector availableModels={AVAILABLE_MODELS} />
    </div>
  );
}

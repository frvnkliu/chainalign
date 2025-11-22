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
    <div>
      <h1 style={{
        fontSize: '3rem',
        fontWeight: 'bold',
        marginBottom: '2rem',
        textTransform: 'uppercase',
        borderBottom: '3px solid black',
        paddingBottom: '1rem',
      }}>
        Setup
      </h1>

      <MultiChainSelector availableModels={AVAILABLE_MODELS} />
    </div>
  );
}

import MultiChainSelector from '../components/MultiChainSelector';
import { MediaType } from '../types/chain';

const AVAILABLE_MODELS = [
  { id: 'gpt4', name: 'GPT-4', inputType: MediaType.Text, outputType: MediaType.Text },
  { id: 'gpt3', name: 'GPT-3.5', inputType: MediaType.Text, outputType: MediaType.Text },
  { id: 'claude', name: 'Claude', inputType: MediaType.Text, outputType: MediaType.Text },
  { id: 'llama', name: 'Llama', inputType: MediaType.Text, outputType: MediaType.Text },
  { id: 'palm', name: 'PaLM', inputType: MediaType.Text, outputType: MediaType.Text },
  { id: 'gemini', name: 'Gemini', inputType: MediaType.Text, outputType: MediaType.Text },
  { id: 'mistral', name: 'Mistral', inputType: MediaType.Text, outputType: MediaType.Text },
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

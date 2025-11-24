import { useState } from 'react';

interface Message {
  id: string;
  userInput: string;
  outputA: string;
  outputB: string;
  matchupId: string;
  vote?: 'A' | 'B' | 'tie' | 'both_bad';
}

export default function Compare() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/session/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_input: input,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process input');
      }

      const data = await response.json();

      const newMessage: Message = {
        id: Date.now().toString(),
        userInput: input,
        outputA: data.output_a,
        outputB: data.output_b,
        matchupId: data.matchup_id,
      };

      setMessages([...messages, newMessage]);
      setInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (messageId: string, matchupId: string, vote: 'A' | 'B' | 'tie' | 'both_bad') => {
    if (!sessionId) return;

    try {
      const response = await fetch('/session/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          matchup_id: matchupId,
          vote,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record vote');
      }

      setMessages(messages.map(msg =>
        msg.id === messageId ? { ...msg, vote } : msg
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote');
    }
  };

  const initializeSession = async () => {
    try {
      const response = await fetch('/session/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_chains: [['model_a'], ['model_b']],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start session');
      }

      const data = await response.json();
      setSessionId(data.session_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize');
    }
  };

  if (!sessionId) {
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
          Compare Models
        </h1>
        <button
          onClick={initializeSession}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            backgroundColor: 'black',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Start Session
        </button>
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{
        fontSize: '3rem',
        fontWeight: 'bold',
        marginBottom: '2rem',
        textTransform: 'uppercase',
        borderBottom: '3px solid black',
        paddingBottom: '1rem',
      }}>
        Compare Models
      </h1>

      <div style={{ marginBottom: '2rem' }}>
        {messages.map((message) => (
          <div key={message.id} style={{ marginBottom: '3rem' }}>
            <div style={{
              padding: '1rem',
              backgroundColor: '#f5f5f5',
              borderLeft: '4px solid black',
              marginBottom: '1rem',
            }}>
              <strong>You:</strong> {message.userInput}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div style={{
                padding: '1rem',
                border: '2px solid black',
                backgroundColor: message.vote === 'A' ? '#e0ffe0' : 'white',
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Model A</div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{message.outputA}</div>
              </div>

              <div style={{
                padding: '1rem',
                border: '2px solid black',
                backgroundColor: message.vote === 'B' ? '#e0ffe0' : 'white',
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Model B</div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{message.outputB}</div>
              </div>
            </div>

            {!message.vote && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center' }}>
                <button
                  onClick={() => handleVote(message.id, message.matchupId, 'A')}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'black',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  A is Better
                </button>
                <button
                  onClick={() => handleVote(message.id, message.matchupId, 'B')}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'black',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  B is Better
                </button>
                <button
                  onClick={() => handleVote(message.id, message.matchupId, 'tie')}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#666',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Tie
                </button>
                <button
                  onClick={() => handleVote(message.id, message.matchupId, 'both_bad')}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#999',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Both Bad
                </button>
              </div>
            )}

            {message.vote && (
              <div style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>
                Voted: {message.vote === 'A' ? 'A is Better' : message.vote === 'B' ? 'B is Better' : message.vote === 'tie' ? 'Tie' : 'Both Bad'}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{
        position: 'sticky',
        bottom: 0,
        backgroundColor: 'white',
        padding: '1rem 0',
        borderTop: '2px solid black',
      }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
            placeholder="Type your message..."
            disabled={loading}
            style={{
              flex: 1,
              padding: '1rem',
              fontSize: '1rem',
              border: '2px solid black',
              outline: 'none',
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              backgroundColor: loading || !input.trim() ? '#ccc' : 'black',
              color: 'white',
              border: 'none',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      </div>
    </div>
  );
}

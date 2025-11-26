import { useState } from 'react';
import './Compare.css';

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
      <div className="compare-page">
        <h1 className="compare-page__header">
          Compare Models
        </h1>
        <button
          onClick={initializeSession}
          className="compare-page__start-btn"
        >
          Start Session
        </button>
        {error && <p className="compare-page__error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="compare-page">
      <h1 className="compare-page__header">
        Compare Models
      </h1>

      <div className="compare-page__messages">
        {messages.map((message) => (
          <div key={message.id} className="compare-page__message">
            <div className="compare-page__user-input">
              <strong>You:</strong> {message.userInput}
            </div>

            <div className="compare-page__outputs">
              <div className={`compare-page__output ${message.vote === 'A' ? 'compare-page__output--voted-a' : ''}`}>
                <div className="compare-page__output-label">Model A</div>
                <div className="compare-page__output-text">{message.outputA}</div>
              </div>

              <div className={`compare-page__output ${message.vote === 'B' ? 'compare-page__output--voted-b' : ''}`}>
                <div className="compare-page__output-label">Model B</div>
                <div className="compare-page__output-text">{message.outputB}</div>
              </div>
            </div>

            {!message.vote && (
              <div className="compare-page__voting">
                <button
                  onClick={() => handleVote(message.id, message.matchupId, 'A')}
                  className="compare-page__vote-btn"
                >
                  A is Better
                </button>
                <button
                  onClick={() => handleVote(message.id, message.matchupId, 'B')}
                  className="compare-page__vote-btn"
                >
                  B is Better
                </button>
                <button
                  onClick={() => handleVote(message.id, message.matchupId, 'tie')}
                  className="compare-page__vote-btn compare-page__vote-btn--secondary"
                >
                  Tie
                </button>
                <button
                  onClick={() => handleVote(message.id, message.matchupId, 'both_bad')}
                  className="compare-page__vote-btn compare-page__vote-btn--tertiary"
                >
                  Both Bad
                </button>
              </div>
            )}

            {message.vote && (
              <div className="compare-page__vote-result">
                Voted: {message.vote === 'A' ? 'A is Better' : message.vote === 'B' ? 'B is Better' : message.vote === 'tie' ? 'Tie' : 'Both Bad'}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="compare-page__input-container">
        <div className="compare-page__input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
            placeholder="Type your message..."
            disabled={loading}
            className="compare-page__input"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="compare-page__send-btn"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
        {error && <p className="compare-page__error">{error}</p>}
      </div>
    </div>
  );
}

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

interface Conversation {
  id: string;
  name: string;
  sessionId: string;
  messages: Message[];
  createdAt: Date;
}

export default function Compare() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
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

      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);

      // Update the conversation in the list
      if (currentConversationId) {
        setConversations(conversations.map(conv =>
          conv.id === currentConversationId
            ? { ...conv, messages: updatedMessages, name: conv.name === 'New Chat' ? input.slice(0, 30) + (input.length > 30 ? '...' : '') : conv.name }
            : conv
        ));
      }

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

      const updatedMessages = messages.map(msg =>
        msg.id === messageId ? { ...msg, vote } : msg
      );
      setMessages(updatedMessages);

      // Update the conversation in the list
      if (currentConversationId) {
        setConversations(conversations.map(conv =>
          conv.id === currentConversationId
            ? { ...conv, messages: updatedMessages }
            : conv
        ));
      }
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
      const newSessionId = data.session_id;

      // Create a new conversation
      const conversationId = Date.now().toString();
      const newConversation: Conversation = {
        id: conversationId,
        name: 'New Chat',
        sessionId: newSessionId,
        messages: [],
        createdAt: new Date(),
      };

      setConversations([...conversations, newConversation]);
      setCurrentConversationId(conversationId);
      setSessionId(newSessionId);
      setMessages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize');
    }
  };

  const switchConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      setSessionId(conversation.sessionId);
      setMessages(conversation.messages);
    }
  };

  const deleteConversation = (conversationId: string) => {
    const updatedConversations = conversations.filter(c => c.id !== conversationId);
    setConversations(updatedConversations);

    if (currentConversationId === conversationId) {
      if (updatedConversations.length > 0) {
        switchConversation(updatedConversations[0].id);
      } else {
        setCurrentConversationId(null);
        setSessionId(null);
        setMessages([]);
      }
    }
  };

  return (
    <div className="compare-page">
      {/* Sidebar */}
      <div className="compare-page__sidebar">
        <div className="compare-page__sidebar-header">
          <div className="compare-page__sidebar-title">Chats</div>
          <button
            onClick={initializeSession}
            className="compare-page__new-chat-btn"
          >
            New
          </button>
        </div>
        <div className="compare-page__conversations">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`compare-page__conversation-item ${
                conv.id === currentConversationId ? 'compare-page__conversation-item--active' : ''
              }`}
              onClick={() => switchConversation(conv.id)}
            >
              <div className="compare-page__conversation-name">{conv.name}</div>
              <button
                className="compare-page__conversation-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                }}
                aria-label="Delete conversation"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {!sessionId ? (
        <div className="compare-page__main">
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
      ) : (
        <div className="compare-page__main">
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
              <div className={`compare-page__output ${
                message.vote === 'A' ? 'compare-page__output--voted-a' :
                message.vote === 'tie' ? 'compare-page__output--voted-tie' :
                message.vote === 'both_bad' ? 'compare-page__output--voted-both-bad' : ''
              }`}>
                <div className="compare-page__output-label">Model A</div>
                <div className="compare-page__output-text">{message.outputA}</div>
              </div>

              <div className={`compare-page__output ${
                message.vote === 'B' ? 'compare-page__output--voted-b' :
                message.vote === 'tie' ? 'compare-page__output--voted-tie' :
                message.vote === 'both_bad' ? 'compare-page__output--voted-both-bad' : ''
              }`}>
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
      )}
    </div>
  );
}

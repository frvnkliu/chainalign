# ChainAlign Server

FastAPI backend for the ChainAlign arena system.

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the development server:**
   ```bash
   # From project root
   uvicorn server.main:app --reload --port 8000
   ```

3. **Access the API docs:**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/models` | GET | Get all available models |
| `/models/{model_id}` | GET | Get details for a specific model |
| `/session/start` | POST | Create a new arena session |
| `/session/process` | POST | Process input through two chains |
| `/session/vote` | POST | Vote on preferred output |
| `/health` | GET | Health check |

## Example Usage

### Get Available Models
```bash
curl http://localhost:8000/models
```

Response:
```json
{
  "models": [
    {
      "id": "gpt-4",
      "name": "GPT-4",
      "provider": "OpenAI",
      "description": "Most capable OpenAI model, best for complex tasks",
      "capabilities": ["text-generation", "reasoning", "coding"]
    },
    ...
  ],
  "count": 14
}
```

### Get Specific Model
```bash
curl http://localhost:8000/models/gpt-4
```

### Start a Session
```bash
curl -X POST "http://localhost:8000/session/start" \
  -H "Content-Type: application/json" \
  -d '{
    "model_chains": [
      ["gpt-4", "claude"],
      ["gpt-3.5"],
      ["claude", "gpt-4"]
    ]
  }'
```

### Process Input
```bash
curl -X POST "http://localhost:8000/session/process" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "your-session-id",
    "user_input": "What is the meaning of life?"
  }'
```

### Vote
```bash
curl -X POST "http://localhost:8000/session/vote" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "your-session-id",
    "matchup_id": "your-matchup-id",
    "vote": "A"
  }'
```

## Project Structure

```
server/
├── arena/              # Arena core logic
│   ├── arena_base.py  # Base arena classes
│   ├── elo.py         # ELO calculations
│   ├── types.py       # Type definitions
│   └── CONTEXT.md     # Comprehensive system documentation
├── main.py            # FastAPI app
├── models_registry.py # Available models registry
├── schemas.py         # Request/response models
├── requirements.txt   # Python dependencies
└── README.md          # This file
```

## Development Notes

- Currently returns dummy data (lorem ipsum)
- Uses in-memory session storage
- Ready for integration with real model chains
- ELO rating system already implemented in `arena/`

# Chain Align

Find the Model chain that best aligns with your needs

[chain-align.com](https://www.chain-align.com)

## Development

### Server Setup

```bash
cd server
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The server will be available at `http://localhost:8000`

### Client Setup

```bash
cd client
npm install
npm run dev
```

The client will be available at `http://localhost:3000`

The client is configured to proxy API requests to the server running on port 8000.

## Architecture

### Model Registry

Models are registered in `server/models.py` with the following fields:
- `id`: Unique identifier for the model
- `name`: Display name
- `provider`: Provider name (e.g., "openai", "anthropic")
- `input_type`: Media type for input (text, audio, video, image)
- `output_type`: Media type for output (text, audio, video, image)

To add a new model, simply add it to the `MODEL_REGISTRY` list in `server/models.py`.

### API Endpoints

- `GET /models` - Get all available models
- `POST /session/start` - Start a new arena session
- `POST /session/process` - Process input through chains
- `POST /session/vote` - Vote on outputs
- `GET /health` - Health check

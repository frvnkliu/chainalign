from fastapi import FastAPI, HTTPException
from server.schemas import (
    ModelResponse,
    AvailableModelsResponse,
    StartSessionRequest,
    StartSessionResponse,
    ProcessInputRequest,
    ProcessInputResponse,
    VoteRequest,
    VoteResponse,
)
from server.models_registry import get_all_models, get_model_by_id
import uuid

app = FastAPI(title="ChainAlign Arena API")

# In-memory storage for sessions (replace with database later)
sessions = {}


@app.post("/session/start", response_model=StartSessionResponse)
async def start_session(request: StartSessionRequest):
    """
    Start a new arena session with the provided model chains.

    Creates an arena that will compare outputs from different model chains.
    """
    session_id = str(uuid.uuid4())

    # Store session data (dummy for now)
    sessions[session_id] = {
        "model_chains": request.model_chains,
        "matchups": {}
    }

    return StartSessionResponse(
        session_id=session_id,
        num_chains=len(request.model_chains),
        message=f"Arena session created with {len(request.model_chains)} chains"
    )


@app.post("/session/process", response_model=ProcessInputResponse)
async def process_input(request: ProcessInputRequest):
    """
    Process user input through two randomly selected chains.

    Selects two chains from the arena, feeds the input through them,
    and returns both outputs for comparison.
    """
    if request.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    matchup_id = str(uuid.uuid4())

    # Store matchup info (dummy for now)
    sessions[request.session_id]["matchups"][matchup_id] = {
        "user_input": request.user_input,
        "chains": ["chain_0", "chain_1"]  # Dummy chain IDs
    }

    # Return dummy outputs
    return ProcessInputResponse(
        session_id=request.session_id,
        matchup_id=matchup_id,
        output_a="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        output_b="Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    )


@app.post("/session/vote", response_model=VoteResponse)
async def vote(request: VoteRequest):
    """
    Record a vote for which output the user preferred.

    Updates internal ELO ratings and statistics based on the vote.
    """
    if request.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    if request.matchup_id not in sessions[request.session_id]["matchups"]:
        raise HTTPException(status_code=404, detail="Matchup not found")

    # Validate vote
    valid_votes = ["A", "B", "tie", "both_bad"]
    if request.vote not in valid_votes:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid vote. Must be one of: {', '.join(valid_votes)}"
        )

    # Store vote (dummy for now)
    sessions[request.session_id]["matchups"][request.matchup_id]["vote"] = request.vote

    return VoteResponse(
        session_id=request.session_id,
        matchup_id=request.matchup_id,
        vote=request.vote,
        message=f"Vote '{request.vote}' recorded successfully"
    )


@app.get("/models", response_model=AvailableModelsResponse)
async def get_available_models():
    """
    Get all available models that can be used in chains.

    Returns a list of models with their metadata including:
    - id: Unique identifier for the model
    - name: Human-readable display name
    - provider: The company/organization providing the model
    - description: Brief description of the model's capabilities
    - capabilities: List of what the model can do (text-generation, vision, etc.)
    """
    models = get_all_models()
    return AvailableModelsResponse(
        models=models,
        count=len(models)
    )


@app.get("/models/{model_id}", response_model=ModelResponse)
async def get_model_details(model_id: str):
    """
    Get detailed information about a specific model.

    Args:
        model_id: The unique identifier of the model

    Returns:
        Detailed information about the requested model

    Raises:
        HTTPException: 404 if model not found
    """
    model = get_model_by_id(model_id)
    if not model:
        raise HTTPException(
            status_code=404,
            detail=f"Model with id '{model_id}' not found"
        )
    return model


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

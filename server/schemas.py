from pydantic import BaseModel
from typing import List


class StartSessionRequest(BaseModel):
    """Request to start a new arena session with model chains."""
    model_chains: List[List[str]]  # List of model chains (each chain is a list of model names)


class StartSessionResponse(BaseModel):
    """Response containing the session ID and arena info."""
    session_id: str
    num_chains: int
    message: str


class ProcessInputRequest(BaseModel):
    """Request to process input through two randomly selected chains."""
    session_id: str
    user_input: str


class ProcessInputResponse(BaseModel):
    """Response containing outputs from two chains."""
    session_id: str
    matchup_id: str
    output_a: str
    output_b: str


class VoteRequest(BaseModel):
    """Request to vote on which output was better."""
    session_id: str
    matchup_id: str
    vote: str  # "A", "B", "tie", or "both_bad"


class VoteResponse(BaseModel):
    """Response confirming the vote was recorded."""
    session_id: str
    matchup_id: str
    vote: str
    message: str

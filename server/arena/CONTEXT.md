# ChainAlign Arena System - Context & Architecture

## Overview

**ChainAlign** is a systematic, unbiased platform for comparing LLM/GenAI model outputs through an arena-based ELO rating system. The goal is to enable users to discover which model chain best aligns with their specific needs by conducting head-to-head comparisons in a blind, controlled environment.

## Core Concept: Model Chains

Unlike traditional model comparison tools that evaluate single models, ChainAlign introduces the concept of **Model Chains** - sequential pipelines where:

- Input flows through one or more models in sequence
- Each model transforms the output before passing to the next
- The final output is the result of the entire chain

**Examples:**
```python
# Single model chain
["GPT-4"] → processes input directly

# Multi-model chain
["GPT-4", "Claude"] → GPT-4 processes input, then Claude refines it

# Complex chain
["Llama", "GPT-3.5", "Gemini"] → Three-stage processing pipeline
```

This enables comparison of not just individual models, but entire workflows and processing strategies.

## System Architecture

### Frontend (React/TypeScript)

The client provides a visual interface for:

1. **Setup Phase** ([Setup.tsx](../../../client/src/pages/Setup.tsx))
   - Users build multiple model chains using drag-and-drop interface
   - Each chain is visualized as: `INPUT → [Model 1] → [Model 2] → ... → OUTPUT`
   - Users can add/remove chains and configure chain components
   - Available models: GPT-4, GPT-3.5, Claude, Llama, PaLM, Gemini, Mistral

2. **Compare Phase** ([Compare.tsx](../../../client/src/pages/Compare.tsx))
   - Users submit input text/prompts
   - System randomly selects two chains from the arena
   - Outputs from both chains displayed side-by-side (blinded - users don't know which chain produced which output)
   - Users vote on preferred output (A, B, Tie, or Both Bad)

3. **Components**
   - `MultiChainSelector`: Manages multiple chains in the setup
   - `ChainSelector`: Individual chain builder with visual flow
   - `ChainLink`: Individual model nodes in the chain

### Backend (FastAPI/Python)

Located in [server/](../../) with core arena logic in [server/arena/](./):

#### API Endpoints ([main.py](../../main.py))

| Endpoint | Purpose | Current State |
|----------|---------|---------------|
| `POST /session/start` | Initialize arena with user's model chains | Returns session ID (dummy implementation) |
| `POST /session/process` | Generate outputs from two randomly selected chains | Returns dummy outputs (lorem ipsum) |
| `POST /session/vote` | Record user's preference and update ELO ratings | Stores vote (ELO update not integrated) |
| `GET /health` | Health check | Functional |

#### Request/Response Schemas ([schemas.py](../../schemas.py))

```python
StartSessionRequest:
  - model_chains: List[List[str]]  # e.g., [["gpt4", "claude"], ["gpt3"]]

ProcessInputRequest:
  - session_id: str
  - user_input: str  # The prompt/input to process

VoteRequest:
  - session_id: str
  - matchup_id: str
  - vote: str  # "A", "B", "tie", or "both_bad"
```

## Arena Core System

### 1. Model Protocol ([arena_base.py](arena_base.py):9-44)

The `Model` protocol standardizes how models are used in the arena:

```python
class Model(Protocol[TInput, TOutput]):
    name: str                              # Unique identifier
    function: Callable[[TInput], TOutput]  # Inference function

    def __call__(self, input_data: TInput) -> TOutput
    def __hash__(self) -> int              # Hash by name for dict keys
    def __eq__(self, other) -> bool        # Compare by name
```

**Key Features:**
- Generic types support any input/output format (text, audio, images, etc.)
- Hashable by name - can be used as dictionary keys for ELO tracking
- Protocol-based - flexible implementation (not tied to specific classes)

### 2. ModelChain ([arena_base.py](arena_base.py):46-70)

Represents a sequential pipeline of models:

```python
class ModelChain(Generic[TInput, TOutput]):
    model_chain: list[Model]  # Sequential list of models

    def __call__(self, input_data: TInput) -> TOutput:
        # Pipe input through each model sequentially
        for model in self.model_chain:
            input_data = model(input_data)
        return input_data
```

**Key Features:**
- Executes models in sequence (output of one becomes input to next)
- Hashed by concatenated model names with `|` separator (e.g., "gpt4|claude")
- Can contain single or multiple models

### 3. ArenaBase ([arena_base.py](arena_base.py):72-236)

The core arena manager that orchestrates comparisons and ratings:

```python
class ArenaBase(Generic[TInput, TOutput]):
    model_chains: list[ModelChain]           # All competing chains
    model_elos: dict[Model, float]           # Individual model ratings
    chain_elos: dict[ModelChain, float]      # Full chain ratings
```

#### Dual ELO System

The arena tracks TWO types of ratings:

1. **Individual Model ELO** (`model_elos`)
   - Each unique model has its own rating
   - Updated using team-based ELO calculations
   - Useful for understanding which individual models perform best
   - If a chain has multiple models, they all receive the same ELO change (team approach)

2. **Chain ELO** (`chain_elos`)
   - Each complete chain treated as a single entity
   - Updated using standard ELO calculations
   - Reflects the performance of the entire pipeline
   - More relevant for users choosing complete workflows

**Example:**
```
Chain A: [GPT-4, Claude]
Chain B: [GPT-3.5]

If Chain A wins:
- Individual: GPT-4 ELO ↑, Claude ELO ↑ (same amount), GPT-3.5 ELO ↓
- Chain: "GPT-4|Claude" ELO ↑, "GPT-3.5" ELO ↓
```

#### Vote Recording ([arena_base.py](arena_base.py):117-156)

```python
def record_vote(
    chain_a: ModelChain,
    chain_b: ModelChain,
    vote: VoteOutcome  # A, B, TIE, BOTH_BAD
) -> None
```

Updates both model-level and chain-level ELO ratings based on vote outcome.

#### Leaderboards ([arena_base.py](arena_base.py):183-235)

- `get_leaderboard()` - Individual models ranked by ELO
- `get_chain_leaderboard()` - Full chains ranked by ELO
- Both return sorted lists: `[(model/chain, elo_rating), ...]`

## ELO Rating System

Located in [elo.py](elo.py), implements standard ELO calculations with modifications:

### Vote Outcomes ([types.py](types.py):4-8)

```python
class VoteOutcome(Enum):
    A = "A"              # User prefers output A
    B = "B"              # User prefers output B
    TIE = "tie"          # Both outputs equally good
    BOTH_BAD = "both_bad"  # Both outputs are poor
```

### Calculation Methods

1. **Standard Win/Loss** - Winner gains points, loser loses points
2. **Tie** - Both receive small adjustments toward equilibrium (0.5 score)
3. **Both Bad** - Both lose points (0 score, like both losing)

### Team-Based ELO ([elo.py](elo.py):66-96)

For multi-model chains, uses team-based calculations:
- Calculate average team rating
- Determine expected score based on team averages
- Apply same rating change to all team members
- Ensures all models in a winning chain benefit equally

### K-Factor

Default K-factor of 32 controls rating volatility:
- Higher K = more dramatic rating swings
- Lower K = more stable, gradual changes
- Can be adjusted per use case

## Workflow: How It All Connects

### 1. Setup
```
User (Frontend) → POST /session/start → Server
  ↓
Creates ArenaBase with user's chains
  ↓
Initializes all models at 1500 ELO
  ↓
Returns session_id
```

### 2. Comparison Round
```
User submits input → POST /session/process
  ↓
ArenaBase.generate_matchup() selects 2 random chains
  ↓
Both chains process the input
  ↓
Returns outputs (blinded - order randomized)
  ↓
User sees Output A vs Output B (doesn't know which chain)
```

### 3. Vote & Update
```
User votes (A/B/Tie/Both Bad) → POST /session/vote
  ↓
ArenaBase.record_vote()
  ↓
calculate_team_elo_from_vote() updates model ELOs
  ↓
calculate_elo_from_vote() updates chain ELOs
  ↓
Leaderboards updated
```

### 4. Results
```
After many rounds:
  ↓
get_leaderboard() shows best individual models
  ↓
get_chain_leaderboard() shows best complete workflows
  ↓
User discovers which chain aligns with their needs
```

## Design Principles

### 1. Unbiased Comparison
- **Blind Voting**: Users don't see which chain produced which output
- **Random Matchups**: Prevents gaming the system
- **Statistical Convergence**: ELO ratings stabilize after sufficient comparisons

### 2. Generality
- **Generic Types**: Works with any input/output (text, audio, images, structured data)
- **Protocol-Based Models**: Not tied to specific LLM APIs
- **Extensible**: Easy to add new models or chains

### 3. Dual Metrics
- **Individual Model ELO**: "Which models are strongest?"
- **Chain ELO**: "Which complete workflows work best?"
- Both provide different valuable insights

### 4. Fair Team Dynamics
- Multi-model chains use team-based ELO
- All models in a chain share success/failure
- Prevents unfair penalization of individual models in longer chains

## Current Implementation Status

### ✅ Implemented
- Complete ELO calculation system
- Model and ModelChain abstractions
- ArenaBase with dual rating tracking
- Vote recording and leaderboard generation
- API endpoint structure
- Frontend chain builder UI

### 🚧 In Progress / TODO
- **Integration**: Connect ArenaBase to actual API endpoints (currently dummy data)
- **Model Implementations**: Real LLM API integrations (OpenAI, Anthropic, etc.)
- **Persistence**: Database for sessions, votes, and ratings
- **Async/Streaming**: Support for streaming model outputs
- **Matchup Generation**: Implement smart matchup selection algorithm
- **Analytics**: Extended statistics, confidence intervals, etc.
- **Authentication**: User sessions and rate limiting

## Use Cases

### 1. Prompt Engineering
Compare different prompting strategies:
- `["GPT-4 with system prompt A"]` vs `["GPT-4 with system prompt B"]`

### 2. Model Selection
Find best model for your domain:
- `["GPT-4"]` vs `["Claude"]` vs `["Gemini"]` for your specific use case

### 3. Pipeline Optimization
Test multi-stage workflows:
- `["Llama (draft)", "GPT-4 (refine)"]` vs `["GPT-4 (direct)"]`

### 4. Quality vs Cost Tradeoffs
Compare expensive vs efficient approaches:
- `["GPT-4"]` vs `["GPT-3.5", "Claude"]` - is two cheaper models better than one expensive one?

### 5. Specialized Chains
Domain-specific processing:
- `["Legal-tuned model", "GPT-4 (summarize)"]` for legal document analysis

## Future Extensions

### Multi-Modal Support
- Text-to-Image chains: `["GPT-4 (prompt)", "DALL-E"]`
- Audio chains: `["Whisper", "GPT-4", "TTS"]`
- Vision chains: `["Vision model", "GPT-4 (describe)"]`

### Advanced Matchmaking
- ELO-based pairing (similar strength opponents)
- Adaptive testing (focus on close matchups)
- User-specific arenas (personalized rankings)

### Collaborative Filtering
- Different users may have different preferences
- Build user-specific leaderboards
- Recommend chains based on similar users' preferences

### Analytics Dashboard
- Win rate trends over time
- Confidence intervals on ratings
- Head-to-head comparison matrices
- Performance by input category

## Key Files Reference

| File | Purpose | Lines of Interest |
|------|---------|-------------------|
| [arena_base.py](arena_base.py) | Core arena classes | Model (9-44), ModelChain (46-70), ArenaBase (72-236) |
| [elo.py](elo.py) | ELO calculations | Team ELO (66-96), Vote-based (165-201) |
| [types.py](types.py) | Type definitions | VoteOutcome (4-8), Model names (11-37) |
| [main.py](../../main.py) | API endpoints | Session management, voting flow |
| [schemas.py](../../schemas.py) | API contracts | Request/response models |
| [test_arena_base.py](test_arena_base.py) | Comprehensive tests | 32 tests covering all functionality |

## Testing

See [README_TESTS.md](README_TESTS.md) for full testing documentation.

Quick test run:
```bash
python -m pytest server/arena/test_arena_base.py -v
```

Coverage includes:
- ✅ Model hashing, equality, and protocol compliance
- ✅ ModelChain execution and composition
- ✅ Arena initialization and ELO tracking
- ✅ Vote recording for all outcomes
- ✅ Leaderboard generation and sorting
- ✅ Team-based ELO updates

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│                    (React Frontend - Client)                    │
│                                                                 │
│  Setup Page          Compare Page          Results Page        │
│  Build chains        Vote on outputs       View leaderboards   │
└────────────┬─────────────────────┬──────────────┬──────────────┘
             │                     │              │
             │ HTTP/REST API       │              │
             │                     │              │
┌────────────▼─────────────────────▼──────────────▼──────────────┐
│                       FastAPI Server                            │
│                    (Python Backend - Server)                    │
│                                                                 │
│  /session/start     /session/process     /session/vote         │
│  Create arena       Generate outputs     Record preference     │
└────────────┬──────────────────────────────────┬────────────────┘
             │                                  │
             │ Uses                             │
             │                                  │
┌────────────▼──────────────────────────────────▼────────────────┐
│                      Arena Core System                          │
│                   (server/arena package)                        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │   Model      │  │  ModelChain  │  │    ArenaBase       │   │
│  │  Protocol    │→ │  Sequential  │→ │  Rating Manager    │   │
│  │              │  │  Pipeline    │  │                    │   │
│  └──────────────┘  └──────────────┘  └─────────┬──────────┘   │
│                                                 │              │
│  ┌──────────────────────────────────────────────▼──────────┐   │
│  │              ELO Rating Engine                          │   │
│  │  • Individual model ratings (team-based)                │   │
│  │  • Chain ratings (entity-based)                         │   │
│  │  • Vote outcomes: A, B, Tie, Both Bad                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

Data Flow (Single Comparison Round):
1. User builds chains: ["GPT-4", "Claude"], ["GPT-3.5"]
2. POST /session/start → ArenaBase initialized
3. User submits input: "Explain quantum computing"
4. POST /session/process → Two chains selected randomly
5. Chain A processes: Input → GPT-4 → Claude → Output A
6. Chain B processes: Input → GPT-3.5 → Output B
7. User sees blinded: "Output X" vs "Output Y"
8. User votes: "X is better"
9. POST /session/vote → ELO ratings updated
10. Leaderboards reflect new ratings
```

## Summary

ChainAlign provides a systematic, unbiased way to discover the best LLM workflows through:
- **Chain-based comparisons** (not just individual models)
- **Blind voting** (eliminates bias)
- **ELO ratings** (statistically sound rankings)
- **Dual metrics** (models + complete workflows)

The arena system is fully implemented and tested, ready for integration with real model APIs and production deployment.

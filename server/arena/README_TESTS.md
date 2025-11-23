# Arena Tests

This directory contains tests for the arena package.

## Running Tests

From the project root (`/Users/frankliu/Code/yc/chainalign-server/`):

```bash
# Run all arena tests
python -m pytest server/arena/test_arena_base.py -v

# Run specific test class
python -m pytest server/arena/test_arena_base.py::TestModel -v

# Run specific test
python -m pytest server/arena/test_arena_base.py::TestModel::test_model_creation -v

# Run with coverage
python -m pytest server/arena/test_arena_base.py --cov=arena --cov-report=term-missing

# Run all tests in the server directory
python -m pytest server/ -v
```

## Test Structure

- `test_arena_base.py` - Tests for Model, ModelChain, and ArenaBase classes
  - **TestModel** - Tests for the Model protocol implementation
  - **TestModelChain** - Tests for ModelChain functionality
  - **TestArenaBase** - Tests for ArenaBase initialization and basic operations
  - **TestVoting** - Tests for vote recording and ELO updates

## Package Structure

The `arena` package is properly configured with:
- `__init__.py` - Exports all public classes and functions
- `conftest.py` - Pytest configuration for proper imports
- `pytest.ini` - Root-level pytest configuration

You can import from the package like this:

```python
from arena import Model, ModelChain, ArenaBase, VoteOutcome
from arena import calculate_elo_from_vote
```

## Coverage

Current test coverage includes:
- ✅ Model creation, hashing, equality
- ✅ ModelChain creation, execution, hashing
- ✅ Arena initialization with ELO ratings
- ✅ Vote recording for all outcomes (A wins, B wins, tie, both bad)
- ✅ Leaderboard generation and ordering
- ✅ Model and chain ELO retrieval
- ✅ Team-based ELO updates for multi-model chains

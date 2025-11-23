import pytest
from arena.arena_base import Model, ModelChain, ArenaBase
from arena.types import VoteOutcome


# Test fixtures
class SimpleModel:
    """Simple test model implementation."""

    def __init__(self, name: str, function):
        self.name = name
        self.function = function

    def __call__(self, input_data):
        return self.function(input_data)

    def __repr__(self) -> str:
        return f"Model(name={self.name})"

    def __hash__(self) -> int:
        return hash(self.name)

    def __eq__(self, other) -> bool:
        if isinstance(other, SimpleModel):
            return self.name == other.name
        return False


@pytest.fixture
def simple_models():
    """Create simple test models."""
    model_a = SimpleModel("model_a", lambda x: x.upper())
    model_b = SimpleModel("model_b", lambda x: x.lower())
    model_c = SimpleModel("model_c", lambda x: x + "!")
    return model_a, model_b, model_c


@pytest.fixture
def simple_chains(simple_models):
    """Create simple test model chains."""
    model_a, model_b, model_c = simple_models
    chain_a = ModelChain([model_a])
    chain_b = ModelChain([model_b])
    chain_c = ModelChain([model_a, model_c])  # Multi-model chain
    return chain_a, chain_b, chain_c


@pytest.fixture
def basic_arena(simple_chains):
    """Create a basic arena for testing."""
    chain_a, chain_b, chain_c = simple_chains
    return ArenaBase([chain_a, chain_b, chain_c], initial_elo=1500.0)


# === Model Tests ===
class TestModel:
    def test_model_creation(self):
        """Test creating a model with name and function."""
        model = SimpleModel("test_model", lambda x: x * 2)
        assert model.name == "test_model"
        assert model(5) == 10

    def test_model_call(self):
        """Test calling a model executes its function."""
        model = SimpleModel("uppercase", lambda x: x.upper())
        assert model("hello") == "HELLO"

    def test_model_repr(self):
        """Test model string representation."""
        model = SimpleModel("my_model", lambda x: x)
        assert repr(model) == "Model(name=my_model)"

    def test_model_hash(self):
        """Test models can be hashed by name."""
        model1 = SimpleModel("same_name", lambda x: x * 2)
        model2 = SimpleModel("same_name", lambda x: x * 3)
        assert hash(model1) == hash(model2)

        model3 = SimpleModel("different_name", lambda x: x * 2)
        assert hash(model1) != hash(model3)

    def test_model_equality(self):
        """Test models are equal if they have the same name."""
        model1 = SimpleModel("same_name", lambda x: x * 2)
        model2 = SimpleModel("same_name", lambda x: x * 3)
        assert model1 == model2

        model3 = SimpleModel("different_name", lambda x: x * 2)
        assert model1 != model3

    def test_model_inequality_with_non_model(self):
        """Test models are not equal to non-model objects."""
        model = SimpleModel("test", lambda x: x)
        assert model != "test"
        assert model != 123
        assert model != None


# === ModelChain Tests ===
class TestModelChain:
    def test_chain_creation_from_list(self):
        """Test creating a chain from a list of models."""
        model1 = SimpleModel("m1", lambda x: x + "1")
        model2 = SimpleModel("m2", lambda x: x + "2")
        chain = ModelChain([model1, model2])
        assert chain.model_chain == [model1, model2]

    def test_chain_creation_from_single_model(self):
        """Test creating a chain from a single callable model."""
        model = SimpleModel("m1", lambda x: x + "1")
        chain = ModelChain(model)
        assert chain.model_chain == [model]

    def test_chain_repr(self):
        """Test chain string representation."""
        model = SimpleModel("m1", lambda x: x)
        chain = ModelChain([model])
        assert "ModelChain" in repr(chain)

    def test_chain_call_single_model(self):
        """Test calling a chain with a single model."""
        model = SimpleModel("upper", lambda x: x.upper())
        chain = ModelChain([model])
        assert chain("hello") == "HELLO"

    def test_chain_call_multiple_models(self):
        """Test calling a chain with multiple models executes them in order."""
        model1 = SimpleModel("upper", lambda x: x.upper())
        model2 = SimpleModel("exclaim", lambda x: x + "!")
        chain = ModelChain([model1, model2])
        assert chain("hello") == "HELLO!"

    def test_chain_hash(self):
        """Test chains are hashed based on model names."""
        model1 = SimpleModel("m1", lambda x: x)
        model2 = SimpleModel("m2", lambda x: x)

        chain1 = ModelChain([model1, model2])
        chain2 = ModelChain([model1, model2])
        assert hash(chain1) == hash(chain2)

        chain3 = ModelChain([model2, model1])  # Different order
        assert hash(chain1) != hash(chain3)

    def test_chain_equality(self):
        """Test chains are equal if they contain the same models in the same order."""
        model1 = SimpleModel("m1", lambda x: x)
        model2 = SimpleModel("m2", lambda x: x)

        chain1 = ModelChain([model1, model2])
        chain2 = ModelChain([model1, model2])
        assert chain1 == chain2

        chain3 = ModelChain([model2, model1])
        assert chain1 != chain3

    def test_chain_inequality_with_non_chain(self):
        """Test chains are not equal to non-chain objects."""
        model = SimpleModel("m1", lambda x: x)
        chain = ModelChain([model])
        assert chain != "chain"
        assert chain != [model]


# === ArenaBase Tests ===
class TestArenaBase:
    def test_arena_initialization(self, simple_chains):
        """Test arena initializes with model chains and default ELO."""
        chain_a, chain_b, chain_c = simple_chains
        arena = ArenaBase([chain_a, chain_b], initial_elo=1500.0)

        assert len(arena.model_chains) == 2
        assert arena.model_chains == [chain_a, chain_b]

    def test_arena_initial_model_elos(self, simple_chains, simple_models):
        """Test arena initializes model ELOs correctly."""
        chain_a, chain_b, chain_c = simple_chains
        model_a, model_b, model_c = simple_models

        arena = ArenaBase([chain_a, chain_b, chain_c], initial_elo=1600.0)

        # All models should start at initial ELO
        assert arena.model_elos[model_a] == 1600.0
        assert arena.model_elos[model_b] == 1600.0
        assert arena.model_elos[model_c] == 1600.0

        # Should have exactly 3 unique models
        assert len(arena.model_elos) == 3

    def test_arena_initial_chain_elos(self, simple_chains):
        """Test arena initializes chain ELOs correctly."""
        chain_a, chain_b, chain_c = simple_chains
        arena = ArenaBase([chain_a, chain_b, chain_c], initial_elo=1700.0)

        # All chains should start at initial ELO
        assert arena.chain_elos[chain_a] == 1700.0
        assert arena.chain_elos[chain_b] == 1700.0
        assert arena.chain_elos[chain_c] == 1700.0

    def test_arena_deduplicates_models(self, simple_models):
        """Test arena doesn't double-count models used in multiple chains."""
        model_a, model_b, _ = simple_models

        # Use model_a in two different chains
        chain1 = ModelChain([model_a])
        chain2 = ModelChain([model_a, model_b])

        arena = ArenaBase([chain1, chain2], initial_elo=1500.0)

        # model_a should only appear once in model_elos
        assert len(arena.model_elos) == 2  # Only model_a and model_b
        assert arena.model_elos[model_a] == 1500.0

    def test_list_models(self, basic_arena, simple_chains):
        """Test listing all models in the arena."""
        chain_a, chain_b, chain_c = simple_chains
        models = basic_arena.list_models()
        assert models == [chain_a, chain_b, chain_c]

    def test_get_model_elo_by_object(self, basic_arena, simple_models):
        """Test getting model ELO by model object."""
        model_a, _, _ = simple_models
        elo = basic_arena.get_model_elo(model_a)
        assert elo == 1500.0

    def test_get_model_elo_by_name(self, basic_arena):
        """Test getting model ELO by model name string."""
        elo = basic_arena.get_model_elo("model_a")
        assert elo == 1500.0

    def test_get_model_elo_not_found(self, basic_arena):
        """Test getting ELO for non-existent model raises KeyError."""
        with pytest.raises(KeyError, match="not found in arena"):
            basic_arena.get_model_elo("nonexistent_model")

    def test_get_chain_elo(self, basic_arena, simple_chains):
        """Test getting chain ELO."""
        chain_a, _, _ = simple_chains
        elo = basic_arena.get_chain_elo(chain_a)
        assert elo == 1500.0

    def test_get_leaderboard_initial(self, basic_arena, simple_models):
        """Test leaderboard with equal ratings."""
        model_a, model_b, model_c = simple_models
        leaderboard = basic_arena.get_leaderboard()

        assert len(leaderboard) == 3
        # All models should have same rating initially
        for model, elo in leaderboard:
            assert elo == 1500.0

    def test_get_chain_leaderboard_initial(self, basic_arena, simple_chains):
        """Test chain leaderboard with equal ratings."""
        leaderboard = basic_arena.get_chain_leaderboard()

        assert len(leaderboard) == 3
        # All chains should have same rating initially
        for chain, elo in leaderboard:
            assert elo == 1500.0


# === Vote Recording Tests ===
class TestVoting:
    def test_record_vote_a_wins(self, basic_arena, simple_chains, simple_models):
        """Test recording a vote where chain A wins."""
        chain_a, chain_b, _ = simple_chains
        model_a, model_b, _ = simple_models

        initial_a_elo = basic_arena.model_elos[model_a]
        initial_b_elo = basic_arena.model_elos[model_b]

        basic_arena.record_vote(chain_a, chain_b, VoteOutcome.A)

        # Winner's ELO should increase, loser's should decrease
        assert basic_arena.model_elos[model_a] > initial_a_elo
        assert basic_arena.model_elos[model_b] < initial_b_elo

        # Same for chain ELOs
        assert basic_arena.chain_elos[chain_a] > 1500.0
        assert basic_arena.chain_elos[chain_b] < 1500.0

    def test_record_vote_b_wins(self, basic_arena, simple_chains, simple_models):
        """Test recording a vote where chain B wins."""
        chain_a, chain_b, _ = simple_chains
        model_a, model_b, _ = simple_models

        initial_a_elo = basic_arena.model_elos[model_a]
        initial_b_elo = basic_arena.model_elos[model_b]

        basic_arena.record_vote(chain_a, chain_b, VoteOutcome.B)

        # Loser's ELO should decrease, winner's should increase
        assert basic_arena.model_elos[model_a] < initial_a_elo
        assert basic_arena.model_elos[model_b] > initial_b_elo

        # Same for chain ELOs
        assert basic_arena.chain_elos[chain_a] < 1500.0
        assert basic_arena.chain_elos[chain_b] > 1500.0

    def test_record_vote_tie(self, basic_arena, simple_chains):
        """Test recording a tie vote."""
        chain_a, chain_b, _ = simple_chains

        basic_arena.record_vote(chain_a, chain_b, VoteOutcome.TIE)

        # For equal ratings, tie should keep them approximately equal
        # (small adjustments may occur due to expectations)
        assert abs(basic_arena.chain_elos[chain_a] - 1500.0) < 1.0
        assert abs(basic_arena.chain_elos[chain_b] - 1500.0) < 1.0

    def test_record_vote_both_bad(self, basic_arena, simple_chains):
        """Test recording a both bad vote."""
        chain_a, chain_b, _ = simple_chains

        basic_arena.record_vote(chain_a, chain_b, VoteOutcome.BOTH_BAD)

        # Both should decrease
        assert basic_arena.chain_elos[chain_a] < 1500.0
        assert basic_arena.chain_elos[chain_b] < 1500.0

    def test_multiple_votes_affect_leaderboard(self, basic_arena, simple_chains, simple_models):
        """Test that multiple votes properly update the leaderboard."""
        chain_a, chain_b, chain_c = simple_chains
        model_a, model_b, model_c = simple_models

        # Chain A beats Chain B multiple times
        for _ in range(3):
            basic_arena.record_vote(chain_a, chain_b, VoteOutcome.A)

        leaderboard = basic_arena.get_leaderboard()

        # model_a should be at top, model_b at bottom, model_c unchanged
        assert leaderboard[0][0] == model_a  # Highest ELO
        assert leaderboard[-1][0] == model_b  # Lowest ELO

        # Verify descending order
        elos = [elo for _, elo in leaderboard]
        assert elos == sorted(elos, reverse=True)

    def test_chain_leaderboard_ordering(self, basic_arena, simple_chains):
        """Test chain leaderboard is properly ordered."""
        chain_a, chain_b, chain_c = simple_chains

        # Chain C beats everyone
        basic_arena.record_vote(chain_c, chain_a, VoteOutcome.A)
        basic_arena.record_vote(chain_c, chain_b, VoteOutcome.A)

        # Chain A beats Chain B
        basic_arena.record_vote(chain_a, chain_b, VoteOutcome.A)

        leaderboard = basic_arena.get_chain_leaderboard()

        # Verify descending order
        elos = [elo for _, elo in leaderboard]
        assert elos == sorted(elos, reverse=True)

        # Chain C should be first
        assert leaderboard[0][0] == chain_c

    def test_team_elo_updates_all_models_in_chain(self, simple_models):
        """Test that multi-model chains update all models' ELOs."""
        model_a, model_b, model_c = simple_models

        # Chain with multiple models
        chain_ab = ModelChain([model_a, model_b])
        chain_c = ModelChain([model_c])

        arena = ArenaBase([chain_ab, chain_c], initial_elo=1500.0)

        arena.record_vote(chain_ab, chain_c, VoteOutcome.A)

        # Both models in winning chain should increase
        assert arena.model_elos[model_a] > 1500.0
        assert arena.model_elos[model_b] > 1500.0

        # Losing model should decrease
        assert arena.model_elos[model_c] < 1500.0

        # Models in the same chain should have equal ratings (same change applied)
        assert arena.model_elos[model_a] == arena.model_elos[model_b]

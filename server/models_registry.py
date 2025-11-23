"""Registry of available LLM models for the ChainAlign arena."""

from schemas import ModelResponse

# Central registry of all available models
AVAILABLE_MODELS = [
    ModelResponse(
        id="gpt-4",
        name="GPT-4",
        provider="OpenAI",
        description="Most capable OpenAI model, best for complex tasks",
        capabilities=["text-generation", "reasoning", "coding"]
    ),
    ModelResponse(
        id="gpt-4-turbo",
        name="GPT-4 Turbo",
        provider="OpenAI",
        description="Faster and more cost-effective version of GPT-4",
        capabilities=["text-generation", "reasoning", "coding", "vision"]
    ),
    ModelResponse(
        id="gpt-3.5-turbo",
        name="GPT-3.5 Turbo",
        provider="OpenAI",
        description="Fast and efficient for most tasks",
        capabilities=["text-generation", "reasoning", "coding"]
    ),
    ModelResponse(
        id="claude-3-5-sonnet",
        name="Claude 3.5 Sonnet",
        provider="Anthropic",
        description="Most intelligent Claude model, excellent for analysis and coding",
        capabilities=["text-generation", "reasoning", "coding", "vision"]
    ),
    ModelResponse(
        id="claude-3-opus",
        name="Claude 3 Opus",
        provider="Anthropic",
        description="Powerful model for complex tasks requiring deep understanding",
        capabilities=["text-generation", "reasoning", "coding", "vision"]
    ),
    ModelResponse(
        id="claude-3-haiku",
        name="Claude 3 Haiku",
        provider="Anthropic",
        description="Fast and cost-effective Claude model",
        capabilities=["text-generation", "reasoning", "coding", "vision"]
    ),
    ModelResponse(
        id="llama-3-70b",
        name="Llama 3 70B",
        provider="Meta",
        description="Large open-source model with strong performance",
        capabilities=["text-generation", "reasoning", "coding"]
    ),
    ModelResponse(
        id="llama-3-8b",
        name="Llama 3 8B",
        provider="Meta",
        description="Efficient open-source model for general tasks",
        capabilities=["text-generation", "reasoning"]
    ),
    ModelResponse(
        id="gemini-pro",
        name="Gemini Pro",
        provider="Google",
        description="Google's advanced multimodal AI model",
        capabilities=["text-generation", "reasoning", "coding", "vision"]
    ),
    ModelResponse(
        id="gemini-ultra",
        name="Gemini Ultra",
        provider="Google",
        description="Google's most capable AI model",
        capabilities=["text-generation", "reasoning", "coding", "vision", "audio"]
    ),
    ModelResponse(
        id="palm-2",
        name="PaLM 2",
        provider="Google",
        description="Google's language model for text generation",
        capabilities=["text-generation", "reasoning"]
    ),
    ModelResponse(
        id="mistral-large",
        name="Mistral Large",
        provider="Mistral AI",
        description="Flagship model from Mistral AI",
        capabilities=["text-generation", "reasoning", "coding"]
    ),
    ModelResponse(
        id="mistral-medium",
        name="Mistral Medium",
        provider="Mistral AI",
        description="Balanced performance and cost",
        capabilities=["text-generation", "reasoning", "coding"]
    ),
    ModelResponse(
        id="mistral-small",
        name="Mistral Small",
        provider="Mistral AI",
        description="Fast and efficient for simple tasks",
        capabilities=["text-generation", "reasoning"]
    ),
]


def get_all_models() -> list[ModelResponse]:
    """Get all available models."""
    return AVAILABLE_MODELS


def get_model_by_id(model_id: str) -> ModelResponse | None:
    """Get a specific model by its ID."""
    for model in AVAILABLE_MODELS:
        if model.id == model_id:
            return model
    return None


def get_models_by_provider(provider: str) -> list[ModelResponse]:
    """Get all models from a specific provider."""
    return [model for model in AVAILABLE_MODELS if model.provider.lower() == provider.lower()]


def get_models_by_capability(capability: str) -> list[ModelResponse]:
    """Get all models with a specific capability."""
    return [
        model for model in AVAILABLE_MODELS
        if model.capabilities and capability in model.capabilities
    ]

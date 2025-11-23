"""Registry of available LLM and TTS models for the ChainAlign arena."""

from server.schemas import ModelResponse, MediaType

# Central registry of all available models
AVAILABLE_MODELS = [
    # === LLM Models (Text -> Text) ===
    ModelResponse(
        id="gpt-4",
        name="GPT-4",
        provider="OpenAI",
        input_type=MediaType.TEXT,
        output_type=MediaType.TEXT,
        description="Most capable OpenAI model, best for complex tasks",
        capabilities=["text-generation", "reasoning", "coding"]
    ),
    ModelResponse(
        id="gpt-4-turbo",
        name="GPT-4 Turbo",
        provider="OpenAI",
        input_type=MediaType.TEXT,
        output_type=MediaType.TEXT,
        description="Faster and more cost-effective version of GPT-4",
        capabilities=["text-generation", "reasoning", "coding", "vision"]
    ),
    ModelResponse(
        id="gpt-3.5-turbo",
        name="GPT-3.5 Turbo",
        provider="OpenAI",
        input_type=MediaType.TEXT,
        output_type=MediaType.TEXT,
        description="Fast and efficient for most tasks",
        capabilities=["text-generation", "reasoning", "coding"]
    ),
    ModelResponse(
        id="claude-3-5-sonnet",
        name="Claude 3.5 Sonnet",
        provider="Anthropic",
        input_type=MediaType.TEXT,
        output_type=MediaType.TEXT,
        description="Most intelligent Claude model, excellent for analysis and coding",
        capabilities=["text-generation", "reasoning", "coding", "vision"]
    ),
    ModelResponse(
        id="claude-3-opus",
        name="Claude 3 Opus",
        provider="Anthropic",
        input_type=MediaType.TEXT,
        output_type=MediaType.TEXT,
        description="Powerful model for complex tasks requiring deep understanding",
        capabilities=["text-generation", "reasoning", "coding", "vision"]
    ),
    ModelResponse(
        id="claude-3-haiku",
        name="Claude 3 Haiku",
        provider="Anthropic",
        input_type=MediaType.TEXT,
        output_type=MediaType.TEXT,
        description="Fast and cost-effective Claude model",
        capabilities=["text-generation", "reasoning", "coding", "vision"]
    ),
    ModelResponse(
        id="llama-3-70b",
        name="Llama 3 70B",
        provider="Meta",
        input_type=MediaType.TEXT,
        output_type=MediaType.TEXT,
        description="Large open-source model with strong performance",
        capabilities=["text-generation", "reasoning", "coding"]
    ),
    ModelResponse(
        id="llama-3-8b",
        name="Llama 3 8B",
        provider="Meta",
        input_type=MediaType.TEXT,
        output_type=MediaType.TEXT,
        description="Efficient open-source model for general tasks",
        capabilities=["text-generation", "reasoning"]
    ),
    ModelResponse(
        id="gemini-pro",
        name="Gemini Pro",
        provider="Google",
        input_type=MediaType.TEXT,
        output_type=MediaType.TEXT,
        description="Google's advanced multimodal AI model",
        capabilities=["text-generation", "reasoning", "coding", "vision"]
    ),
    ModelResponse(
        id="gemini-ultra",
        name="Gemini Ultra",
        provider="Google",
        input_type=MediaType.TEXT,
        output_type=MediaType.TEXT,
        description="Google's most capable AI model",
        capabilities=["text-generation", "reasoning", "coding", "vision", "audio"]
    ),
    ModelResponse(
        id="palm-2",
        name="PaLM 2",
        provider="Google",
        input_type=MediaType.TEXT,
        output_type=MediaType.TEXT,
        description="Google's language model for text generation",
        capabilities=["text-generation", "reasoning"]
    ),
    ModelResponse(
        id="mistral-large",
        name="Mistral Large",
        provider="Mistral AI",
        input_type=MediaType.TEXT,
        output_type=MediaType.TEXT,
        description="Flagship model from Mistral AI",
        capabilities=["text-generation", "reasoning", "coding"]
    ),
    ModelResponse(
        id="mistral-medium",
        name="Mistral Medium",
        provider="Mistral AI",
        input_type=MediaType.TEXT,
        output_type=MediaType.TEXT,
        description="Balanced performance and cost",
        capabilities=["text-generation", "reasoning", "coding"]
    ),
    ModelResponse(
        id="mistral-small",
        name="Mistral Small",
        provider="Mistral AI",
        input_type=MediaType.TEXT,
        output_type=MediaType.TEXT,
        description="Fast and efficient for simple tasks",
        capabilities=["text-generation", "reasoning"]
    ),

    # === TTS Models (Text -> Audio) ===
    ModelResponse(
        id="tts-1",
        name="OpenAI TTS-1",
        provider="OpenAI",
        input_type=MediaType.TEXT,
        output_type=MediaType.AUDIO,
        description="OpenAI's text-to-speech model",
        capabilities=["text-to-speech"]
    ),
    ModelResponse(
        id="eleven_v3",
        name="ElevenLabs V3",
        provider="ElevenLabs",
        input_type=MediaType.TEXT,
        output_type=MediaType.AUDIO,
        description="Latest ElevenLabs voice synthesis model",
        capabilities=["text-to-speech", "voice-cloning"]
    ),
    ModelResponse(
        id="eleven_multilingual_v2",
        name="ElevenLabs Multilingual V2",
        provider="ElevenLabs",
        input_type=MediaType.TEXT,
        output_type=MediaType.AUDIO,
        description="Multilingual voice synthesis with support for many languages",
        capabilities=["text-to-speech", "multilingual", "voice-cloning"]
    ),
    ModelResponse(
        id="aura-2-thalia-en",
        name="Deepgram Aura 2 Thalia",
        provider="Deepgram",
        input_type=MediaType.TEXT,
        output_type=MediaType.AUDIO,
        description="Deepgram's natural-sounding English voice",
        capabilities=["text-to-speech"]
    ),
    ModelResponse(
        id="sonic-3",
        name="Cartesia Sonic 3",
        provider="Cartesia",
        input_type=MediaType.TEXT,
        output_type=MediaType.AUDIO,
        description="Fast and high-quality voice synthesis",
        capabilities=["text-to-speech", "real-time"]
    ),
    ModelResponse(
        id="suno-bark",
        name="Suno Bark",
        provider="Replicate",
        input_type=MediaType.TEXT,
        output_type=MediaType.AUDIO,
        description="Open-source text-to-audio model",
        capabilities=["text-to-speech", "music", "sound-effects"]
    ),
    ModelResponse(
        id="sesame-csm-1b",
        name="Sesame CSM 1B",
        provider="Replicate",
        input_type=MediaType.TEXT,
        output_type=MediaType.AUDIO,
        description="Compact speech synthesis model",
        capabilities=["text-to-speech"]
    ),
    ModelResponse(
        id="minimax-speech-02",
        name="MiniMax Speech 02",
        provider="Replicate",
        input_type=MediaType.TEXT,
        output_type=MediaType.AUDIO,
        description="High-quality Chinese and English speech synthesis",
        capabilities=["text-to-speech", "multilingual"]
    ),
    ModelResponse(
        id="orpheus-tts",
        name="Orpheus TTS",
        provider="HuggingFace",
        input_type=MediaType.TEXT,
        output_type=MediaType.AUDIO,
        description="Open-source neural text-to-speech",
        capabilities=["text-to-speech"]
    ),
    ModelResponse(
        id="kokoro-82m",
        name="Kokoro 82M",
        provider="Kokoro",
        input_type=MediaType.TEXT,
        output_type=MediaType.AUDIO,
        description="Lightweight and efficient TTS model",
        capabilities=["text-to-speech"]
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


def get_models_by_type(input_type: MediaType = None, output_type: MediaType = None) -> list[ModelResponse]:
    """Get all models filtered by input and/or output type."""
    models = AVAILABLE_MODELS
    if input_type:
        models = [m for m in models if m.input_type == input_type]
    if output_type:
        models = [m for m in models if m.output_type == output_type]
    return models

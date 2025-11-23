from enum import Enum
from typing import Optional
from pydantic import BaseModel


class VoteOutcome(Enum):
    A = "A"
    B = "B"
    TIE = "tie"
    BOTH_BAD = "both_bad"


class LLMModelName(str, Enum):
    """Enum for all available LLM model names with their providers."""

    # OpenAI models
    GPT_4 = "gpt-4"
    GPT_4_TURBO = "gpt-4-turbo"
    GPT_3_5_TURBO = "gpt-3.5-turbo"

    # Anthropic models
    CLAUDE_3_5_SONNET = "claude-3-5-sonnet"
    CLAUDE_3_OPUS = "claude-3-opus"
    CLAUDE_3_HAIKU = "claude-3-haiku"

    # Meta models
    LLAMA_3_70B = "llama-3-70b"
    LLAMA_3_8B = "llama-3-8b"

    # Google models
    GEMINI_PRO = "gemini-pro"
    GEMINI_ULTRA = "gemini-ultra"
    PALM_2 = "palm-2"

    # Mistral AI models
    MISTRAL_LARGE = "mistral-large"
    MISTRAL_MEDIUM = "mistral-medium"
    MISTRAL_SMALL = "mistral-small"


class ModelInfo(BaseModel):
    """Information about an available model."""
    id: str
    name: str
    provider: str
    description: Optional[str] = None
    capabilities: Optional[list[str]] = None


class TTSModelName(str, Enum):
    """Enum for all available TTS model names with their providers."""

    # OpenAI models
    TTS_1 = "tts-1"

    # ElevenLabs models
    ELEVEN_V3 = "eleven_v3"
    ELEVEN_MULTILINGUAL_V2 = "eleven_multilingual_v2"

    # Deepgram models
    AURA_2_THALIA_EN = "aura-2-thalia-en"

    # Cartesia models
    SONIC_3 = "sonic-3"

    # Replicate models
    SUNO_BARK = "suno-bark"
    SESAME_CSM_1B = "sesame-csm-1b"
    MINIMAX_SPEECH_02 = "minimax-speech-02"
    
    # Gradio/HuggingFace models
    ORPHEUS_TTS = "orpheus-tts"
    
    # Kokoro
    KOKORO_82M = "kokoro-82m"

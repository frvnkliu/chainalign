"""
Pytest configuration for the server tests.
This file ensures proper Python path setup for imports.
"""
import sys
from pathlib import Path

# Add server directory to Python path
server_dir = Path(__file__).parent
if str(server_dir) not in sys.path:
    sys.path.insert(0, str(server_dir))

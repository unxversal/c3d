# C3D - AI-Powered CAD Generation CLI

A command-line interface that generates CAD objects from natural language descriptions using AI, powered by Ollama and CADQuery.

## Prerequisites

Before installing C3D, ensure you have the following installed:

### Required Dependencies

1. **Node.js** (>= 16)
   - Download from [nodejs.org](https://nodejs.org/)
   - Or install via package manager (brew, apt, etc.)

2. **Ollama** (AI model runtime)
   - Download from [ollama.ai](https://ollama.ai/)
   - Make sure Ollama is running: `ollama serve`

3. **uv** (Python package manager)
   - Install from [docs.astral.sh/uv](https://docs.astral.sh/uv/getting-started/installation/)
   - Or via pip: `pip install uv`

4. **Python** (>= 3.8)
   - Included with uv installation or install separately
   - Make sure `python3` command is available in your PATH

## Installation

### Global Installation (Recommended)

```sh
npm install --global c3d
```

### First-time Setup

After installation, the CLI will automatically download the C3D AI model on first use:

```sh
# This will download the model automatically (may take several minutes)
c3d generate "a simple cube"
```

**Note:** The C3D model (`joshuaokolo/C3Dv0`) is approximately 4-8GB and will be downloaded via Ollama on first use.

### Local Development

```sh
git clone <repository>
cd cli/c3d
npm install
npm run build
```

## Usage

### AI-Powered CAD Generation

Generate CAD objects directly from text descriptions:

```sh
# Generate a simple object
c3d generate "a gear with 20 teeth"

# Generate with custom retry count
c3d generate "a phone case for iPhone 15 Pro" --retries=3

# Complex objects
c3d generate "a parametric bracket with mounting holes for M6 bolts"
```

**How it works:**
1. C3D uses a two-stage AI process for better results
2. First, it generates a detailed technical description from your prompt
3. Then, it creates CADQuery code based on that description
4. The code is tested and retried up to 5 times (configurable) until it produces a valid STL file

### Server Management

```sh
# Start the CADQuery rendering server
c3d server start

# Check server status
c3d server status

# Stop the server
c3d server stop

# Start server on custom port
c3d server start --port=9000
```

### Manual CADQuery Script Rendering

```sh
# Render a CADQuery script (auto-starts server if needed)
c3d render my-model.py

# Render with specific output filename
c3d render my-model.py --output=custom-name.stl

# Render on custom port
c3d render my-model.py --port=9000
```

### Configuration

```sh
# View current configuration
c3d config

# Remove AI model to free up disk space (~4-8GB)
c3d deload
```

### Examples

```sh
# AI generation examples
c3d generate "a simple box 50x30x20mm"
c3d generate "a hex nut for M8 bolt"
c3d generate "a smartphone stand with 45 degree angle"

# Model management
c3d deload  # Remove model to free up ~4-8GB

# Traditional workflow
c3d server start
c3d render examples/box.py --output=my-box.stl

# Mixed workflow
c3d generate "a gear" --output=my-gear.stl
```

## AI Model Information

C3D uses the `joshuaokolo/C3Dv0` model, specifically trained for CADQuery code generation:

- **Model**: Fine-tuned for mechanical design and CADQuery syntax
- **Size**: Approximately 4-8GB download
- **Two-stage process**: Description → Code generation for better accuracy
- **Structured outputs**: Uses JSON schemas for reliable formatting
- **Retry logic**: Automatically retries failed generations up to 5 times

### Model Management

```sh
# Model is downloaded automatically on first use
c3d generate "test cube"

# Remove model to free up disk space
c3d deload

# Model will be re-downloaded automatically when needed again
c3d generate "another object"
```

## CADQuery Script Format

For manual script rendering, your Python scripts should use CADQuery and export files:

```python
import cadquery as cq

# Create a simple box
result = cq.Workplane("XY").box(10, 10, 10)

# Export to STL
cq.exporters.export(result, "output.stl")
```

**AI-Generated Code**: When using `c3d generate`, the AI automatically creates properly structured CADQuery code following best practices.

## Supported Output Formats

- `.stl` - Stereolithography format
- `.step` - Standard for Exchange of Product Data
- `.3mf` - 3D Manufacturing Format
- `.stp` - STEP format variant
- `.obj` - Wavefront OBJ format

## Development

```sh
# Watch mode for development
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Troubleshooting

### AI Generation Issues

1. **Model not found**: The C3D model will be downloaded automatically on first use
2. **Ollama not running**: Make sure Ollama is running with `ollama serve`
3. **Generation failures**: Increase retry count with `--retries=10`
4. **Poor results**: Be more specific in your descriptions
5. **Disk space**: Use `c3d deload` to remove the model and free up ~4-8GB

### Server Won't Start

1. Ensure uv is installed: `uv --version`
2. Check Python installation: `python3 --version`
3. Verify CADQuery dependencies are available in the server environment

### Path Issues

- Make sure `uv`, `python3`, and `ollama` are in your system PATH
- On Windows, you may need to use `python` instead of `python3`

### Port Conflicts

- Use `--port` flag to specify different port if 8765 is in use
- Check what's running on the port: `lsof -i :8765` (macOS/Linux)

### Ollama Connection Issues

- Ensure Ollama is running: `ollama serve`
- Check Ollama is accessible: `ollama list`
- Default host is `127.0.0.1:11434`
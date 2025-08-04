# C3D - AI-Powered 3D CAD Generator

**Compute 3D Lab** - Generate 3D CAD models from natural language descriptions using AI.

## ✨ Features

- 🤖 **AI Generation**: Create CAD models from text descriptions
- 🌐 **3D Web Viewer**: Interactive React Three Fiber visualization with full mouse controls
- 🖥️ **Modern CLI**: Beautiful terminal interface with ASCII art and animations
- 📱 **Screen Testing**: Interactive UI components for development and testing
- 🔄 **Real-time Updates**: Live collaboration features (interactive mode)
- 📦 **Single Package**: Complete solution bundled into one npm install

## 🚀 Quick Start

### Installation
```bash
npm install -g c3d
```

### Generate Your First Model
```bash
c3d generate "a simple gear with 12 teeth"
```

The 3D viewer will automatically open in your browser with the generated model!

## 📋 Commands

### Core Commands
- `c3d generate <description>` - Generate CAD from text
- `c3d viewer` - Launch 3D web interface
- `c3d server start/stop/status` - Manage backend server
- `c3d config` - View configuration settings
- `c3d render <script.py>` - Render Python CADQuery scripts

### Development & Testing
- `c3d ui` - Launch UI development playground
- `c3d ui static` - ASCII layout slideshow
- `c3d ui shimmer` - Animation effects showcase
- `c3d ui screen <name>` - Test specific screen components
  - Available: `home`, `generation`, `server`, `config`, `render`, `model`, `error`, `interactive`

### Model Management
- `c3d deload` - Remove AI model from local storage

## 🛠️ Options

- `--port <number>` - Server port (default: 8765)
- `--retries <number>` - Max generation retries (default: 5)
- `--no-viewer` - Disable auto-opening web viewer
- `--output <filename>` - Custom output filename

## 🎯 Examples

```bash
# Generate and view a model
c3d generate "a phone case for iPhone 15"

# Generate without opening viewer
c3d generate "a simple bracket" --no-viewer

# Custom retries and port
c3d generate "a complex gear assembly" --retries=10 --port=9000

# Test interactive features
c3d ui screen interactive

# Launch just the viewer
c3d viewer
```

## 🏗️ Architecture

- **CLI**: Node.js/TypeScript with Ink for terminal UI
- **Frontend**: React + Three.js for 3D rendering
- **Backend**: Python FastAPI with CADQuery engine
- **AI**: Ollama integration for natural language processing

## 📁 Project Structure

```
c3d/
├── cli/c3d/           # Main CLI application
├── frontend/          # React 3D viewer
└── cli/c3d/server/    # Python FastAPI backend
```

## 🔧 Development

See individual README files in each directory for detailed development instructions:
- [CLI Development](cli/c3d/readme.md)
- [Frontend Development](frontend/README.md)

## 📄 License

MIT License - Feel free to use and modify!
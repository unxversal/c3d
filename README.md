# C3D - AI-Powered 3D CAD Generator

**Compute 3D Lab** - Generate 3D CAD models from natural language descriptions using AI.

## ✨ Features

- 🤖 **AI Generation**: Create CAD models from text descriptions
- 🌐 **3D Web Viewer**: Interactive React Three Fiber visualization with full mouse controls
- 🖥️ **Interactive CLI**: Beautiful terminal interface with professional screens and dynamic animations
- 📱 **Rich UI Screens**: All commands use branded interactive interfaces with real-time status
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
- `c3d generate <description>` - Generate CAD from text with interactive progress screen
- `c3d viewer` - Launch 3D web interface
- `c3d server start/stop/status` - Manage backend server with interactive status screens
- `c3d config` - Interactive configuration editor with arrow key navigation
- `c3d render <script.py>` - Render Python CADQuery scripts with real-time feedback
- `c3d list` - Browse and open local STL files with arrow key navigation

### Development & Testing
- `c3d ui` - Launch UI development playground
- `c3d ui static` - ASCII layout slideshow
- `c3d ui shimmer` - Animation effects showcase
- `c3d ui screen <name>` - Test specific screen components
  - Available: `home`, `generation`, `server`, `config`, `render`, `deload`, `error`, `interactive`

### Model Management
- `c3d deload` - Remove AI model from local storage

## 🛠️ Options

- `--port <number>` - Server port (default: 8765)
- `--retries <number>` - Max generation retries (default: 5)
- `--no-viewer` - Disable auto-opening web viewer
- `--output <filename>` - Custom output filename

## 🎯 Examples

```bash
# Generate with interactive progress screen and auto-open viewer
c3d generate "a phone case for iPhone 15"

# Generate with interactive progress but skip viewer
c3d generate "a simple bracket" --no-viewer

# Interactive generation with custom settings
c3d generate "a complex gear assembly" --retries=10 --port=9000

# Browse local STL files with arrow key navigation
c3d list

# Interactive server management
c3d server status

# Interactive configuration editor
c3d config

# Test UI screens
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
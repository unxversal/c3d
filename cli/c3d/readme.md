# C3D CLI - AI-Powered CAD Generation

A powerful command-line interface that generates 3D CAD models from natural language descriptions using AI, with an integrated web-based 3D viewer.

## ✨ Key Features

- 🤖 **AI Generation**: Create CAD models from natural language using Ollama
- 🌐 **Integrated 3D Viewer**: React Three Fiber web interface with interactive controls
- 🖥️ **Interactive CLI**: Beautiful terminal interface with real-time status screens and animations
- 📱 **Professional UI**: Rich interactive screens for all commands with dynamic color schemes
- 🔄 **Auto-Launch**: Generated models open automatically in 3D viewer
- 📦 **Complete Package**: Backend, frontend, and CLI bundled together

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

## 🚀 Basic Usage

### Generate a CAD Model

```sh
c3d generate "a simple cube"
```

This will:
1. Start the Python backend server automatically
2. Generate a CAD model using AI
3. **Auto-open the 3D viewer** in your browser
4. Display the model with interactive controls

### Skip Auto-Viewer
```sh
c3d generate "a gear with 12 teeth" --no-viewer
```

### Launch Just the Viewer
```sh
c3d viewer
```

### Additional Examples

```sh
# Generate a gear with custom settings
c3d generate "a gear with 12 teeth" --retries=10 --port=9000

# Generate a phone case
c3d generate "a phone case for iPhone 14"

# Generate without auto-opening viewer
c3d generate "a complex bracket" --no-viewer
```

## 📋 All Commands

### Core Commands
- `c3d generate <description>` - Generate CAD from text description
- `c3d viewer` - Launch 3D web interface
- `c3d server start/stop/status` - Manage Python backend server
- `c3d config` - Interactive configuration editor
- `c3d render <script.py>` - Render Python CADQuery scripts
- `c3d deload` - Remove C3D AI model from local storage
- `c3d list` - Browse and open local STL files from directories

### Development & Testing
- `c3d ui` - Launch UI development playground
- `c3d ui static` - ASCII layout slideshow (dolphin + banner)
- `c3d ui shimmer` - Animation effects showcase
- `c3d ui screen <n>` - Test interactive screen components used by commands

### Interactive Screen Components
All main commands now use beautiful interactive screens instead of plain text output:

```sh
c3d ui screen home          # Home/welcome screen (demo)
c3d ui screen generation    # Model generation interface (used by 'generate')
c3d ui screen server        # Server management interface (used by 'server')
c3d ui screen config        # Configuration editor (used by 'config')
c3d ui screen render        # Script rendering interface (used by 'render')
c3d ui screen deload        # Model deloader interface (used by 'deload')
c3d ui screen error         # Error handling screen (used for errors)
c3d ui screen interactive   # Interactive/collaboration features (demo)
```

**Note:** Each command (`generate`, `server`, `config`, etc.) now launches its corresponding interactive screen with real-time status updates, progress indicators, and professional UI styling.

## 🛠️ CLI Options

### Global Options
- `--port <number>` - Server port (default: 8765, auto-finds available)
- `--retries <number>` - Max generation retries (default: 5)
- `--output <filename>` - Custom output filename for render command
- `--no-viewer` - Disable auto-opening web viewer after generation

### Examples
```sh
# Custom port and retries
c3d generate "a bracket" --port=9000 --retries=10

# Render script with custom output
c3d render my_model.py --output=custom_name.stl

# Generate without auto-viewer
c3d generate "a gear" --no-viewer
```

## 🖥️ CLI Interface & Interactive Experience

### Interactive Command Screens

C3D features beautiful, professional interactive screens for all main commands:

```sh
# Launch generation with real-time progress tracking
c3d generate "a gear with 12 teeth"

# Interactive server management with status indicators
c3d server start

# Browse local STL files with arrow key navigation
c3d list

# Interactive configuration editor
c3d config
```

Each screen includes:
- **Dynamic Color Schemes**: Randomly selected blue, green, orange themes
- **Real-time Status Updates**: Progress bars and shimmer effects
- **Professional Branding**: ASCII dolphin art and bordered layouts
- **Interactive Controls**: Arrow key navigation, live editing
- **Error Handling**: Always red-colored error screens override random themes

### UI Development Playground

C3D includes extensive UI development tools for testing and creating interface components:

```sh
# Launch the main UI playground
c3d ui

# Test ASCII art layouts (dolphin + banner slideshow)
c3d ui static

# Showcase animation effects (shimmer, pulse, ripple, wave)
c3d ui shimmer

# Test specific application screens
c3d ui screen <n>
```

### Animation Features

The CLI includes several professional animation effects:
- **Wave Ripple**: Animated text waves
- **Color Shimmer**: Dynamic color cycling
- **Pulse Effect**: Breathing text animation
- **Character Shimmer**: Individual character effects
- **Letter Animation**: Fade-in/fade-out with noise
- **Sliding Highlight**: Moving spotlight effect
- **Flash Animation**: Strobe-like effects
- **Static Shimmer**: Random flicker effects

## 🌐 3D Web Viewer

The integrated web viewer features:
- **Interactive Controls**: Rotate, zoom, pan with mouse
- **React Three Fiber**: Modern 3D rendering with Three.js
- **Dark Theme**: Professional CAD tool aesthetic
- **Auto-Integration**: Opens automatically after generation
- **Upload Support**: STL file testing (development mode)
- **Responsive Design**: Works on desktop and mobile

### Viewer Controls
- **Left Mouse Drag**: Rotate camera around model
- **Right Mouse Drag**: Pan camera
- **Mouse Wheel**: Zoom in/out
- **Control Panel**: Model info and generation settings

## 🔧 Development

### Local Development Setup

```sh
git clone <repository>
cd cli/c3d
npm install
npm run build
```

### Project Structure
```
cli/c3d/
├── source/                 # TypeScript source files
│   ├── app.tsx            # Main CLI application
│   ├── cli.tsx            # Command parsing and help
│   ├── components/        # Reusable UI components
│   ├── screens/           # Interactive screen components
│   ├── dolphins.ts        # ASCII art assets and color schemes
│   └── server/            # Python FastAPI backend
├── frontend-dist/         # Built React frontend (generated)
├── dist/                  # Compiled TypeScript (generated)
└── package.json
```

### Build Process
```sh
npm run build              # Build complete project
npm run build:frontend     # Build React frontend only
npm run build:cli          # Build CLI only
tsc                        # TypeScript compilation
```

### Testing
```sh
# Test CLI locally
node dist/cli.js --help

# Test specific commands
node dist/cli.js generate "test model"
node dist/cli.js ui screen home
```

## 🔌 Backend Integration

### Python FastAPI Server
- **Auto-Management**: CLI starts/stops server automatically
- **CADQuery Engine**: Generates STL files from Python scripts
- **Static Serving**: Hosts the React frontend and generated files
- **API Endpoints**: RESTful interface for generation and file access

### Server Commands
```sh
c3d server start          # Start Python backend (interactive screen)
c3d server stop           # Stop Python backend (interactive screen)
c3d server status         # Check server status (interactive screen)
```

### Configuration

Interactive configuration editor:
```sh
c3d config               # Launch interactive editor with arrow keys
```

Default configuration includes:
- **AI Model**: `joshuaokolo/C3Dv0` (Ollama)
- **Server Port**: 8765 (auto-detects available ports)
- **Max Retries**: 5 attempts for generation
- **Temperature**: 0.7 for AI model creativity
- **Host**: `127.0.0.1:11434` for Ollama connection
- **Server Timeout**: 45 seconds for startup
- **Stop Server on Quit**: Configurable option to kill server when exiting CLI

## 🔍 Troubleshooting

### Common Issues

1. **Ollama not running**
   ```sh
   ollama serve
   ```

2. **Model not installed**
   ```sh
   c3d generate "test"  # Will auto-download model
   ```

3. **Port conflicts**
   ```sh
   c3d generate "test" --port=9000
   ```

4. **Python/uv issues**
   ```sh
   # Check Python availability
   python3 --version
   uv --version
   ```

### Model Management
```sh
# Remove model to free disk space (4-8GB) - interactive screen
c3d deload

# Check model status
ollama list | grep C3Dv0
```

### Debug Mode
Enable verbose logging by setting environment variable:
```sh
DEBUG=1 c3d generate "test model"
```

## 📦 Distribution & Packaging

The CLI packages everything needed for distribution:
- TypeScript CLI compiled to JavaScript
- React frontend bundled and minified
- Python backend with dependencies
- ASCII art and static assets

Single-command installation:
```sh
npm install -g c3d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run build`
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Test UI components with `c3d ui screen <n>`
- Ensure ASCII art alignment in terminal
- Maintain dark theme consistency
- Add comprehensive error handling
- Use interactive screens for new commands

## 📄 License

MIT License

## 🔗 Related Projects

- [Ollama](https://ollama.ai/) - AI model runtime
- [CADQuery](https://cadquery.readthedocs.io/) - Python CAD library
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - React 3D rendering
- [Ink](https://github.com/vadimdemedes/ink) - React for CLI interfaces

---

**UNXVERSAL LABS C3D** - Transforming ideas into 3D reality through AI ✨
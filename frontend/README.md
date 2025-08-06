# C3D Frontend - 3D Model Viewer

Modern React-based 3D CAD model viewer built with Three.js and React Three Fiber.

## ✨ Features

- 🎮 **Interactive 3D Viewer**: Full mouse controls (rotate, zoom, pan)
- 📱 **Responsive Design**: Works on desktop and mobile
- 🎨 **Modern UI**: Dark theme with glass-morphism control panel
- 📂 **File Upload**: STL file support with drag & drop (development mode)
- 🚀 **Performance**: Optimized rendering with Three.js
- 🔗 **CLI Integration**: Auto-opens from C3D CLI with generated models

## 🛠️ Technology Stack

- **React 18** with TypeScript
- **React Three Fiber** (@react-three/fiber) - React renderer for Three.js
- **React Three Drei** (@react-three/drei) - Helper components and controls
- **Three.js** - 3D graphics library
- **Vite** - Fast build tool and dev server
- **Lucide React** - Modern icon library

## 🚀 Quick Start

The frontend is included with the main C3D CLI package:
```bash
npm install -g @unxversallabs/c3d
c3d viewer  # Launches the 3D viewer
```

## 🚀 Development

### Prerequisites
```bash
node >= 18
npm >= 8
```

### Setup
```bash
cd frontend
npm install
```

### Development Server
```bash
npm run dev
```
Opens on `http://localhost:5173`

### Build for Production
```bash
npm run build
```

## 🎯 Usage Modes

### 1. CLI Integration (Automatic)
When you run `c3d generate`, the frontend automatically opens with:
- Pre-loaded generated model
- View mode (shows original prompt)
- Direct model viewing

### 2. Development Mode
Run `npm run dev` for debugging with:
- Upload button in bottom-left corner
- File upload for testing STL files
- Hot reload for development

### 3. Interactive Mode
Access via URL parameters:
```
http://localhost:5173?mode=interactive
```
Enables:
- Upload controls
- Collaboration features
- Advanced debugging tools

## 📱 Controls

### 3D Viewer Controls
- **Left Mouse Drag**: Rotate camera around model
- **Right Mouse Drag**: Pan camera
- **Mouse Wheel**: Zoom in/out
- **Reset View Button**: Return to default camera position

### UI Controls
- **Generate New Model**: Return to input mode
- **Upload STL**: Load custom models (dev mode only)
- **Status Panel**: View generation progress and model info

## 🎨 UI Components

### Control Panel (Bottom Right)
- Glass-morphism design with blur effects
- Model information and statistics
- Generation controls and status
- Responsive on mobile devices

### Upload Button (Bottom Left, Dev Only)
- STL file upload for testing
- Drag & drop support
- Validation and error handling

## 📡 API Integration

### Backend Communication
The frontend communicates with the FastAPI backend:
- `GET /files/<filename>` - Download generated STL files
- `POST /api/generate` - Generate new models
- Static file serving for assets

### URL Parameters
- `model=<filename>` - Auto-load specific model
- `from=cli` - View mode for CLI-generated models
- `prompt=<text>` - Display original generation prompt
- `mode=interactive` - Enable interactive features

## 🔧 Development Features

### File Upload (Development Only)
```typescript
// Automatically enabled in development
if (import.meta.env.DEV) {
  setShowUpload(true);
}
```

### Error Handling
- Graceful STL loading failures
- Network error recovery
- User-friendly error messages

### Performance
- Lazy loading of 3D components
- Optimized Three.js rendering
- Efficient memory management

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── STLViewer.tsx       # Main 3D viewer component
│   │   └── STLViewer.module.css
│   ├── services/
│   │   └── api.ts              # Backend API client
│   ├── App.tsx                 # Main application
│   ├── App.module.css          # Application styles
│   └── main.tsx               # React entry point
├── public/                     # Static assets
├── dist/                      # Built assets (generated)
└── package.json
```

## 🎨 Styling

- **CSS Modules** for component-scoped styles
- **Dark Theme** with professional CAD tool aesthetic
- **Glass-morphism** effects for modern UI
- **Responsive Design** for mobile compatibility

## 🚀 Build Integration

The frontend is automatically built and bundled with the CLI:
```bash
# From cli/c3d directory
npm run build:frontend  # Builds and copies to cli/c3d/frontend-dist
```

This ensures single-package distribution via `npm install -g c3d`.

## 🐛 Debugging

### Common Issues

1. **Model not loading**: Check browser console for network errors
2. **Controls not working**: Ensure Three.js properly initialized
3. **Upload button missing**: Only visible in development mode

### Development Tools
- React DevTools for component debugging
- Three.js Inspector for 3D scene inspection
- Browser console for network and error logging

## 📄 License

MIT License - Part of the C3D project
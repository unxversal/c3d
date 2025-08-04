# C3D Backend Server - FastAPI CADQuery Engine

Python FastAPI backend that powers the C3D CLI's CAD generation capabilities.

## 🚀 Overview

This FastAPI server provides:
- **CAD Generation**: Converts AI-generated Python scripts to STL files
- **File Serving**: Hosts generated models and the React frontend
- **REST API**: Endpoints for generation, file access, and status
- **Auto-Management**: Controlled by the C3D CLI automatically

## 🛠️ Technology Stack

- **FastAPI** - Modern Python web framework
- **CADQuery** - Python CAD library for 3D modeling
- **uvicorn** - ASGI server for FastAPI
- **uv** - Fast Python package manager
- **CORS** - Cross-origin resource sharing for frontend

## 📁 Project Structure

```
server/
├── main.py              # FastAPI application entry point
├── requirements.txt     # Python dependencies (legacy)
├── pyproject.toml      # uv package configuration
└── README.md           # This file
```

## 🔌 API Endpoints

### File Serving
- `GET /` - Serve React frontend (index.html)
- `GET /{path:path}` - SPA routing for React frontend
- `GET /files/{filename}` - Download generated STL/STEP files

### CAD Generation
- `POST /api/generate` - Generate CAD from Python script

#### Request Format
```json
{
  "script": "import cadquery as cq\nresult = cq.Workplane().box(1,1,1)",
  "filename": "output.stl"
}
```

#### Response Format
```json
{
  "success": true,
  "filename": "output.stl",
  "message": "CAD model generated successfully"
}
```

## 🏃 Running the Server

### Automatic (via CLI)
The C3D CLI manages the server automatically:
```bash
c3d server start    # Start server
c3d server stop     # Stop server  
c3d server status   # Check status
```

### Manual Development
```bash
cd cli/c3d/server
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8765
```

### Docker (Future)
```bash
# TODO: Add Docker support
docker build -t c3d-server .
docker run -p 8765:8765 c3d-server
```

## 🔧 Configuration

### Environment Variables
- `PORT` - Server port (default: 8765)
- `HOST` - Server host (default: 0.0.0.0)
- `CORS_ORIGINS` - Allowed CORS origins

### Dependencies

#### Core Dependencies (pyproject.toml)
- `fastapi` - Web framework
- `uvicorn[standard]` - ASGI server
- `cadquery` - CAD modeling library
- `python-multipart` - File upload support

#### System Requirements
- Python >= 3.8
- OpenGL support for CADQuery
- Write permissions for temporary files

## 📂 File Management

### Generated Files
- **Location**: `/tmp/c3d_output/` (temporary directory)
- **Formats**: STL, STEP files
- **Cleanup**: Automatic cleanup after serving

### Frontend Assets
- **Location**: `../frontend-dist/` (built React app)
- **Serving**: Static files served at root path
- **SPA**: Single-page application routing

## 🔍 Error Handling

### CADQuery Errors
```python
try:
    # CADQuery operations
    result = cq.Workplane().box(1,1,1)
except Exception as e:
    return {"success": False, "error": str(e)}
```

### File System Errors
- Temporary directory creation
- File write permissions
- Disk space validation

### Network Errors
- Port binding failures
- CORS configuration issues
- Client disconnections

## 🛡️ Security

### File Access
- Only serves files from designated output directory
- Path traversal protection
- File type validation (STL/STEP only)

### CORS Configuration
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Input Validation
- Python script sanitization
- Filename validation
- Request size limits

## 🔧 Development

### Setup Development Environment
```bash
cd cli/c3d/server
uv venv
source .venv/bin/activate  # or `.venv\Scripts\activate` on Windows
uv pip install -e .
```

### Running Tests
```bash
# TODO: Add test suite
pytest tests/
```

### Debug Mode
```bash
uv run uvicorn main:app --reload --log-level debug
```

### API Testing
```bash
# Test generation endpoint
curl -X POST http://localhost:8765/api/generate \
  -H "Content-Type: application/json" \
  -d '{"script": "import cadquery as cq\nresult = cq.Workplane().box(1,1,1)", "filename": "test.stl"}'

# Test file download
curl http://localhost:8765/files/test.stl --output test.stl
```

## 🔄 Integration with CLI

### Automatic Server Management
The CLI automatically:
1. Checks if server is running on configured port
2. Starts server if needed before generation
3. Monitors server health during operations
4. Provides server status commands

### Communication Flow
```
CLI → POST /api/generate → CADQuery → STL File → Frontend Display
```

### Process Management
- Server runs as background process
- PID tracking for stop/start operations
- Graceful shutdown handling
- Port conflict resolution

## 📊 Performance

### Optimization
- Async/await for non-blocking operations
- Efficient file streaming
- Memory management for large models
- Connection pooling

### Monitoring
- Request logging
- Error tracking
- Performance metrics
- Resource usage monitoring

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   c3d server start --port=9000
   ```

2. **CADQuery Import Errors**
   ```bash
   uv pip install cadquery
   ```

3. **File Permission Errors**
   ```bash
   chmod +w /tmp/c3d_output/
   ```

4. **Frontend Not Loading**
   - Check `frontend-dist/` directory exists
   - Verify static file serving configuration

### Debug Logs
```bash
# Enable debug logging
DEBUG=1 c3d server start
```

### Health Check
```bash
curl http://localhost:8765/api/health
```

## 🚀 Deployment

### Production Considerations
- Use process manager (PM2, systemd)
- Configure reverse proxy (nginx)
- Set up SSL/TLS certificates
- Enable request rate limiting
- Configure log rotation

### Environment Setup
```bash
# Production environment
export PORT=8765
export HOST=0.0.0.0
export ENVIRONMENT=production
```

## 📄 License

MIT License - Part of the C3D project

## 🔗 Dependencies

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [CADQuery](https://cadquery.readthedocs.io/) - Python CAD library
- [uvicorn](https://www.uvicorn.org/) - Lightning-fast ASGI server
- [uv](https://docs.astral.sh/uv/) - Fast Python package manager
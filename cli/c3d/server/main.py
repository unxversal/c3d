# main.py
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pathlib import Path
import tempfile, subprocess, os, shutil, uuid, socket
import uvicorn

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve frontend static files
frontend_path = Path(__file__).parent.parent / "frontend-dist"
if frontend_path.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_path)), name="static")
    
    # Serve React app on root
    @app.get("/")
    async def serve_frontend():
        return FileResponse(str(frontend_path / "index.html"))
    
    # Catch-all for React Router (SPA routing)
    @app.get("/{path:path}")
    async def serve_frontend_routes(path: str):
        if path.startswith("api/") or path.startswith("files/"):
            raise HTTPException(404)
        return FileResponse(str(frontend_path / "index.html"))

# Serve generated CAD files
temp_files_dir = Path(tempfile.gettempdir())
app.mount("/files", StaticFiles(directory=str(temp_files_dir)), name="files")

class RenderRequest(BaseModel):
    script: str
    output_filename: str | None = None
    timeout_secs: int | None = 60

class GenerateRequest(BaseModel):
    prompt: str
    output_format: str = "stl"

@app.post("/api/render")
async def render_cadquery(req: RenderRequest):
    """Render CADQuery script to STL/STEP files"""
    workdir = Path(tempfile.mkdtemp(prefix="cadquery_"))
    try:
        script_path = workdir / "model.py"
        script_path.write_text(req.script)

        proc = subprocess.Popen(
            [shutil.which("python3") or "python3", str(script_path)],
            cwd=workdir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            env=os.environ.copy(),
        )
        try:
            stdout, stderr = proc.communicate(timeout=req.timeout_secs)
            if proc.returncode != 0:
                raise HTTPException(status_code=400, detail=f"Script failed: {stderr}")
            
            # Find generated files
            output_files = []
            for ext in [".stl", ".step", ".png"]:
                for file_path in workdir.glob(f"*{ext}"):
                    output_files.append(str(file_path))
            
            if not output_files:
                raise HTTPException(status_code=400, detail="No output files generated")
            
            return {
                "success": True,
                "output_paths": output_files, 
                "workdir": str(workdir)
            }
        except subprocess.TimeoutExpired:
            raise HTTPException(status_code=408, detail="Script execution timed out")
    finally:
        # Clean up temporary directory
        shutil.rmtree(workdir, ignore_errors=True)

@app.post("/api/generate")
async def generate_from_prompt(req: GenerateRequest):
    """Generate CAD from natural language prompt"""
    try:
        # This would integrate with your existing GenerationService
        # For now, return a mock response for testing
        output_filename = f"generated_{uuid.uuid4().hex[:8]}.stl"
        
        # TODO: Integrate with your CLI GenerationService logic here
        # result = await generation_service.generate_cad_from_text(req.prompt)
        
        return {
            "success": True,
            "output_path": output_filename,
            "message": f"Generated CAD from: {req.prompt}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/health")
async def health_check():
    """Check server health and frontend availability"""
    return {
        "status": "healthy", 
        "frontend_available": frontend_path.exists(),
        "api_version": "1.0.0"
    }

def find_available_port(start_port=8765):
    for port in range(start_port, start_port + 100):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('', port))
                return port
        except OSError:
            continue
    raise RuntimeError("No available ports found")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", find_available_port()))
    print(f"Starting C3D server on port {port}")
    print(f"Frontend available: {frontend_path.exists()}")
    if frontend_path.exists():
        print(f"🌐 Web viewer: http://localhost:{port}")
    print(f"📡 API: http://localhost:{port}/api")
    
    uvicorn.run(app, host="0.0.0.0", port=port)
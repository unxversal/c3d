# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pathlib import Path
import tempfile, subprocess, os, shutil, uuid, socket
import uvicorn

app = FastAPI()

class RenderRequest(BaseModel):
    script: str
    output_filename: str | None = None
    timeout_secs: int | None = 60

@app.post("/render")
async def render_cadquery(req: RenderRequest):
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
            stdout, stderr = proc.communicate(timeout=req.timeout_secs or 60)
        except subprocess.TimeoutExpired:
            proc.kill()
            raise HTTPException(status_code=504, detail="Script execution timed out")

        if proc.returncode != 0:
            raise HTTPException(
                status_code=400,
                detail={"message": "Script failed", "stdout": stdout, "stderr": stderr},
            )

        outputs = []
        for ext in ("*.stl", "*.step", "*.3mf", "*.stp", "*.obj"):
            outputs += [str(p.resolve()) for p in workdir.glob(f"**/{ext}")]
        if not outputs and req.output_filename:
            candidate = workdir / req.output_filename
            if candidate.exists():
                outputs = [str(candidate.resolve())]

        if not outputs:
            raise HTTPException(
                status_code=500,
                detail={"message": "No output file found", "stdout": stdout, "stderr": stderr},
            )

        return {"output_paths": outputs, "stdout": stdout, "stderr": stderr, "workdir": str(workdir)}
    finally:
        pass  # keep workdir for inspection; implement cleanup separately

def find_available_port(start_port: int = 8765, max_attempts: int = 100) -> int:
    """Find an available port starting from start_port."""
    for port in range(start_port, start_port + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.settimeout(1)
            result = sock.connect_ex(('localhost', port))
            if result != 0:  # Port is available
                return port
    raise RuntimeError(f"Could not find available port in range {start_port}-{start_port + max_attempts}")

if __name__ == "__main__":
    # Get port from environment or find available port
    default_port = int(os.environ.get("PORT", 8765))
    port = find_available_port(default_port)
    
    print(f"🚀 CADQuery server starting on port {port}")
    print(f"📖 API docs available at http://localhost:{port}/docs")
    
    uvicorn.run("main:app", host="0.0.0.0", port=port)

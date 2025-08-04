# CADQuery Rendering Service

A FastAPI-based web service for executing CADQuery scripts and generating 3D model files.

## Overview

This service provides a REST API endpoint that accepts Python CADQuery scripts, executes them in an isolated environment, and returns the generated 3D model files along with execution output.

## Features

- **Script Execution**: Execute CADQuery Python scripts in isolated temporary directories
- **Multiple Output Formats**: Supports common 3D file formats (STL, STEP, 3MF, STP, OBJ)
- **Timeout Protection**: Configurable script execution timeout (default: 60 seconds)
- **Comprehensive Output**: Returns file paths, stdout, stderr, and working directory information
- **Error Handling**: Proper HTTP error responses for timeouts and script failures

## API Endpoint

### POST `/render`

Executes a CADQuery script and returns generated 3D model files.

#### Request Body

```json
{
  "script": "string",                    // Required: Python CADQuery script to execute
  "output_filename": "string",           // Optional: Specific output filename to look for
  "timeout_secs": 60                     // Optional: Execution timeout in seconds (default: 60)
}
```

#### Response

**Success (200)**:
```json
{
  "output_paths": ["string"],            // Array of absolute paths to generated files
  "stdout": "string",                    // Script stdout output
  "stderr": "string",                    // Script stderr output  
  "workdir": "string"                    // Path to temporary working directory
}
```

**Error Responses**:
- `400`: Script execution failed
- `504`: Script execution timed out
- `500`: No output files found

## Usage

### Starting the Server

```bash
python main.py
```

The server will start on `http://0.0.0.0:8000`

### Example Request

```bash
curl -X POST "http://localhost:8000/render" \
  -H "Content-Type: application/json" \
  -d '{
    "script": "import cadquery as cq\nresult = cq.Workplane().box(1, 1, 1)\ncq.exporters.export(result, \"output.stl\")",
    "output_filename": "output.stl",
    "timeout_secs": 30
  }'
```

## Supported File Formats

The service automatically detects and returns files with these extensions:
- `.stl` - Stereolithography format
- `.step` - Standard for Exchange of Product Data
- `.3mf` - 3D Manufacturing Format  
- `.stp` - STEP format variant
- `.obj` - Wavefront OBJ format

## Requirements

- Python 3.x
- FastAPI
- Pydantic
- Uvicorn
- CADQuery (for script execution)

## Installation

```bash
# Install dependencies
pip install fastapi pydantic uvicorn cadquery

# Run the service
python main.py
```

## Notes

- Each script execution runs in an isolated temporary directory
- Working directories are preserved for inspection (cleanup handled separately)
- Scripts must generate output files in the working directory or subdirectories
- The service runs with a default timeout to prevent hanging processes

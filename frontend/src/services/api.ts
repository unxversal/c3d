import axios from 'axios';

const API_BASE = 'http://localhost:8765/api';

export interface GenerationRequest {
  prompt: string;
  output_format?: 'stl' | 'step' | 'png';
}

export interface GenerationResult {
  success: boolean;
  output_path?: string;
  message?: string;
  error?: string;
}

export interface RenderRequest {
  script: string;
  output_filename?: string;
  timeout_secs?: number;
}

export interface RenderResult {
  output_paths: string[];
  workdir: string;
  success: boolean;
  error?: string;
}

export class C3DApi {
  // Generate CAD from text prompt
  static async generateFromPrompt(prompt: string): Promise<GenerationResult> {
    try {
      const response = await axios.post(`${API_BASE}/generate`, {
        prompt,
        output_format: 'stl'
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Generation failed'
      };
    }
  }

  // Render CADQuery script
  static async renderScript(script: string, filename?: string): Promise<RenderResult> {
    try {
      const response = await axios.post(`${API_BASE}/render`, {
        script,
        output_filename: filename,
        timeout_secs: 60
      });
      return response.data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Render failed');
    }
  }

  // Download STL file as ArrayBuffer
  static async downloadSTL(filePath: string): Promise<ArrayBuffer> {
    const response = await axios.get(`http://localhost:8765/files/${filePath}`, {
      responseType: 'arraybuffer'
    });
    return response.data;
  }

  // Get file URL for direct access
  static getFileUrl(filePath: string): string {
    return `http://localhost:8765/files/${filePath}`;
  }

  // Check server health
  static async checkHealth(): Promise<{ status: string; frontend_available: boolean }> {
    try {
      const response = await axios.get(`${API_BASE}/health`);
      return response.data;
    } catch (error) {
      return { status: 'offline', frontend_available: false };
    }
  }
}
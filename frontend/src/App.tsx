import { useState, useEffect } from 'react';
import { STLViewer } from './components/STLViewer';
import { C3DApi } from './services/api';
import type { GenerationResult } from './services/api';
import { MessageSquare, Sparkles, Box } from 'lucide-react';
import styles from './App.module.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [stlData, setStlData] = useState<ArrayBuffer | null>(null);
  const [viewMode, setViewMode] = useState(false); // View mode when opened from CLI
  const [originalPrompt, setOriginalPrompt] = useState(''); // Store the original prompt

  // Check URL params for auto-loading models
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const modelFile = urlParams.get('model');
    const promptParam = urlParams.get('prompt');
    const fromCLI = urlParams.get('from') === 'cli';
    
    if (modelFile && fromCLI) {
      // View mode - opened from CLI with generated model
      setViewMode(true);
      if (promptParam) {
        setOriginalPrompt(decodeURIComponent(promptParam));
        setPrompt(''); // Clear input in view mode
      }
      loadModelFromServer(modelFile);
    } else if (modelFile) {
      // Regular mode - direct link to model
      loadModelFromServer(modelFile);
      if (promptParam) {
        setPrompt(decodeURIComponent(promptParam));
      }
    }
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setResult(null);
    setStlData(null);

    try {
      const response = await C3DApi.generateFromPrompt(prompt);
      setResult(response);
      
      if (response.success && response.output_path) {
        // Load the generated STL file
        const stlBuffer = await C3DApi.downloadSTL(response.output_path);
        setStlData(stlBuffer);
      }
    } catch (error) {
      setResult({
        success: false,
        error: `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const loadModelFromServer = async (fileName: string) => {
    try {
      const stlBuffer = await C3DApi.downloadSTL(fileName);
      setStlData(stlBuffer);
      setResult({
        success: true,
        output_path: fileName,
        message: `Loaded ${fileName}`
      });
    } catch (error) {
      setResult({
        success: false,
        error: `Failed to load ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  return (
    <div className={styles.app}>
      {/* Full-screen 3D viewer */}
      <div className={styles.viewerContainer}>
        {stlData ? (
          <STLViewer stlData={stlData} width={100} height={100} />
        ) : (
          <div className={styles.emptyViewer}>
            <div className={styles.emptyContent}>
              <div className={styles.emptyIcon}>
                <Box size={64} strokeWidth={1} />
              </div>
              <div className={styles.emptyText}>C3D Generator</div>
              <div className={styles.emptySubtext}>Ready to create</div>
            </div>
          </div>
        )}
      </div>

      {/* Control panel overlay */}
      <div className={styles.controlPanel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>C3D Generator</div>
          <div className={styles.panelSubtitle}>AI-Powered CAD Generation</div>
        </div>

        {viewMode ? (
          // View Mode - Show what was generated
          <div className={styles.panelSection}>
            <div className={styles.sectionTitle}>Generated From</div>
            <div className={styles.promptDisplay}>
              <div className={styles.promptIcon}>
                <MessageSquare size={20} strokeWidth={1.5} />
              </div>
              <div className={styles.promptText}>{originalPrompt}</div>
            </div>
            <button
              className={styles.newModelButton}
              onClick={() => {
                setViewMode(false);
                setPrompt('');
                setOriginalPrompt('');
                setResult(null);
                setStlData(null);
              }}
            >
              Generate New Model
            </button>
          </div>
        ) : (
          // Create Mode - Input form
          <div className={styles.panelSection}>
            <div className={styles.sectionTitle}>Create Model</div>
            <textarea
              className={styles.promptInput}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your 3D object..."
              disabled={isGenerating}
            />
            <button
              className={styles.generateButton}
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? (
                'Generating...'
              ) : (
                <>
                  <Sparkles size={14} strokeWidth={1.5} />
                  Generate Model
                </>
              )}
            </button>
          </div>
        )}

        <div className={styles.panelSection}>
          <div className={styles.sectionTitle}>Status</div>
          <div className={styles.statusIndicator}>
            <div className={styles.statusDot}></div>
            <div className={styles.statusText}>
              {isGenerating ? 'Generating CAD model...' : 
               result?.success ? 'Model ready' :
               result?.error ? 'Generation failed' :
               'Ready'}
            </div>
          </div>
          
          {result && !isGenerating && (
            <div className={styles.statusMessage}>
              {result.success ? result.message : result.error}
            </div>
          )}
        </div>

        <div className={styles.panelSection}>
          <div className={styles.sectionTitle}>Model Info</div>
          <div className={styles.specGrid}>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Format</span>
              <span className={styles.specValue}>STL</span>
            </div>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Status</span>
              <span className={`${styles.specValue} ${stlData ? styles.success : ''}`}>
                {stlData ? 'Loaded' : 'Empty'}
              </span>
            </div>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Engine</span>
              <span className={styles.specValue}>CADQuery</span>
            </div>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Renderer</span>
              <span className={styles.specValue}>VTK.js</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
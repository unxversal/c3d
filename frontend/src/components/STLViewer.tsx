import { useEffect, useRef, useState } from 'react';
import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import styles from './STLViewer.module.css';

// VTK.js imports
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkSTLReader from '@kitware/vtk.js/IO/Geometry/STLReader';
import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';

interface STLViewerProps {
  stlData?: ArrayBuffer;
  stlUrl?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function STLViewer({ 
  stlData, 
  stlUrl, 
  width = 800, 
  height = 600, 
  className 
}: STLViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderWindowRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous error
    setError(null);

    // Create VTK.js rendering context
    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
      background: [0.1, 0.1, 0.1], // Dark background
      container: containerRef.current,
    });

    const renderer = fullScreenRenderer.getRenderer();
    const renderWindow = fullScreenRenderer.getRenderWindow();
    renderWindowRef.current = renderWindow;

    // Set up camera controls
    const interactor = renderWindow.getInteractor();
    interactor.setInteractorStyle(vtkInteractorStyleTrackballCamera.newInstance());

    const loadSTL = async () => {
      if (!stlData && !stlUrl) return;

      setIsLoading(true);
      setModelLoaded(false);

      try {
        const reader = vtkSTLReader.newInstance();
        
        if (stlData) {
          // Load from ArrayBuffer
          reader.parseAsArrayBuffer(stlData);
        } else if (stlUrl) {
          // Load from URL
          const response = await fetch(stlUrl);
          if (!response.ok) {
            throw new Error(`Failed to load STL: ${response.statusText}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          reader.parseAsArrayBuffer(arrayBuffer);
        }

        // Create VTK pipeline
        const mapper = vtkMapper.newInstance();
        mapper.setInputConnection(reader.getOutputPort());

        const actor = vtkActor.newInstance();
        actor.setMapper(mapper);
        
        // Set nice material properties
        actor.getProperty().setColor(0.2, 0.8, 1.0); // Nice blue color
        // Note: VTK.js property material settings may vary by version

        renderer.addActor(actor);
        renderer.resetCamera();
        renderWindow.render();

        setModelLoaded(true);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load 3D model');
        setModelLoaded(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadSTL();

    // Cleanup
    return () => {
      if (renderWindowRef.current) {
        renderWindowRef.current.delete();
      }
    };
  }, [stlData, stlUrl]);

  const resetCamera = () => {
    if (renderWindowRef.current) {
      const renderer = renderWindowRef.current.getRenderer ? 
        renderWindowRef.current.getRenderer() : 
        renderWindowRef.current.getRenderers()[0];
      
      if (renderer) {
        renderer.resetCamera();
        renderWindowRef.current.render();
      }
    }
  };

  const hasContent = stlData || stlUrl;

  return (
    <div 
      className={`${styles.container} ${className || ''}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <div 
        ref={containerRef} 
        className={styles.viewer}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          Loading 3D model...
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className={styles.error} style={{ width: '100%', height: '100%' }}>
          <div className={styles.errorIcon}>⚠️</div>
          <div>Failed to load 3D model</div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>{error}</div>
        </div>
      )}

      {/* Placeholder when no content */}
      {!hasContent && !isLoading && !error && (
        <div className={styles.placeholder} style={{ width: '100%', height: '100%' }}>
          <div className={styles.placeholderIcon}>🎯</div>
          <div>No 3D model loaded</div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>
            Generate a model to see it here
          </div>
        </div>
      )}

      {/* Model info */}
      {modelLoaded && (
        <div className={styles.modelInfo}>
          📐 3D Model Loaded
        </div>
      )}

      {/* Controls */}
      {modelLoaded && (
        <div className={styles.controls}>
          <button 
            className={styles.controlButton}
            onClick={resetCamera}
            title="Reset camera view"
          >
            🎯 Reset View
          </button>
        </div>
      )}
    </div>
  );
}
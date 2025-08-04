import { useEffect, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import * as THREE from 'three';
import styles from './STLViewer.module.css';

interface STLViewerProps {
  stlData?: ArrayBuffer;
  stlUrl?: string;
  width?: number;
  height?: number;
  className?: string;
}

function STLModel({ stlData, stlUrl }: { stlData?: ArrayBuffer; stlUrl?: string }) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loader = new STLLoader();
    
    const loadSTL = async () => {
      try {
        let geometryResult: THREE.BufferGeometry;
        
        if (stlData) {
          // Load from ArrayBuffer
          geometryResult = loader.parse(stlData);
        } else if (stlUrl) {
          // Load from URL
          const response = await fetch(stlUrl);
          if (!response.ok) {
            throw new Error(`Failed to load STL: ${response.statusText}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          geometryResult = loader.parse(arrayBuffer);
        } else {
          return;
        }

        // Center and scale the geometry
        geometryResult.computeBoundingBox();
        const boundingBox = geometryResult.boundingBox!;
        const center = new THREE.Vector3();
        boundingBox.getCenter(center);
        
        // Center the geometry
        geometryResult.translate(-center.x, -center.y, -center.z);
        
        // Scale to fit in view (optional - normalize to unit size)
        const size = new THREE.Vector3();
        boundingBox.getSize(size);
        const maxDimension = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDimension; // Scale to fit in 2-unit cube
        geometryResult.scale(scale, scale, scale);
        
        setGeometry(geometryResult);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load STL');
        setGeometry(null);
      }
    };

    loadSTL();
  }, [stlData, stlUrl]);

  if (error) {
    return null; // Error will be handled by parent component
  }

  if (!geometry) {
    return null; // Loading...
  }

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial 
        color="#00ccff" 
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#333333" wireframe />
    </mesh>
  );
}

export function STLViewer({ 
  stlData, 
  stlUrl, 
  className 
}: STLViewerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (stlData || stlUrl) {
      setIsLoading(true);
      setError(null);
      // Loading state will be handled by the model component
      setTimeout(() => setIsLoading(false), 1000); // Basic timeout for demo
    }
  }, [stlData, stlUrl]);

  const hasContent = stlData || stlUrl;

  return (
    <div 
      className={`${styles.container} ${className || ''}`}
      style={{ width: '100%', height: '100%' }}
    >
      {hasContent ? (
        <Canvas
          camera={{ 
            position: [3, 3, 3], 
            fov: 50,
            near: 0.1,
            far: 1000
          }}
          style={{ 
            background: '#000000',
            width: '100%', 
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 0
          }}
          eventPrefix="client"
        >
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1}
            castShadow
          />
          <directionalLight 
            position={[-10, -10, -5]} 
            intensity={0.5}
          />
          
          {/* 3D Model */}
          <Suspense fallback={<LoadingFallback />}>
            <STLModel stlData={stlData} stlUrl={stlUrl} />
          </Suspense>
          
          {/* Camera Controls */}
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            dampingFactor={0.05}
            screenSpacePanning={false}
          />
        </Canvas>
      ) : (
        <div className={styles.placeholder} style={{ width: '100%', height: '100%' }}>
          <div className={styles.placeholderIcon}>🎯</div>
          <div>No 3D model loaded</div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>
            Generate a model or upload an STL file
          </div>
        </div>
      )}

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
    </div>
  );
}
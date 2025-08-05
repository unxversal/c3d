import React, {useState, useEffect} from 'react';
import {Box, Text, useInput} from 'ink';
import {BaseScreen} from '../components/base-screen.js';
import {ShimmerText} from '../components/shimmer-text.js';
import {ServerManager} from '../server-manager.js';
import {exec} from 'child_process';
import {promisify} from 'util';
import {readdir, stat} from 'fs/promises';
import {join, extname, basename, dirname} from 'path';
import {homedir} from 'os';
import {fileURLToPath} from 'url';

const execAsync = promisify(exec);

interface FileInfo {
  name: string;
  path: string;
  size: number;
  modified: Date;
}

// Get the examples folder path 
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Debug: Check if examples path exists
// console.log('__dirname:', __dirname);
// console.log('Examples path:', join(__dirname, '../../examples'), 'exists:', existsSync(join(__dirname, '../../examples')));

// Simple approach: try to find examples folder relative to the current script
let examplesPath = join(__dirname, '../../examples');

const SEARCH_PATHS = [
  examplesPath, // Examples folder that comes with CLI
  join(homedir(), 'Documents', 'C3D Generated'), // Generated files from CLI
  join(homedir(), 'Downloads'),
  join(homedir(), 'Documents'), 
  join(homedir(), 'Desktop'),
  '/tmp'
];

export function LibraryScreen() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileInfo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Scanning for STL files...');

  // Scan for STL files
  useEffect(() => {
    const scanFiles = async () => {
      setLoading(true);
      const foundFiles: FileInfo[] = [];

      for (const searchPath of SEARCH_PATHS) {
        try {
          const displayPath = searchPath === examplesPath ? 'examples (built-in)' : searchPath;
          setStatus(`📁 Scanning ${displayPath}...`);
          
          const entries = await readdir(searchPath);
          
          for (const entry of entries) {
            if (extname(entry).toLowerCase() === '.stl') {
              const fullPath = join(searchPath, entry);
              try {
                const stats = await stat(fullPath);
                foundFiles.push({
                  name: basename(entry, '.stl'),
                  path: fullPath,
                  size: stats.size,
                  modified: stats.mtime
                });
              } catch (error) {
                // Skip files we can't read
              }
            }
          }
        } catch (error) {
          // Skip directories we can't read
        }
      }

      // Sort by modification date (newest first)
      foundFiles.sort((a, b) => b.modified.getTime() - a.modified.getTime());
      
      setFiles(foundFiles);
      setFilteredFiles(foundFiles);
      setLoading(false);
      setStatus(`Found ${foundFiles.length} STL files`);
    };

    scanFiles();
  }, []);

  // Filter files based on search
  useEffect(() => {
    if (!filter) {
      setFilteredFiles(files);
    } else {
      const filtered = files.filter(file => 
        file.name.toLowerCase().includes(filter.toLowerCase())
      );
      setFilteredFiles(filtered);
    }
    setSelectedIndex(0); // Reset selection when filtering
  }, [filter, files]);

  // Handle keyboard input
  useInput((input, key) => {
    if (key.upArrow && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    } else if (key.downArrow && selectedIndex < filteredFiles.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    } else if (key.return && filteredFiles[selectedIndex]) {
      // Open selected file
      openSTLFile(filteredFiles[selectedIndex]);
    } else if (key.escape) {
      setFilter('');
    } else if (key.backspace || key.delete) {
      setFilter(prev => prev.slice(0, -1));
    } else if (input && input.length === 1 && !key.ctrl && !key.meta) {
      // Add character to filter
      setFilter(prev => prev + input);
    }
  });

  const openSTLFile = async (file: FileInfo) => {
    try {
      setStatus(`🚀 Opening ${file.name}...`);
      
      const serverManager = new ServerManager();
      
      // Start server if not running
      let serverPort = 8765;
      if (!(await serverManager.isRunning())) {
        serverPort = await serverManager.start();
      } else {
        serverPort = serverManager.getCurrentPort() || 8765;
      }
      
      // Open browser with the STL file - use the file path as found during scanning
      const encodedPath = encodeURIComponent(file.path);
      const url = `http://localhost:${serverPort}?from=cli&stl=${encodedPath}`;
      const platform = process.platform;
      
      if (platform === 'darwin') {
        await execAsync(`open "${url}"`);
      } else if (platform === 'win32') {
        await execAsync(`start "${url}"`);
      } else {
        await execAsync(`xdg-open "${url}"`);
      }
      
      setStatus(`✅ Opened ${file.name} in viewer`);
      
    } catch (error) {
      setStatus(`❌ Error opening file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  };

  return (
    <BaseScreen title="STL Library">
      <Box flexDirection="column">
        {/* Status */}
        <Box borderStyle="single" padding={1} marginBottom={1}>
          <Box flexDirection="column">
            <Text color="cyan" bold>📁 STL File Library</Text>
            {loading ? (
              <ShimmerText text={status} />
            ) : (
              <Text color="green">{status}</Text>
            )}
          </Box>
        </Box>

        {/* Search Filter */}
        <Box borderStyle="single" padding={1} marginBottom={1}>
          <Box flexDirection="column">
            <Text color="yellow" bold>🔍 Filter: {filter || '(type to search)'}</Text>
            <Text color="gray">Found {filteredFiles.length} file(s)</Text>
          </Box>
        </Box>

        {/* File List */}
        <Box borderStyle="single" padding={1} marginBottom={1} minHeight={8}>
          <Box flexDirection="column">
            <Text color="blue" bold>📄 Files (↑↓ to navigate, Enter to open, Esc to clear filter)</Text>
            {filteredFiles.length === 0 ? (
              loading ? (
                <Text color="gray">Scanning...</Text>
              ) : (
                <Text color="gray">No STL files found</Text>
              )
            ) : (
              filteredFiles.slice(0, 6).map((file, index) => (
                <Box key={file.path}>
                  <Text color={index === selectedIndex ? 'white' : 'gray'} 
                        backgroundColor={index === selectedIndex ? 'blue' : undefined}>
                    {index === selectedIndex ? '▶ ' : '  '}
                    {file.name} ({formatFileSize(file.size)}) - {formatDate(file.modified)}
                  </Text>
                </Box>
              ))
            )}
            {filteredFiles.length > 6 && (
              <Text color="gray">... and {filteredFiles.length - 6} more files</Text>
            )}
          </Box>
        </Box>

        {/* Controls */}
        <Box borderStyle="single" padding={1}>
          <Box flexDirection="column">
            <Text color="green" bold>🎮 Controls</Text>
            <Text color="gray">  • ↑↓ arrows: Navigate files</Text>
            <Text color="gray">  • Enter: Open selected STL in viewer</Text>
            <Text color="gray">  • Type: Filter files by name</Text>
            <Text color="gray">  • Esc: Clear filter</Text>
            <Text color="gray">  • Q: Quit to main menu</Text>
          </Box>
        </Box>
      </Box>
    </BaseScreen>
  );
}
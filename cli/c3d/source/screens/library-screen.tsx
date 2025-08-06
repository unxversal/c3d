import React, {useState, useEffect} from 'react';
import {Box, Text, useInput} from 'ink';
import {BaseScreen} from '../components/base-screen.js';
import {ShimmerText} from '../components/shimmer-text.js';
import {ServerManager} from '../server-manager.js';
import {exec} from 'child_process';
import {promisify} from 'util';
import {readdir, stat, rename} from 'fs/promises';
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

interface Props {
	initialSelectedFile?: string;
}

export function LibraryScreen({initialSelectedFile}: Props) {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileInfo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Scanning for STL files...');
  const [renameMode, setRenameMode] = useState(false);
  const [newFileName, setNewFileName] = useState('');

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

      if (initialSelectedFile) {
        const initialIndex = foundFiles.findIndex(file => file.path === initialSelectedFile);
        if (initialIndex !== -1) {
          setSelectedIndex(initialIndex);
        }
      }
      
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
    if (renameMode) {
      // Handle rename mode input
      if (key.return) {
        // Confirm rename
        handleRename();
      } else if (key.escape) {
        // Cancel rename
        setRenameMode(false);
        setNewFileName('');
      } else if (key.backspace || key.delete) {
        setNewFileName(prev => prev.slice(0, -1));
      } else if (input && input.length === 1) {
        setNewFileName(prev => prev + input);
      }
    } else {
      // Normal navigation mode
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
      } else if (input === 'r' || input === 'R') {
        // Start rename mode
        if (filteredFiles[selectedIndex]) {
          setRenameMode(true);
          setNewFileName(filteredFiles[selectedIndex].name);
        }
      } else if (input && input.length === 1 && !key.ctrl && !key.meta) {
        // Add character to filter (exclude 'r' and 'R' since they're used for rename)
        if (input !== 'r' && input !== 'R') {
          setFilter(prev => prev + input);
        }
      }
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

  const handleRename = async () => {
    if (!filteredFiles[selectedIndex] || !newFileName.trim()) {
      setRenameMode(false);
      setNewFileName('');
      return;
    }

    const selectedFile = filteredFiles[selectedIndex];
    const oldPath = selectedFile.path;
    const directory = dirname(oldPath);
    const newPath = join(directory, newFileName.trim() + '.stl');

    try {
      setStatus(`📝 Renaming ${selectedFile.name} to ${newFileName.trim()}...`);
      
      // Rename the actual file
      await rename(oldPath, newPath);
      
      // Update the files list
      const updatedFiles = files.map(file => 
        file.path === oldPath 
          ? { ...file, name: newFileName.trim(), path: newPath }
          : file
      );
      setFiles(updatedFiles);
      setFilteredFiles(filteredFiles.map(file => 
        file.path === oldPath 
          ? { ...file, name: newFileName.trim(), path: newPath }
          : file
      ));
      
      setStatus(`✅ Renamed to ${newFileName.trim()}.stl`);
      setRenameMode(false);
      setNewFileName('');
      
    } catch (error) {
      setStatus(`❌ Error renaming file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setRenameMode(false);
      setNewFileName('');
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

        {/* Search Filter / Rename Mode */}
        <Box borderStyle="single" padding={1} marginBottom={1}>
          <Box flexDirection="column">
            {renameMode ? (
              <>
                <Text color="cyan" bold>✏️  Rename: {newFileName}</Text>
                <Text color="gray">Enter to confirm, Esc to cancel</Text>
              </>
            ) : (
              <>
                <Text color="yellow" bold>🔍 Filter: {filter || '(type to search)'}</Text>
                <Text color="gray">Found {filteredFiles.length} file(s)</Text>
              </>
            )}
          </Box>
        </Box>

        {/* File List */}
        <Box borderStyle="single" padding={1} marginBottom={1} minHeight={8}>
          <Box flexDirection="column">
            {renameMode ? (
              <Text color="blue" bold>📄 Files (renaming selected file)</Text>
            ) : (
              <Text color="blue" bold>📄 Files (↑↓ to navigate, Enter to open, R to rename)</Text>
            )}
            {filteredFiles.length === 0 ? (
              loading ? (
                <Text color="gray">Scanning...</Text>
              ) : (
                <Text color="gray">No STL files found</Text>
              )
            ) : (
              (() => {
                // Calculate viewport for scrolling (show 6 items at a time)
                const viewportSize = 6;
                const totalFiles = filteredFiles.length;
                
                // Calculate start index to keep selected item visible
                let startIndex = Math.max(0, selectedIndex - Math.floor(viewportSize / 2));
                startIndex = Math.min(startIndex, totalFiles - viewportSize);
                startIndex = Math.max(0, startIndex);
                
                const endIndex = Math.min(startIndex + viewportSize, totalFiles);
                const visibleFiles = filteredFiles.slice(startIndex, endIndex);
                
                return (
                  <>
                    {visibleFiles.map((file, viewportIndex) => {
                      const actualIndex = startIndex + viewportIndex;
                      return (
                        <Box key={file.path}>
                          <Text color={actualIndex === selectedIndex ? 'white' : 'gray'} 
                                backgroundColor={actualIndex === selectedIndex ? 'blue' : undefined}>
                            {actualIndex === selectedIndex ? '▶ ' : '  '}
                            {file.name} ({formatFileSize(file.size)}) - {formatDate(file.modified)}
                          </Text>
                        </Box>
                      );
                    })}
                    {totalFiles > viewportSize && (
                      <Text color="gray">
                        Showing {startIndex + 1}-{endIndex} of {totalFiles} files
                        {selectedIndex < startIndex && ' (scroll up for more)'}
                        {selectedIndex >= endIndex && ' (scroll down for more)'}
                      </Text>
                    )}
                  </>
                );
              })()
            )}
          </Box>
        </Box>

        {/* Controls */}
        <Box borderStyle="single" padding={1}>
          <Box flexDirection="column">
            <Text color="green" bold>🎮 Controls</Text>
            {renameMode ? (
              <>
                <Text color="cyan">  • Type: Enter new file name</Text>
                <Text color="cyan">  • Enter: Confirm rename</Text>
                <Text color="cyan">  • Esc: Cancel rename</Text>
              </>
            ) : (
              <>
                <Text color="gray">  • ↑↓ arrows: Navigate files</Text>
                <Text color="gray">  • Enter: Open selected STL in viewer</Text>
                <Text color="gray">  • R: Rename selected file</Text>
                <Text color="gray">  • Type: Filter files by name</Text>
                <Text color="gray">  • Esc: Clear filter</Text>
                <Text color="gray">  • Q: Quit to main menu</Text>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </BaseScreen>
  );
}
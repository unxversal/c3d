import React, {useEffect, useState} from 'react';
import {Text, Box} from 'ink';
import {ServerManager} from './server-manager.js';

import {updateConfig} from './c3d.config.js';
import {UIPlayground} from './ui-playground.js';
import {StaticPlayground} from './static-playground.js';
import {ShimmerPlayground} from './shimmer-playground.js';
import {ScreenTester} from './screen-tester.js';
import {ViewerLauncher} from './viewer-launcher.js';
import {LibraryScreen} from './screens/library-screen.js';
import {ConfigScreen} from './screens/config-screen.js';
import {GenerationScreen} from './screens/generation-screen.js';
import {ServerScreen} from './screens/server-screen.js';
import {RenderScreen} from './screens/render-screen.js';
import {DeloadScreen} from './screens/deload-screen.js';


type Props = {
	command: string;
	subCommand?: string;
	scriptFile?: string;
	generatePrompt?: string;
	screenName?: string;
	flags: {
		name?: string;
		port?: number;
		output?: string;
		retries?: number;
		noViewer?: boolean;
	};
};

const serverManager = new ServerManager();

export default function App({command, subCommand, scriptFile, generatePrompt, screenName, flags}: Props) {
	const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
	const [message, setMessage] = useState('');
	const [serverRunning, setServerRunning] = useState(false);
	const [actualPort, setActualPort] = useState<number | null>(null);

	// UI Playground modes
	if (command === 'viewer') {
		return <ViewerLauncher />;
	}

	if (command === 'list') {
		return <LibraryScreen />;
	}

	if (command === 'config') {
		return <ConfigScreen />;
	}

	if (command === 'generate' && generatePrompt) {
		return <GenerationScreen prompt={generatePrompt} flags={flags} />;
	}

	if (command === 'server' && subCommand) {
		return <ServerScreen subCommand={subCommand as 'start' | 'stop' | 'status'} flags={flags} />;
	}

	if (command === 'render' && scriptFile) {
		return <RenderScreen scriptFile={scriptFile} flags={flags} />;
	}

	if (command === 'deload') {
		return <DeloadScreen flags={flags} />;
	}

	if (command === 'ui') {
		if (subCommand === 'static') {
			return <StaticPlayground />;
		}
		if (subCommand === 'shimmer') {
			return <ShimmerPlayground />;
		}
		if (subCommand === 'screen') {
			return <ScreenTester screenName={screenName || 'home'} />;
		}
		return <UIPlayground />;
	}

	const updateServerStatus = async () => {
		const currentPort = serverManager.getCurrentPort();
		const checkPort = currentPort || flags.port || 8765;
		const isRunning = await serverManager.isRunning(checkPort);
		setServerRunning(isRunning);
		if (isRunning && currentPort) {
			setActualPort(currentPort);
		}
		return isRunning;
	};

	useEffect(() => {
		const executeCommand = async () => {
			setStatus('loading');
			
			// Update config with any CLI flags
			if (flags.retries) {
				updateConfig({ maxRetries: flags.retries });
			}
			if (flags.port) {
				updateConfig({ defaultPort: flags.port });
			}
			
			try {
				// All main commands are now handled by their respective screen components above
				switch (command) {

					case 'hello':
					default:
						setMessage(`Hello, ${flags.name || 'Stranger'}!`);
						await updateServerStatus();
						setStatus('success');
						break;
				}
			} catch (error) {
				setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
				setStatus('error');
			}
		};

		executeCommand();
	}, [command, subCommand, scriptFile, generatePrompt, flags]);

	const getStatusColor = () => {
		switch (status) {
			case 'loading': return 'yellow';
			case 'success': return 'green';
			case 'error': return 'red';
			default: return 'white';
		}
	};

	return (
		<Box flexDirection="column" padding={1}>
			<Box marginBottom={1}>
				<Text color="cyan" bold>🔧 C3D CADQuery CLI</Text>
			</Box>
			
			<Box marginBottom={1}>
				<Text color={serverRunning ? 'green' : 'red'}>
					Server Status: {serverRunning ? `🟢 Running on port ${actualPort || 'unknown'}` : '🔴 Stopped'}
				</Text>
			</Box>

			<Box flexDirection="column">
				{status === 'loading' && (
					<Box flexDirection="column">
						<Text color="yellow">
							⏳ Processing...
						</Text>

					</Box>
				)}
				
				{status !== 'loading' && (
					<Text color={getStatusColor()}>
						{message}
					</Text>
				)}
			</Box>
		</Box>
	);
}



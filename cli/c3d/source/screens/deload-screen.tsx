import React, {useState, useEffect} from 'react';
import {Box, Text} from 'ink';
import {BaseScreen} from '../components/base-screen.js';
import {ShimmerText} from '../components/shimmer-text.js';
import {GenerationService} from '../generation-service.js';

interface Props {
	flags: {
		// No specific flags for deload command currently
	};
}

const generationService = new GenerationService();

export function DeloadScreen({flags}: Props) {
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
	const [message, setMessage] = useState('');
	const [modelWasInstalled, setModelWasInstalled] = useState(false);

	useEffect(() => {
		const deloadModel = async () => {
			try {
				setMessage('Checking Ollama connection...');
				const modelAvailable = await generationService.testOllamaConnection();
				if (!modelAvailable) {
					setMessage('❌ Cannot connect to Ollama. Make sure Ollama is running.');
					setStatus('error');
					return;
				}

				setMessage('Checking if C3D model is installed...');
				const hasModel = await generationService.checkModelAvailability();
				if (!hasModel) {
					setMessage('ℹ️  C3D model is not currently installed.');
					setStatus('success');
					return;
				}

				setModelWasInstalled(true);
				setMessage('Removing C3D AI model from local storage...');
				await generationService.deleteModel();
				setMessage('✅ C3D AI model successfully removed from local storage.\n💾 Freed up ~4-8GB of disk space.');
				setStatus('success');
			} catch (error) {
				setMessage(`❌ Failed to remove model: ${error instanceof Error ? error.message : String(error)}`);
				setStatus('error');
			}
		};

		deloadModel();
	}, [flags]);

	const getStatusColor = () => {
		switch (status) {
			case 'loading': return 'yellow';
			case 'success': return 'green';
			case 'error': return 'red';
			default: return 'white';
		}
	};

	return (
		<BaseScreen title="Model Management">
			<Box flexDirection="column">
				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Text color="cyan" bold>🧠 AI Model Deloader</Text>
				</Box>

				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Text color="yellow" bold>🎯 Operation</Text>
						<Text color="white">  Remove C3D AI model from local storage</Text>
					</Box>
				</Box>

				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Text color="blue" bold>📊 Status</Text>
						{status === 'loading' ? (
							<ShimmerText text="PROCESSING..." />
						) : (
							<Text color={getStatusColor()}>
								{message}
							</Text>
						)}
						{modelWasInstalled && status === 'success' && (
							<Text color="gray" dimColor>
								Model size: ~4-8GB
							</Text>
						)}
					</Box>
				</Box>

				<Box borderStyle="single" padding={1}>
					<Box flexDirection="column">
						<Text color="magenta" bold>🎮 Controls</Text>
						<Text color="gray">  • Q: Return to main menu</Text>
						<Text color="gray">  • Model provider: Ollama</Text>
					</Box>
				</Box>
			</Box>
		</BaseScreen>
	);
}
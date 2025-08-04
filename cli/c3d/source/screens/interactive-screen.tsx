import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';
import { BaseScreen } from '../components/base-screen.js';
import { ShimmerText } from '../components/shimmer-text.js';

export function InteractiveScreen() {
	const [demoState, setDemoState] = useState(0);
	
	const states = [
		{
			title: "INTERACTIVE MODE",
			status: "READY",
			content: [
				"┌─ LIVE COLLABORATION ─────────────────────┐",
				"│ • Real-time model updates                │",
				"│ • Multi-user editing sessions            │", 
				"│ • Voice & text chat integration          │",
				"│ • Shared workspace management            │",
				"└──────────────────────────────────────────┘",
				"",
				"┌─ INTERACTIVE TOOLS ──────────────────────┐",
				"│ • 3D viewport manipulation               │",
				"│ • Parameter sliders & controls           │",
				"│ • Material & texture editor              │",
				"│ • Animation timeline & keyframes         │",
				"└──────────────────────────────────────────┘"
			],
			shimmerText: null
		},
		{
			title: "INTERACTIVE MODE",
			status: "CONNECTING",
			content: [
				"┌─ SESSION MANAGER ────────────────────────┐",
				"│ Session ID: C3D-8F2A-91BC                │",
				"│ Host: john@unxversal.com                 │",
				"│ Participants: 3/8                       │",
				"│ Model: gear_assembly_v2.step            │",
				"└──────────────────────────────────────────┘",
				"",
				"┌─ REAL-TIME ACTIVITY ─────────────────────┐",
				"│ alice@company.com editing gear teeth     │",
				"│ bob@startup.io adjusting materials       │",
				"│ system auto-saving changes...            │",
				"└──────────────────────────────────────────┘"
			],
			shimmerText: "ESTABLISHING CONNECTION..."
		},
		{
			title: "INTERACTIVE MODE", 
			status: "ACTIVE",
			content: [
				"┌─ WORKSPACE CONTROLS ─────────────────────┐",
				"│ [↕] Camera: Orbit Mode                   │",
				"│ [⚡] Snap: Grid + Vertices               │", 
				"│ [🎨] Material: Aluminum 6061            │",
				"│ [📐] Units: Millimeters                 │",
				"└──────────────────────────────────────────┘",
				"",
				"┌─ COLLABORATION STATUS ───────────────────┐",
				"│ • 2 users online, 1 editing             │",
				"│ • Auto-sync enabled (every 30s)         │",
				"│ • Version control: Git integration       │",
				"└──────────────────────────────────────────┘"
			],
			shimmerText: "PROCESSING REAL-TIME UPDATES..."
		},
		{
			title: "INTERACTIVE MODE",
			status: "ADVANCED",
			content: [
				"┌─ ADVANCED FEATURES ──────────────────────┐",
				"│ • Physics simulation preview             │",
				"│ • Stress analysis visualization          │",
				"│ • Manufacturing constraints check        │",
				"│ • Cost estimation in real-time           │",
				"└──────────────────────────────────────────┘",
				"",
				"┌─ EXPORT & SHARING ───────────────────────┐",
				"│ • Cloud rendering queue: 2 jobs          │",
				"│ • Collaboration history: 47 versions     │",
				"│ • Share links with permission control    │",
				"└──────────────────────────────────────────┘"
			],
			shimmerText: "RUNNING SIMULATIONS..."
		}
	];
	
	useEffect(() => {
		const interval = setInterval(() => {
			setDemoState(prev => (prev + 1) % states.length);
		}, 4000);
		
		return () => clearInterval(interval);
	}, [states.length]);
	
	const currentState = states[demoState]!;
	
	return (
		<BaseScreen>
			<Box flexDirection="column" width={60}>
				<Box borderStyle="single" flexDirection="column" paddingX={1}>
					<Text color="cyan" bold>{currentState.title}</Text>
					<Text color="green">Status: {currentState.status}</Text>
				</Box>
				
				<Box marginTop={1} flexDirection="column">
					{currentState.content.map((line, i) => (
						<Text key={i} color="white">{line}</Text>
					))}
				</Box>
				
				{currentState.shimmerText && (
					<Box marginTop={1} borderStyle="single" paddingX={1}>
						<ShimmerText text={currentState.shimmerText} />
					</Box>
				)}
				
				<Box marginTop={1}>
					<Text color="gray">Press ←/→ to navigate, 'q' to quit</Text>
				</Box>
			</Box>
		</BaseScreen>
	);
}
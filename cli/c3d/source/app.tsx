import React from 'react';
import BrandedInterface from './branded-interface.js';

type Props = {
	command: string;
	subCommand?: string;
	scriptFile?: string;
	generatePrompt?: string;
	flags: {
		name?: string;
		port?: number;
		output?: string;
		retries?: number;
	};
};

export default function App({command, subCommand, scriptFile, generatePrompt, flags}: Props) {
	// Use the branded interface for all commands including 'ui'
	return <BrandedInterface 
		command={command} 
		subCommand={subCommand}
		scriptFile={scriptFile} 
		generatePrompt={generatePrompt}
		flags={flags} 
	/>;
}

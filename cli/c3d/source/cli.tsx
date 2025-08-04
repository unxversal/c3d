#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './app.js';

const cli = meow(
	`
	Usage
	  $ c3d [command] [arguments]

	Commands
		generate <prompt>   Generate CAD object from text description
		server start        Start the CADQuery rendering server
		server stop         Stop the CADQuery rendering server  
		server status       Check if the server is running
		render <script>     Render a CADQuery script file
		config              Show current configuration
		deload              Remove C3D AI model from local storage
		ui                  Launch UI development playground

	Options
		--name              Your name
		--port              Server port (default: 8765, will find available port)
		--output            Output filename for render
		--retries           Max retries for generation (default: 5)

	Examples
	  $ c3d generate "a simple gear with 12 teeth"
	  $ c3d generate "a phone case for iPhone 15" --retries=3
	  $ c3d server start
	  $ c3d render my-model.py --output=model.stl
	  $ c3d config
	  $ c3d deload
	  $ c3d ui
`,
	{
		importMeta: import.meta,
		flags: {
			name: {
				type: 'string',
			},
			port: {
				type: 'number',
				default: 8765,
			},
			output: {
				type: 'string',
			},
			retries: {
				type: 'number',
				default: 5,
			},
		},
	},
);

const command = cli.input[0] || 'hello';
const subCommand = cli.input[1];
const scriptFile = cli.input.find(arg => arg.endsWith('.py'));

// Handle generate command specially
let generatePrompt = '';
if (command === 'generate' && cli.input.length > 1) {
	generatePrompt = cli.input.slice(1).join(' ');
}

render(<App 
	command={command} 
	subCommand={subCommand}
	scriptFile={scriptFile} 
	generatePrompt={generatePrompt}
	flags={cli.flags} 
/>);

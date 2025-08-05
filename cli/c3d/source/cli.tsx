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
		editor <prompt>     Interactive collaborative CAD generation with code editing
		server start        Start the CADQuery rendering server
		server stop         Stop the CADQuery rendering server  
		server status       Check if the server is running
		render <script>     Render a CADQuery script file
		config              Show current configuration
		deload              Remove C3D AI model from local storage
		viewer              Launch 3D web viewer interface 🌐
		list                Browse and open STL files from library 📁
		ui                  Launch UI development playground
		ui static           Launch ASCII layout slideshow (dolphin + banner)
		ui shimmer          Launch shimmer effects slideshow (wave, pulse, etc.)
		ui screen <name>    Launch specific screen component for testing

	Options
		--name              Your name
		--port              Server port (default: 8765, will find available port)
		--output            Output filename for render
		--retries           Max retries for generation (default: 5)
		--no-viewer         Disable auto-opening web viewer after generation

	Examples
	  $ c3d generate "a simple gear with 12 teeth"
	  $ c3d viewer                                    🌐 Launch web interface
	  $ c3d generate "a phone case for iPhone 15" --retries=3
	  $ c3d server start
	  $ c3d render my-model.py --output=model.stl
	  $ c3d config
	  $ c3d deload
	  $ c3d ui
		$ c3d ui static
		$ c3d ui shimmer
		$ c3d ui screen home
		$ c3d ui screen generation
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
		noViewer: {
			type: 'boolean',
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

// Handle editor command specially
let editorPrompt = '';
if (command === 'editor' && cli.input.length > 1) {
	editorPrompt = cli.input.slice(1).join(' ');
}

// Handle screen command specially
let screenName = '';
if (command === 'ui' && subCommand === 'screen' && cli.input[2]) {
	screenName = cli.input[2];
}

render(<App 
	command={command} 
	subCommand={subCommand}
	scriptFile={scriptFile} 
	generatePrompt={generatePrompt}
	editorPrompt={editorPrompt}
	screenName={screenName}
	flags={cli.flags} 
/>);

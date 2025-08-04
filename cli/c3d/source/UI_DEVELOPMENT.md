# UI Development Guide

## Using the UI Playground

The `c3d ui` command provides a dedicated environment for developing and testing UI components without affecting the main CLI functionality.

## Quick Start

```bash
# Launch the playground
c3d ui

# In another terminal, watch for changes
npm run dev
```

## Development Workflow

1. **Run the playground**: `c3d ui`
2. **Edit components**: Modify `source/ui-playground.tsx` 
3. **See changes live**: The playground updates automatically with TypeScript watch mode
4. **Extract components**: Move perfected components to separate files
5. **Integrate**: Import and use components in `source/app.tsx`

## Available Demo Components

The playground includes examples of:

### Status Indicators
- Loading states with spinners
- Success/error messages  
- Info notifications
- Auto-cycling status demo

### Progress Components
- Progress bars with percentages
- Step-by-step progress indicators
- AI generation simulation

### Layout Examples
- Card-like containers with borders
- Multi-column layouts
- Responsive spacing and padding

### Interactive Elements
- Live counters and timers
- Dynamic content updates
- State management examples

## Creating Your Own Components

### 1. Add to Playground

```typescript
// In ui-playground.tsx
function MyNewComponent() {
    return (
        <Box border="single" padding={1}>
            <Text color="blue">My Component</Text>
        </Box>
    );
}

// Add to UIPlayground component
<MyNewComponent />
```

### 2. Test Styling

```typescript
// Experiment with different styles
<Box borderStyle="round" paddingX={2} marginY={1}>
    <Text color="green" bold>Styled Component</Text>
</Box>
```

### 3. Extract When Ready

```typescript
// Create new file: source/components/my-component.tsx
export function MyComponent({ title }: { title: string }) {
    return (
        <Box borderStyle="round" padding={1}>
            <Text color="green" bold>{title}</Text>
        </Box>
    );
}
```

### 4. Integrate into Main App

```typescript
// In app.tsx
import { MyComponent } from './components/my-component.js';

// Use in your command handlers
<MyComponent title="Success!" />
```

## Styling Reference

### Colors
- `"black"`, `"red"`, `"green"`, `"yellow"`, `"blue"`, `"magenta"`, `"cyan"`, `"white"`
- `"gray"`, `"grey"` (aliases)

### Text Modifiers
- `bold={true}`
- `italic={true}` 
- `underline={true}`
- `strikethrough={true}`
- `dimColor={true}`

### Box Layout
- `flexDirection="row"` or `"column"`
- `padding={1}` or `paddingX={2}` or `paddingY={1}`
- `margin={1}` or `marginX={2}` or `marginY={1}`
- `borderStyle="single"`, `"double"`, `"round"`, `"bold"`
- `width={20}`, `height={10}`

### Common Patterns

```typescript
// Card component
<Box borderStyle="round" padding={2} marginY={1}>
    <Text color="cyan" bold>Card Title</Text>
    <Text>Card content goes here</Text>
</Box>

// Status message
<Box marginBottom={1}>
    <Text color="green">✅ </Text>
    <Text>Operation successful</Text>
</Box>

// Progress indicator
<Box>
    <Text color="yellow">⏳ Loading... </Text>
    <Text color="gray">(step 2 of 5)</Text>
</Box>
```

## Tips

1. **Start Simple**: Begin with basic Text and Box components
2. **Use the Counter**: The built-in counter helps test dynamic content
3. **Test Different States**: Use the status cycling to see how components look in different states
4. **Responsive Design**: Test with different terminal sizes
5. **Color Combinations**: Experiment with color combinations for readability

## Integration Examples

### Progress Component
```typescript
// Develop in playground
function ProgressIndicator({ current, total }: { current: number; total: number }) {
    const percentage = (current / total) * 100;
    return (
        <Box>
            <Text color="blue">Progress: </Text>
            <Text color="green">{percentage.toFixed(1)}%</Text>
        </Box>
    );
}

// Integrate into generation command
{generationProgress && (
    <ProgressIndicator 
        current={generationProgress.attempt || 1} 
        total={generationProgress.maxAttempts || 5} 
    />
)}
```

### Status Message Component
```typescript
// Develop in playground
function StatusMessage({ type, message }: { type: 'success' | 'error' | 'info'; message: string }) {
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    const color = type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue';
    
    return (
        <Box>
            <Text color={color}>{icon} {message}</Text>
        </Box>
    );
}

// Use in command handlers
<StatusMessage type="success" message="CAD generation completed!" />
```

Happy UI development! 🎨
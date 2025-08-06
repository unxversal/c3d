export type PromptMode = 'instructional' | 'completion' | 'thinking_instructional' | 'thinking_completion';

export interface PromptResult {
  systemPrompt: string;
  userPrompt: string;
}

export interface ErrorContext {
  failedCode: string;
  errorMessage: string;
  attemptNumber: number;
  maxAttempts: number;
}

export class PromptLibrary {
  /**
   * Generate prompts for streaming CADQuery code generation
   */
  static generateStreamingPrompts(
    userRequest: string, 
    mode: PromptMode, 
    useThinking: boolean,
    errorContext?: ErrorContext
  ): PromptResult {
    switch (mode) {
      case 'instructional':
        return this.getInstructionalStreamingPrompts(userRequest, useThinking, errorContext);
      
      case 'completion':
        return this.getCompletionStreamingPrompts(userRequest, useThinking, errorContext);
      
      case 'thinking_instructional':
        return this.getInstructionalStreamingPrompts(userRequest, true, errorContext);
      
      case 'thinking_completion':
        return this.getCompletionStreamingPrompts(userRequest, true, errorContext);
      
      default:
        return this.getInstructionalStreamingPrompts(userRequest, useThinking, errorContext);
    }
  }

  /**
   * Generate prompts for direct JSON CADQuery code generation
   */
  static generateDirectPrompts(
    userRequest: string, 
    mode: PromptMode,
    errorContext?: ErrorContext
  ): PromptResult {
    switch (mode) {
      case 'instructional':
      case 'thinking_instructional':
        return this.getInstructionalDirectPrompts(userRequest, errorContext);
      
      case 'completion':
      case 'thinking_completion':
        return this.getCompletionDirectPrompts(userRequest, errorContext);
      
      default:
        return this.getInstructionalDirectPrompts(userRequest, errorContext);
    }
  }

  /**
   * Original instructional prompts for streaming
   */
  private static getInstructionalStreamingPrompts(userRequest: string, useThinking: boolean, errorContext?: ErrorContext): PromptResult {
    const systemPrompt = useThinking ? `You are an AI CAD assistant and CADQuery expert. When the user describes an object, respond using this exact format:

<thinking>
Analyze the user's request and think through the approach. Consider:
- What geometric primitives are needed (boxes, cylinders, spheres, etc.)
- How to break down complex shapes into simpler components
- What CADQuery operations to use (extrude, revolve, fillet, chamfer, etc.)
- Any parametric patterns or helper functions needed
- Potential challenges and how to address them
</thinking>

<description>
Provide a clear description of the part you're designing based on the user's request.
</description>

<explanation>
Explain your approach and any key CADQuery concepts or techniques being used.
</explanation>

<code>
\`\`\`python
import cadquery as cq

# Your CADQuery code here
# Always end with: cq.exporters.export(result, "output.stl")
\`\`\`
</code>

Simple CADQuery patterns:
- Import: import cadquery as cq
- Box: cq.Workplane("XY").box(w, d, h)
- Cylinder: cq.Workplane("XY").cylinder(h, r)
- Export: cq.exporters.export(result, "output.stl")

Always end with: cq.exporters.export(result, "output.stl")` : 

`you are an AI cad assistant. your abilties are being very good at writing cadquery code. your response must generate the user's prompt. You are an AI CAD assistant. Write CADQuery Python code.

Simple CADQuery patterns:
- Import: import cadquery as cq
- Box: cq.Workplane("XY").box(w, d, h)
- Cylinder: cq.Workplane("XY").cylinder(h, r)
- Export: cq.exporters.export(result, "output.stl")

You are an AI CAD assistant and a CadQuery expert. When the user describes an object, you should:

• Generate concise, idiomatic CadQuery code that builds the part.  
• Encapsulate repetitive or multi-step operations into helper functions rather than dumping long lists of commands.  
• Default to parametric patterns: sketch one feature (e.g. a single tooth), then use loops or polar-patterns to replicate it.  
• Apply any finishing touches (fillets, chamfers) via clearly named functions or selectors.  

Always aim for readable, maintainable scripts—avoid enumerating dozens of operations inline; group them into well-named functions.

Keep it simple. Always end with:
cq.exporters.export(result, "output.stl")

Example response (always format your response in this way):
I'll create a simple cube for you. Here's the CADQuery code:

\`\`\`python
import cadquery as cq

# Create a 10x10x10 cube
result = cq.Workplane("XY").box(10, 10, 10).fillet(1)

# Export the result
cq.exporters.export(result, "output.stl")
\`\`\`

This creates a cube with rounded edges (fillet).`;

    let userPrompt = `User request: ${userRequest}`;
    
    if (errorContext) {
      const formatInstructions = useThinking ? `

Remember to respond using this exact format:

<thinking>
Analyze the error and think through a corrected approach. Consider:
- What went wrong in the previous attempt
- How to fix the specific error
- Alternative approaches that might work better
</thinking>

<description>
Describe the corrected part you're designing.
</description>

<explanation>
Explain your corrected approach and what changes you made to fix the error.
</explanation>

<code>
\`\`\`python
import cadquery as cq

# Your corrected CADQuery code here
# Always end with: cq.exporters.export(result, "output.stl")
\`\`\`
</code>` : `

Remember to provide clean CADQuery code that fixes the error.`;

      userPrompt = `User request: ${userRequest}

RETRY ATTEMPT ${errorContext.attemptNumber}/${errorContext.maxAttempts}:
A previous attempt failed with this error:

Failed Code:
\`\`\`python
${errorContext.failedCode}
\`\`\`

Error Message: ${errorContext.errorMessage}

Please analyze the failed code and error, then generate a corrected version.${formatInstructions}`;
    }

    return {
      systemPrompt,
      userPrompt
    };
  }

  /**
   * Completion-style prompts for streaming
   */
  private static getCompletionStreamingPrompts(userRequest: string, useThinking: boolean, errorContext?: ErrorContext): PromptResult {
    const systemPrompt = useThinking ? `<system>
I'm C3Dv0, a CAD AI that generates CadQuery code for user requests.
I will format my response using the following structure:
<thinking>
I will analyze the user's request, break down the geometry, plan the CadQuery operations, and consider any potential challenges.
</thinking>
<description>
I will provide a clear, technical description of the part I'm designing.
</description>
<explanation>
I will explain the CadQuery code, highlighting key techniques and parametric features.
</explanation>
<code>
\`\`\`python
# Complete, runnable CadQuery code.
# The code will always end with: cq.exporters.export(result, "output.stl")
\`\`\`
</code>
</system>` : 
`I'm C3Dv0, a CAD AI that generates CadQuery code for user requests. Here is the code to generate the requested object:`;

    let userPrompt: string;
    
    if (errorContext) {
      if (useThinking) {
        userPrompt = `The user's request is: "${userRequest}"

RETRY ATTEMPT ${errorContext.attemptNumber}/${errorContext.maxAttempts}:
A previous attempt failed with this error:

Failed Code:
\`\`\`python
${errorContext.failedCode}
\`\`\`

Error Message: ${errorContext.errorMessage}

Now, I will analyze the error and provide a corrected response:
<thinking>`;
      } else {
        userPrompt = `The user's request is: "${userRequest}"

Previous attempt failed with error: ${errorContext.errorMessage}

Here is the corrected code:
\`\`\`python`;
      }
    } else {
      userPrompt = useThinking ? `The user's request is: "${userRequest}"

Now, I will get started with my response following the specified structure:
<thinking>` : `\`\`\`python`;
    }

    return {
      systemPrompt,
      userPrompt
    };
  }

  /**
   * Original instructional prompts for direct JSON generation
   */
  private static getInstructionalDirectPrompts(userRequest: string, errorContext?: ErrorContext): PromptResult {
    const systemPrompt = `You are an AI CAD assistant. Write CADQuery Python code.

Simple patterns:
- Box: cq.Workplane("XY").box(w, d, h)
- Cylinder: cq.Workplane("XY").cylinder(h, r)
- Export: cq.exporters.export(result, "output.stl")

CRITICAL: Respond with valid JSON:
{"cadquery_code": "your_python_code_here"}

Example:
{"cadquery_code": "import cadquery as cq\\nresult = cq.Workplane(\\"XY\\").box(10, 10, 5)\\ncq.exporters.export(result, \\"output.stl\\")"}

Keep it simple.`;

    let userPrompt = `Generate CADQuery code for: ${userRequest}`;
    
    if (errorContext) {
      userPrompt = `Generate CADQuery code for: ${userRequest}

RETRY ATTEMPT ${errorContext.attemptNumber}/${errorContext.maxAttempts}:
Previous attempt failed with error: ${errorContext.errorMessage}

Failed Code:
\`\`\`python
${errorContext.failedCode}
\`\`\`

Please analyze the error and generate corrected code.`;
    }

    return {
      systemPrompt,
      userPrompt
    };
  }

  /**
   * Completion-style prompts for direct JSON generation
   */
  private static getCompletionDirectPrompts(userRequest: string, errorContext?: ErrorContext): PromptResult {
    const systemPrompt = `<system>
I'm C3Dv0, a CAD AI. I will generate CadQuery Python code based on the user's request.
My response will be a single, valid JSON object with the key "cadquery_code".
</system>`;

    let userPrompt: string;
    
    if (errorContext) {
      userPrompt = `The user's request is: "${userRequest}"

RETRY ATTEMPT ${errorContext.attemptNumber}/${errorContext.maxAttempts}:
Previous attempt failed with error: ${errorContext.errorMessage}

Now, I will provide the corrected JSON response:
{`;
    } else {
      userPrompt = `The user's request is: "${userRequest}"

Now, I will provide the JSON response:
{`;
    }

    return {
      systemPrompt,
      userPrompt
    };
  }

  /**
   * Generate prompts for two-stage generation (description + code)
   */
  static generateTwoStagePrompts(
    userRequest: string,
    description: any,
    mode: PromptMode
  ): PromptResult {
    switch (mode) {
      case 'instructional':
      case 'thinking_instructional':
        return this.getInstructionalTwoStagePrompts(userRequest, description);
      
      case 'completion':
      case 'thinking_completion':
        return this.getCompletionTwoStagePrompts(userRequest, description);
      
      default:
        return this.getInstructionalTwoStagePrompts(userRequest, description);
    }
  }

  private static getInstructionalTwoStagePrompts(userRequest: string, description: any): PromptResult {
    const systemPrompt = `You are an expert CADQuery programmer. Generate complete, working CADQuery Python code.

CRITICAL REQUIREMENTS:
- Always import cadquery as cq
- Use cq.Workplane("XY") to start
- Assign final object to variable named "result"
- Make code complete and runnable
- Use realistic dimensions
- The code must end with exactly: cq.exporters.export(result, "output.stl")

RESPONSE FORMAT: JSON with only "cadquery_code" field containing complete Python code.`;

    const userPrompt = `Generate CADQuery code for: ${userRequest}

Description: ${description.detailed_description}

Key features: ${description.key_features.join(', ')}`;

    return {
      systemPrompt,
      userPrompt
    };
  }

  private static getCompletionTwoStagePrompts(userRequest: string, description: any): PromptResult {
    const systemPrompt = `<system>
I'm C3Dv0, a CAD AI. I will generate CadQuery Python code based on the user's request and a technical description.
My response will be a single, valid JSON object with the key "cadquery_code".

CRITICAL REQUIREMENTS:
- Always import cadquery as cq
- Use cq.Workplane("XY") to start
- Assign final object to variable named "result"
- Make code complete and runnable
- Use realistic dimensions
- The code must end with exactly: cq.exporters.export(result, "output.stl")
</system>`;

    const userPrompt = `The user's request is: "${userRequest}"

The technical description is:
- Detailed Description: ${description.detailed_description}
- Key Features: ${description.key_features.join(', ')}

Now, I will provide the JSON response containing the complete, runnable CadQuery code:
{`;

    return {
      systemPrompt,
      userPrompt
    };
  }
}
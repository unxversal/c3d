---
language:
- en
license: apache-2.0
library_name: transformers
tags:
- cad
- cadquery
- 3d-modeling
- code-generation
- mechanical-engineering
- text-to-cad
- geometry
- python
- gemma
- fine-tuned
pipeline_tag: text-generation
base_model: unsloth/gemma-3n-E4B-it
datasets:
- text-to-cadquery
widget:
- text: "Create a simple gear with 12 teeth"
  example_title: "Gear Generation"
- text: "Generate a phone case for iPhone 15"
  example_title: "Phone Case"
- text: "Make a rectangular bracket with mounting holes"
  example_title: "Bracket Design"
- text: "Design a simple pulley with a 50mm diameter"
  example_title: "Pulley Design"
model-index:
- name: C3D-v0
  results:
  - task:
      type: text-generation
      name: CAD Code Generation
    dataset:
      name: text-to-cadquery
      type: text-to-cadquery
    metrics:
    - name: Code Execution Success Rate
      type: execution_success
      value: "High"
      verified: false
---

# C3D-v0: AI-Powered CAD Code Generation Model

**Fine-tuned Gemma 3n model for generating CADQuery Python code from natural language descriptions**

## Model Description

C3D-v0 is a specialized language model fine-tuned for generating 3D CAD models through Python code. Built on Google's Gemma 3n architecture, this model transforms natural language descriptions into executable CADQuery scripts that can be rendered as 3D models.

This model is part of the [C3D project](https://github.com/unxversal/c3d) - a complete text-to-CAD pipeline featuring an interactive CLI, 3D web viewer, and local AI inference.

## Key Features

- 🎯 **Specialized for CAD**: Fine-tuned specifically on CAD generation tasks
- 🔧 **CADQuery Focus**: Generates clean, executable Python CADQuery code
- 🚀 **Local Inference**: Designed to run locally via Ollama
- 📐 **3D Understanding**: Trained on geometric and mechanical design concepts
- ⚡ **Optimized Performance**: GGUF quantized for efficient inference

## Training Details

### Base Model
- **Architecture**: Google Gemma 3n (4B parameters)
- **Base Model**: `unsloth/gemma-3n-E4B-it`

### Dataset
- **Source**: [Text-to-CadQuery Dataset](https://github.com/Text-to-CadQuery/Text-to-CadQuery)
- **Training Size**: ~48,000 examples (50% of full dataset)
- **Validation**: Full validation set maintained

### Training Configuration
- **Method**: LoRA (Low-Rank Adaptation) fine-tuning
- **Epochs**: 1 (due to resource constraints)
- **Batch Size**: 2 per device, 4 gradient accumulation steps
- **Learning Rate**: 2e-4
- **Platform**: Trained on Kaggle/Colab free tier

## Usage

### Via Ollama (Recommended)

```bash
# Install the model
ollama pull joshuaokolo/C3Dv0

# Generate CAD code
ollama run joshuaokolo/C3Dv0 "Create a simple gear with 12 teeth"
```

### Via C3D CLI (Full Experience)

```bash
# Install C3D
npm install -g c3d

# Generate with interactive 3D viewer
c3d generate "a phone case for iPhone 15"
```

### Direct Model Usage

```python
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Load model and tokenizer
model_name = "numinousmuses/C3D-v0"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Generate CAD code
prompt = "Create a simple rectangular bracket"
inputs = tokenizer(prompt, return_tensors="pt")

with torch.no_grad():
    outputs = model.generate(
        **inputs,
        max_new_tokens=512,
        temperature=0.8,
        top_p=0.9,
        do_sample=True
    )

generated_code = tokenizer.decode(outputs[0], skip_special_tokens=True)
print(generated_code)
```

## Prompt Format

The model works best with direct, descriptive prompts:

```
"Create a simple gear with 12 teeth"
"Generate a phone case for iPhone 15"
"Make a rectangular bracket with mounting holes"
"Design a simple pulley with a 50mm diameter"
```

## Model Performance

- **Context Length**: Up to 32k tokens (though trained at 16k)
- **Code Quality**: Generates syntactically correct CADQuery code
- **Geometric Understanding**: Handles basic to intermediate 3D shapes
- **Memory Usage**: ~10GB RAM for full context inference

## Example Output

**Input**: "Create a simple gear with 12 teeth"

**Output**:
```python
import cadquery as cq

# Create a gear with 12 teeth
gear = (
    cq.Workplane("XY")
    .circle(25)  # Outer radius
    .circle(20)  # Inner radius for teeth
    .extrude(5)  # Thickness
)

# Add teeth around the circumference
for i in range(12):
    angle = i * 30  # 360/12 = 30 degrees
    tooth = (
        cq.Workplane("XY")
        .transformed(rotate=(0, 0, angle))
        .rect(3, 8)
        .extrude(5)
    )
    gear = gear.union(tooth)

result = gear
```

## Limitations

- **Training Scope**: Limited to 50% of dataset due to resource constraints
- **Complexity**: Best suited for simple to moderate complexity objects
- **Vision**: Text-only model (multimodal version planned)
- **Domain**: Focused on mechanical/geometric objects from training data

## Roadmap

- 🔄 **Full Dataset Training**: Complete training on entire dataset
- 👁️ **Multimodal Support**: Image-to-CAD generation capabilities
- 🎯 **Improved Prompting**: Enhanced prompt engineering for better results
- 📈 **Performance Optimization**: Additional fine-tuning iterations

## Related Links

- **Main Project**: [C3D on GitHub](https://github.com/unxversal/c3d)
- **Ollama Model**: [joshuaokolo/C3Dv0](https://ollama.com/joshuaokolo/C3Dv0)
- **GGUF Version**: [C3D-v0-gguf](https://huggingface.co/numinousmuses/C3D-v0-gguf)
- **Dataset**: [Text-to-CadQuery](https://github.com/Text-to-CadQuery/Text-to-CadQuery)

## Citation

```bibtex
@misc{c3d-v0-2024,
  title={C3D-v0: AI-Powered CAD Code Generation},
  author={Joshua Okolo},
  year={2024},
  url={https://github.com/unxversal/c3d}
}
```

## Acknowledgments

- **Google DeepMind**: For the Gemma 3n base model and competition opportunity
- **Unsloth**: For providing efficient fine-tuning infrastructure
- **Text-to-CadQuery Team**: For the comprehensive training dataset
- **Ollama**: For local inference capabilities

## License

This model inherits the license from the base Gemma 3n model. Please refer to the original Gemma license for usage terms.

---

**Contact**: Joshua Okolo | Mechanical Engineering + Computer Science @ Harvard | [Portfolio](https://bento.me/joshuaokolo)
import cadquery as cq

# Create a simple cube for testing
result = cq.Workplane("XY").box(20, 20, 20).fillet(2)

# Export the result
cq.exporters.export(result, "output.stl")

print("Simple cube generated successfully!")
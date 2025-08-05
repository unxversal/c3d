import cadquery as cq
# Create a 10x10x10 cube
result = cq.Workplane("XY").box(10, 10, 10).fillet(1)
# Export the result
cq.exporters.export(result, "output.stl")
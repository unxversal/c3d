import cadquery as cq
# Create a 5x2.5x1.25 cube
result = cq.Workplane("XY").box(5, 2.5, 1.25).fillet(1)
# Export the result
cq.exporters.export(result, "output.stl")
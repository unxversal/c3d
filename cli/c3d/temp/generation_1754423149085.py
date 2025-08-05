import cadquery as cq
# Create a 5x7.5x2.5 cube
result = cq.Workplane("XY").box(5, 7.5, 2.5).fillet(1)
# Export the result
cq.exporters.export(result, "output.stl")
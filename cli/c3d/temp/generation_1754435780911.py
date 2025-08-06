import cadquery as cq
# Create a cylinder with a height of 5
result = cq.Workplane("XY").cylinder(5, 2)
# Export the result
cq.exporters.export(result, "output.stl")
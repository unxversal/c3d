import cadquery as cq

# Create a wheel with a 2.0 radius and 2.0 extrusion depth
result = cq.Workplane("XY").circle(2.0).extrude(2.0).fillet(1)

# Export the result
cq.exporters.export(result, "output.stl")
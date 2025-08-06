import cadquery as cq
# Create a wheel with a radius of 2.0 and a diameter of 4.0
result = cq.Workplane("XY").circle(2.0).extrude(2.0).fillet(1)
# Export the result
cq.exporters.export(result, "output.stl")
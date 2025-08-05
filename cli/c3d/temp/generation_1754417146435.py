import cadquery as cq

# Cube dimensions
cube_width = 20
cube_depth = 20
cube_height = 20

# Hole dimensions
hole_radius = 10

# Create the cube
result = cq.Workplane("XY").box(cube_width, cube_depth, cube_height)

# Create the hole
hole = cq.Workplane("XY").circle(hole_radius).extrude(cube_height)

# Cut the hole from the cube
result = result.cut(hole)

# Export the result
cq.exporters.export(result, "output.stl")
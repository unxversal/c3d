import cadquery as cq

# Cube dimensions
cube_size = 20

# Hole dimensions
hole_radius = 10

# Create the cube
result = cq.Workplane("XY").box(cube_size, cube_size, cube_size)

# Create the hole
hole = cq.Workplane("XY").circle(hole_radius).extrude(cube_size)

# Position the hole in the center of the cube
hole = hole.translate((cube_size/2, cube_size/2, cube_size/2))

# Cut the hole from the cube
result = result.cut(hole)

# Export the result
cq.exporters.export(result, "output.stl")
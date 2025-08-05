import cadquery as cq

# Cube dimensions
cube_size = 20
cube_height = 20

# Hole dimensions
hole_radius = 5

# Create the cube
result = cq.Workplane("XY").box(cube_size, cube_size, cube_height)

# Create the hole
hole = cq.Workplane("XY").circle(hole_radius).translate((cube_size/2, cube_size/2, cube_height/2))

# Cut the hole from the cube
result = result.cut(hole)

# Export the result
cq.exporters.export(result, "output.stl")
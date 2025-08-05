import cadquery as cq
import math

# Cube dimensions
cube_width = 20 * math.cos(math.radians(30)))
cube_depth = 20 * math.cos(math.radians(30)))
cube_height = 20

# Hole dimensions
hole_radius = 10
hole_center_x = cube_width / 2
hole_center_y = cube_depth / 2
hole_center_z = cube_height / 2

# Create the cube
result = cq.Workplane("XY").box(cube_width, cube_depth, cube_height)

# Create the hole
hole = cq.Workplane("XY").circle(hole_radius).translate((hole_center_x, hole_center_y, hole_center_z))

# Cut the hole from the cube
result = result.cut(hole)

# Export the result
cq.exporters.export(result, "output.stl")
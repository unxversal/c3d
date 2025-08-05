import cadquery as cq

# Define the cube dimensions
cube_size = 20 * cq.Workplane().rect(20, 20).val().x

# Define the cylinder dimensions
cylinder_radius = 5 * cq.Workplane().circle(5).val().r
cylinder_height = 20

# Create the cube
result = cq.Workplane("XY").box(cube_size, cube_size, cylinder_height)

# Create the cylinder
cylinder = cq.Workplane("XY").circle(cylinder_radius).extrude(cylinder_height)

# Cut the cylinder from the cube
result = result.cut(cylinder.translate((cube_size/2, cube_size/2, cylinder_height/2)))

# Export the result
cq.exporters.export(result, "output.stl")
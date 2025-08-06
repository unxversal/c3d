import cadquery as cq

# Define the size of the cube
cube_size = 10

# Create the cube with rounded edges and corners
rounded_cube = cq.Workplane("XY").box(cube_size, cube_size, cube_size).edges().fillet(cube_size / 20)

# Export the result to an STL file
cq.exporters.export(rounded_cube, "output.stl")
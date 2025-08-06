import cadquery as cq

# Define the dimensions of the cube
width = 20 * 1  # Scaled width
depth = 10 * 1  # Scaled depth
height = 5 * 1  # Scaled height

# Create the cube using the cq.Workplane() and .box() methods
cube = cq.Workplane("XY").box(width, depth, height)

# Export the cube to an STL file
cq.exporters.export(cube, "output.stl")
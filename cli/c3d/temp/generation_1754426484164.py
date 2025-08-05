import cadquery as cq

# Define the dimensions of the cube
width = 20
depth = 10
height = 5

# Create the cube with rounded edges
result = cq.Workplane("XY").box(width, depth, height).edges().fillet(1)

# Export the result to a STL file
cq.exporters.export(result, "output.stl")
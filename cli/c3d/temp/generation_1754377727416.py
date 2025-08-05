import cadquery as cq

# Define the dimensions of the rectangular prism
length = 2.5 * 0.5  # Scaled length
width = 1.25 * 0.5  # Scaled width
height = 0.5  # Height

# Create the rectangular prism using CadQuery's cq.Workplane() and cq.Box()
box = cq.Workplane().box(length, width, height)

# Print the CadQuery object to the console
print(box)

# Export the CadQuery object to a STL file
cq.exporters.stl(box, 'rect_prism.stl')}
import cadquery as cq

# Define the dimensions of the rectangular prism
length = 2.5 * 2.5  # 2.5 inches * 2.5 inches = 2.5 inches
width = 1.25 * 1.25  # 1.25 inches * 1.25 inches = 1.25 inches
height = 0.5  # 0.5 inches

# Create the rectangular prism using the cq.Workplane() object
prism = cq.Workplane()

# Extrude the rectangular prism to create the solid object
prism = prism.rect(length, width).extrude(height)

# Export the CAD object to a STL file
cq.exporters.stl(prism, 'prism.stl')

print(
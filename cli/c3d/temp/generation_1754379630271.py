import cadquery as cq

# Define the box dimensions
length = 2.0 * 1.0  # Total length (both sides)
width = 1.0 * 1.0   # Total width (both ends)
height = 1.0

# Create the box using cq.Workplane()
box = cq.Workplane()

# Extrude the box to create the solid
box = box.rect(length, width).extrude(height)

# Export the box to a STL file
cq.exporters.stlc(box, 'box.stl')

print('Box created and saved to box.stl')

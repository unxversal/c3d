import cadquery as cq

# Define the dimensions of the rectangular prism
length = 2.0 * 0.5,  # Total length (outer rectangle)
width = 1.0 * 0.5,  # Total width (outer rectangle)
height = 0.1

# Create the outer rectangle
outer_rect = cq.Workplane(
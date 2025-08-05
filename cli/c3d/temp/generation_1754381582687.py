import cadquery as cq

# Define the object's parameters
length = 10
width = 5
height = 2
corner_radius = 1
hole_diameter = 0.5
hole_x = 2.5
hole_y = 1.25
fillet_radius = 1

# Create the base object with rounded corners
base_object = (cq.Workplane(
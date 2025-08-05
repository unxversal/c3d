import cadquery as cq

# Define the object's dimensions
length = 50
width = 25
height = 10
hole_diameter = 5
hole_x = 25
hole_y = 12.5
fillet_radius = 2.5

# Create the base rectangular object
base_object = cq.Workplane(
import cadquery as cq

# Sample object: a rectangular prism with rounded edges
length = 50
width = 25
height = 10
radius = 2.5
fillet_radius = 2.5

part = (cq.Workplane(
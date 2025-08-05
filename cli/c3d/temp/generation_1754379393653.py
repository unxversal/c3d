import cadquery as cq
import math

# Object parameters
length = 1.5
width = 0.5
height = 0.25
radius = 0.25
arc_1_end_x = 1.25
arc_1_end_y = 0.25
arc_2_end_x = 1.5
arc_2_end_y = 0.0
arc_3_end_x = 1.25
arc_3_end_y = 0.5
arc_4_end_x = 0.75
arc_4_end_y = 0.25

# Create the capsule shape
capsule = cq.Workplane("2D")
capsule = capsule.moveTo(0, 0)
capsule = capsule.lineTo(arc_1_end_x, arc_1_end_y)
capsule = capsule.lineTo(arc_2_end_x, arc_2_end_y)
capsule = capsule.lineTo(arc_3_end_x, arc_3_end_y)
capsule = capsule.lineTo(arc_4_end_x, arc_4_end_y)
capsule = capsule.lineTo(arc_1_end_x, arc_1_end_y)
capsule = capsule.close()

capsule = capsule.extrude(height)

# Rotate the capsule
capsule = capsule.rotate((0, 0, 1), (0, 0, 0), (0, 0, 1)) # No rotation specified, so no rotation applied

# Export the capsule to a STL file
capsule.exportSTL("capsule.stl")
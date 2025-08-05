import cadquery as cq
import math

# Object parameters
length = 1.5
width = 0.5
height = 0.25
radius = 0.25
start_angle = 0.125
end_angle = 0.625
mid_angle = (start_angle + end_angle) / 2
mid_y = width / 2
mid_x = length / 2

# Create the capsule shape
capsule = cq.Workplane("2D")
capsule = capsule.moveTo(mid_x, mid_y).lineTo(mid_x * math.cos(start_angle * math.pi/180), mid_y * math.sin(start_angle * math.pi/180))
capsule = capsule.lineTo(mid_x * math.cos(end_angle * math.pi/180), mid_y * math.sin(end_angle * math.pi/180))
capsule = capsule.lineTo(mid_x, mid_y)
capsule = capsule.close()

capsule = capsule.extrude(height)

# Rotate the capsule
capsule = capsule.rotate((0, 0, 1), (0, 0, 0), (0, 0, 1)) # No rotation needed

# Translate the capsule
capsule = capsule.translate((0, 0, 0))

# Export the capsule to a STL file
cq.exporters.stl(capsule, "capsule.stl")
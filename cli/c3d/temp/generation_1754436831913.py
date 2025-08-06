import cadquery as cq
import math

# Gear parameters
gear_size = 20  # Overall gear size
gear_teeth = 20  # Number of teeth
gear_thickness = 2  # Gear thickness
gear_angle = 360 / gear_teeth  # Gear rotation angle

# Create the gear profile
result = cq.Workplane("XY")

for i in range(gear_teeth):
    angle = i * gear_angle
    radius = gear_size / gear_teeth
    result = result.moveTo(radius * math.cos(angle), radius * math.sin(angle)).circle(radius)

gear = result.close().extrude(gear_thickness)

# Export the gear to STL
cq.exporters.export(gear, "output.stl")
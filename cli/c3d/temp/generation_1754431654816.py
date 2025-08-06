import cadquery as cq
import math

# Gear parameters
gear_teeth = 24  # Number of teeth on the gear
gear_size = 20  # Overall size of the gear (diameter)

# Create the gear profile
gear_profile = cq.Workplane("XY") \
    .moveTo(gear_size / 2, 0) \
    .lineTo(gear_size / 2 + (gear_size / gear_teeth) * math.pi / gear_teeth, 0) \
    .lineTo(gear_size / 2 + (gear_size / gear_teeth) * math.pi / gear_teeth, gear_size / gear_teeth) \
    .lineTo(gear_size / 2, gear_size / gear_teeth) \
    .lineTo(gear_size / 2, 0) \
    .close()

# Revolve the gear profile to create the gear
full_gear = gear_profile.revolve(math.pi / gear_teeth)

# Export the gear to a STL file
cq.exporters.export(full_gear, "output.stl")
import cadquery as cq
import math

# Gear parameters
gear_size = 10.1
gear_teeth = 20
gear_thickness = 0.5
gear_profile = cq.Workplane("XY")

# Calculate tooth width
tooth_width = gear_size / gear_teeth

# Create a single tooth profile
tooth = (
    gear_profile
    .moveTo(tooth_width / 2, 0)
    .lineTo(gear_size / 2, tooth_width / 2)
    .lineTo(gear_size / 2, tooth_width)
    .lineTo(tooth_width / 2, tooth_width / 2)
    .lineTo(tooth_width / 2, 0)
    .close()
)

# Extrude the tooth profile to create a gear
gear = tooth.extrude(gear_thickness)

# Create the full gear by repeating the tooth profile
full_gear = gear.revolve(math.pi / gear_teeth)

# Export the gear to an STL file
cq.exporters.export(full_gear, "output.stl")
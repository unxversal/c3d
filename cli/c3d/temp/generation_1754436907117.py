import cadquery as cq

# Define the spoon profile
spoon_profile = (
    cq.Workplane("XY")
    .moveTo(0, 0)
    .lineTo(10, 0)
    .lineTo(10, 10)
    .lineTo(5, 10)
    .lineTo(5, 5)
    .lineTo(0, 5)
    .lineTo(0, 0)
    .close()
)

# Extrude the spoon profile to create the spoon shape
spoon = spoon_profile.extrude(2)

# Export the spoon shape to an STL file
cq.exporters.export(spoon, "output.stl")
import cadquery as cq

gear_thickness = 2
gear_width = 1.5
gear_height = 1.5

result = cq.Workplane("XY") \
    .moveTo(0, 0) \
    .lineTo(gear_width, 0) \
    .lineTo(gear_width, gear_height) \
    .lineTo(gear_width - gear_thickness, gear_height) \
    .lineTo(gear_width - gear_thickness, gear_height - gear_thickness) \
    .lineTo(gear_thickness, gear_height - gear_thickness) \
    .lineTo(gear_thickness, gear_height) \
    .lineTo(0, gear_height) \
    .lineTo(0, 0) \
    .close() \
    .extrude(gear_thickness)

cq.exporters.export(result, "output.stl")
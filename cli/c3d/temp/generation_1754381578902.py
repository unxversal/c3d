@cq.workplane()
part_name = "Sample Object"
part_description = "A simple rectangular object with rounded edges."
part = cq.Workplane("XY")
part = part.moveTo(0, 0).lineTo(2, 0).lineTo(2, 1).lineTo(0, 1).lineTo(0, 0).close()
part = part.edges().fillet(0.1)
part = part.val().extrude(0.5)
cq.show(part)

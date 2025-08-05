import cadquery as cq

# Sketch points (scaled)
sketch_points = [(
    0.0, 0.0
), (
    0.125, 0.0
), (
    0.125, 0.125
), (
    0.25, 0.125
), (
    0.25, 0.0
), (
    0.375, 0.0
), (
    0.5, 0.0
), (
    0.5, 0.125
), (
    0.625, 0.125
), (
    0.625, 0.0
), (
    0.75, 0.0
), (
    0.75, 0.125
), (
    0.875, 0.125
), (
    0.875, 0.0
), (
    0.9375, 0.0
), (
    0.9375, 0.125
), (
    1.0, 0.125
), (
    1.0, 0.0
)
]

# Create the CadQuery object
obj = cq.Workplane()

# Add each point to the CadQuery object
for point in sketch_points:
    obj = obj.add(cq.Location.xy(point[0], point[1]))

# Extrude the CadQuery object
obj = obj.extrude(0.125)

# Export the CadQuery object to a STL file
cq.exporters.stl(obj, 'stylized_object.stl')

print('Stylized object created successfully!')
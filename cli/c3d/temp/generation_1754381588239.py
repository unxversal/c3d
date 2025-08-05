@CQ.import('https://cad.cadquery.org/services/cq/cadquery/workspaces/default/example_workspaces/basic_workspaces/simple_cube.json')

# parameters
length = 0.5
width = 0.25
height = 0.125

# create the cube
cube = CQ.Workplane().box(length, width, height)

# translate the cube
translated_cube = cube.translate((0, 0, 0.125))

# export the cube to a stlc file
CQ.exporters.stlc(translated_cube, 'simple_cube_translated.stl')

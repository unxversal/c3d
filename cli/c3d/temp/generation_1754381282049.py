import math
import cadquery as cq

# Define the points for the arc
start_point = (0.0, 0.0)
end_point = (0.5, 0.0)
mid_point = (0.25, 0.125)

# Define the points for the rectangle
rect_start_point = (0.5, 0.0)
rect_end_point = (1.0, 0.0)
rect_y_point = (0.25, 0.125)
rect_width = rect_end_point[0] - rect_start_point[0]
rect_height = rect_end_point[1] - rect_start_point[1]

# Define the points for the circle
circle_x = 0.75
circle_y = 0.5
circle_radius = 0.25

# Create the arc
arc = (cq.Workplane(
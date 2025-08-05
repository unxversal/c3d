@openscad

module rounded_rect(width, height, radius) {
  rect_wp = workplane();
  rect_wp.rect(width, height);
  rect_wp.edges().fillet(radius);
  return rect_wp.val();
}

part_1 = rounded_rect(2, 1, 0.1);
part_2 = rounded_rect(1, 0.5, 0.05);
part_3 = rounded_rect(0.5, 0.2, 0.02);
part_4 = rounded_rect(1.2, 0.3, 0.03);
part_5 = rounded_rect(0.3, 0.4, 0.01);
part_6 = rounded_rect(0.1, 0.15, 0.005);
part_7 = rounded_rect(1.5, 0.25, 0.025);
part_8 = rounded_rect(0.2, 0.1, 0.015);
part_9 = rounded_rect(0.4, 0.15, 0.01);  

assembly = part_1 + part_2 + part_3 + part_4 + part_5 + part_6 + part_7 + part_8 + part_9;

show_object(assembly);

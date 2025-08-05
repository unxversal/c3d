sketch
```cpp
// Import the CadQuery library
#include <iostream>
#include <CadQuery/CadQuery.h>
#include <CadQuery/Workplane.h>
#include <CadQuery/Sketch.h>
#include <CadQuery/FeatureSet.h>
#include <CadQuery/Solid.h>

// Define the sketch
CadQuery::Workplane wp;
CadQuery::Sketch sketch = wp.sketch();
sketch.moveTo(0.0, 0.0);
sketch.lineTo(2.0, 0.0);
sketch.lineTo(2.0, 1.0);
sketch.lineTo(0.0, 1.0);
sketch.lineTo(0.0, 0.0);
sketch.close();

// Extrude the sketch to create a solid box
CadQuery::Solid box = sketch.extrude(1.0);

// Print the box dimensions to the console
std::cout << "Box dimensions:
";
std::cout << "Length = " << box.length() << "
";
std::cout << "Width = " << box.width() << "
";
std::cout << "Height = " << box.height() << "
";

// Export the box to a STL file
CadQuery::FeatureSet box_feature_set = box.featureSet();
box_feature_set.exportToSTL("box.stl");
```
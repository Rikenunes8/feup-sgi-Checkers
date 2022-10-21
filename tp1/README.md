# SGI 2022/2023 - TP1

## Group T01G05

| Name             | Number    | E-Mail                              |
| ---------------- | --------- | ----------------------------------- |
| Rui Alves        | 201905853 | up201905853@fe.up.pt                |
| Henrique Nunes   | 201906852 | up201906852@fe.up.pt                |

----

## Project information

- Individual and documented functions for each step of the parser, where each one of them is responsible for parsing each XML tag
- Error display and warnings when missing values or properties of elements of the XML file
- All the primitives were implemented with the required vertices, faces, and normals. Also have texture implementation on those primitives, except the re-dimension of the textures coordinates on Sphere, Torus, and Cylinder.
- Implementation of inheritance of components transformations, passing the transformation matrix of a node (Ma) to the respective children nodes and applying the transformations of the children node (Mp) after the transformations of the parent (M=Ma*Mp). We also apply a transformation referenced by the transformationref tag. Reporting errors when wrong transformation specifications or invalid transformationref id property (not defined before)
- Implementation of inheritance of components materials, passing to the children material the parent material (if the material of the children is "inherit") or applying the respective material defined. Report errors when wrong material specification or invalid material id property introduced (not defined before)
- Implementation of inheritance of components texture, passing to the children texture the parent texture (if the texture of the children is inherit) or applying the respective texture (none or the texture defined, with the respective lengths). Warning in the console when no length_s or/and no length_t are introduced in texture (in that case we use length_s and length_t with value 1). 
- Verification of non-existent component references giving an error when the reference is not found
- Verification of components graph cycles giving an error when there is a cycle
- Implementation of a graphic interface with the following options:
  - display normal (shows components/objects normals)
  - display lights (shows the defined lights on the scene)
  - a folder with all the cameras, where you can select the one that you want to have your view on
  - a folder with all the lights in the scene, where you can select for each one if they are enabled or disabled

----

### Scene
  - The [scene](screenshots/feup.png) consists of the main [garden](screenshots/garden.png) of the FEUP Campus. This scene includes part of the corridor next to the different departments with windows and supporting columns, the bridge between building B and the others, and the [staircase](screenshots/front.png) under this bridge. The bridge is supported by circular pillars and has [rails](screenshots/rails.png) above it. In the garden are the [legacy seats](screenshots/bench.png) and some colorful [poufs](screenshots/poufs.png), as well as three [lamps](screenshots/lamp.png), one of them surrounded by an innovative [circular wood seat](screenshots/circular_bench.png). The scene also contains buildings F and G next to the corridor on the left side of the stairs and building B on the right. Building B also contains a [door](screenshots/door_off.png) with a [light](screenshots/door_on.png) on top of it, illuminating its entry. To complete the scene there is a [moon](screenshots/garden_back.png) illuminating the all scene.

----

## Issues/Problems

- We believe all the features were implemented and there are no found bugs.

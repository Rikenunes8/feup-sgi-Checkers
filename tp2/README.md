# SGI 2022/2023 - TP2

## Group T01G05

| Name             | Number    | E-Mail                              |
| ---------------- | --------- | ----------------------------------- |
| Rui Alves        | 201905853 | up201905853@fe.up.pt                |
| Henrique Nunes   | 201906852 | up201906852@fe.up.pt                |

----

## Project information

- Better files organization (organize files (parsers, components and primitives, shaders, ..) in directories; parsers extracted to classes in separated files)
- The feature to add nurbs to the scene was implemented and some nurbs were added to the xml file
  - [Rectangle](screenshots/garden_light.png) (replace previous garden rectangle by a nurb rectangle)
    - Can visualize it by turning the garden lights on
  - [Tent](screenshots/normalTent.png) (it was placed a tent in the garden next to the circular bench)
  - [Barrel and Circle](screenshots/barrelPoufs.png) (it was placed a barrel and its tops next to the poufs)
  - [Tent Inverted](screenshots/invertedTent.png) (to improve the tent design it was made the nerb to the inside part of the tent)
- The feature to highlight the components was implemented using the original illumination, material and texture of a component combined to interpolate with the color defined in the highlighted property on xml in a pulsatile way. The scale pulse was also implemented.
  - [lamp pulse](screenshots/Lamp.gif) 
  - [pouf pulse](screenshots/Pouf.gif) 
  - [barrel pulse](screenshots/BarrelPulse.gif) 
- The feature to animate the components was implemented with the defined behaviour and specification. It were added to the xml scene elements to demonstrate it
  - [Barrel falling](screenshots/BarrelFallen.gif)
  - [Ball thrown from the window](screenshots/Ovni.gif)
- It was added to the interface the possibility to turn on/off the highlighted property of the components and a button to reset the scene animation

----

## Issues/Problems

- We believe all the features were implemented and there are no found bugs.

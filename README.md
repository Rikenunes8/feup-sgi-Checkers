# SGI 2022/2023

## Group T01G05
| Name             | Number    | E-Mail                              |
| ---------------- | --------- | ----------------------------------- |
| Rui Alves        | 201905853 | up201905853@fe.up.pt                |
| Henrique Nunes   | 201906852 | up201906852@fe.up.pt                |

----

## Projects

### [TP1 - Scene Graph](tp1)

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
- Scene
  - The [scene](tp1/screenshots/feup.png) consists of the main [garden](tp1/screenshots/garden.png) of the FEUP Campus. This scene includes part of the corridor next to the different departments with windows and supporting columns, the bridge between building B and the others, and the [staircase](tp1/screenshots/front.png) under this bridge. The bridge is supported by circular pillars and has [rails](tp1/screenshots/rails.png) above it. In the garden are the [legacy seats](tp1/screenshots/bench.png) and some colorful [poufs](tp1/screenshots/poufs.png), as well as three [lamps](tp1/screenshots/lamp.png), one of them surrounded by an innovative [circular wood seat](tp1/screenshots/circular_bench.png). The scene also contains buildings F and G next to the corridor on the left side of the stairs and building B on the right. Building B also contains a [door](tp1/screenshots/door_off.png) with a [light](tp1/screenshots/door_on.png) on top of it, illuminating its entry. To complete the scene there is a [moon](tp1/screenshots/garden_back.png) illuminating the all scene.

-----

### [TP2 - Nurbs, Shaders and Animations](tp2)
- Better files organization (organize files (parsers, components and primitives, shaders, ..) in directories; parsers extracted to classes in separated files)
- The feature to add nurbs to the scene was implemented and some nurbs were added to the xml file
  - [Rectangle](tp2/screenshots/garden_light.png) (replace previous garden rectangle by a nurb rectangle)
    - Can visualize it by turning the garden lights on
  - [Tent](tp2/screenshots/normalTent.png) (it was placed a tent in the garden next to the circular bench)
  - [Barrel and Circle](tp2/screenshots/barrelPoufs.png) (it was placed a barrel and its tops next to the poufs)
  - [Tent Inverted](tp2/screenshots/invertedTent.png) (to improve the tent design it was made the nerb to the inside part of the tent)
- The feature to highlight the components was implemented using the original illumination, material and texture of a component combined to interpolate with the color defined in the highlighted property on xml in a pulsatile way. The scale pulse was also implemented.
  - [lamp pulse](tp2/screenshots/Lamp.gif) 
  - [pouf pulse](tp2/screenshots/Pouf.gif) 
  - [barrel pulse](tp2/screenshots/BarrelPulse.gif) 
- The feature to animate the components was implemented with the defined behaviour and specification. It were added to the xml scene elements to demonstrate it
  - [Barrel falling](tp2/screenshots/BarrelFallen.gif)
  - [Ball thrown from the window](tp2/screenshots/Ovni.gif)
- It was added to the interface the possibility to turn on/off the highlighted property of the components and a button to reset the scene animation
----

### [TP3 - Checkers Game 3D within a Scene](tp3)

- The new engine can handle sxs files as it did in tp2. This means that the features to be implemented in tp3 were implemented without rebuilding the full engine
- 2 new very realistic scenes were designed (adding to the one developed in tp2 and tp1) in order to play the checkers game in different environments
- The checkers game can be added to a scene by simply adding a new tag (checkers) to the scene xml file. Inside this tag, one can configure the main and auxiliar boards, the pieces, and the spotlight that will follow a moving piece
  - **Main Board**: set position and dimensions, tiles materials (light, dark and highlighted tile) and board walls material
  - **Auxiliar Board**: set position and dimensions, tiles materials (light and dark tile), board walls material and color of the font used to display the results during the game
  - **Pieces**: set the material of the pieces (player 1, player 2 and highlighted piece)
  - **Spotlight**: set the heght of the spotlight and all its illumination configurations, besides the position and the target that is automatically calculated based on the position of the piece that is being moved
- The auxiliar board has a vertical wall that shows in real time the [results of the game](tp3/screenshots/theme2CheckersSel.png) (players' score, players' turn time, players' total time spent and the total time of the game)
- The [main menu](tp3/screenshots/mainMenu.png) has a button to go te scene, 3 buttons to change the scene, and 2 more buttons to set game configurations as the maximum turn time and maximum player's time
- A checkers scene allow to start the game, pause it, restart it and go back to main menu with the press of some buttons
- About the game, it starts with all the pieces in the board and one can pick a piece and then a tile to move it. When a piece is picked [the tiles correspondent to valid moves for that piece are highlighted](tp3/screenshots/theme1CheckersSel.png)
- All the checkers pieces are always present in the scene and do not magically appear/disappear
- When a piece is collected, it is moved to the auxiliar board with a [smooth parabolic jump animation](tp3/screenshots/BecomeKing.gif)
- When a pawn piece is [made king](tp3/screenshots/BecomeKing.gif), a piece of the auxiliar board is moved a put on top of the pawn piece to make it a king. (If there is no piece in the auxiliar board, the future king waits for a piece to be collected to become a king)
- At the end of each turn, if the specific game camera is selected, the camera will turn over the board and change the view to the other player perspective. Although, it is possible to change it manually with a button tap
- During the game, a player can [undo](tp3/screenshots/Undo.gif) as many plays as he wants
- During the game, one can [replay](tp3/screenshots/GameReplay.gif) the game movie until that moment, and after that resume the game from where it was before
- When the game is over, even by time out or no more moves, [popup](tp3/screenshots/resultsMenu.png) appears with the results of the game, the option to go back to the scene and the option to replay the game movie
- When an invalid move is chosen, or a button is pressed and does not have any effect, a [popup](tp3/screenshots/InvalidMove.gif) appears with a message informing the user that the action is invalid
- The 2D interface was not removed to accomodate the features implemented before tp3, although it is not used in the checkers game. Instead, it is used a 3D interface based on buttons
- Scenes details can be found in the [README](tp3/README.md) file of tp3.
----

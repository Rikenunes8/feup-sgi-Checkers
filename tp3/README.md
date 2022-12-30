# SGI 2022/2023 - TP3

## Group T01G05

| Name             | Number    | E-Mail               |
| ---------------- | --------- | -------------------- |
| Rui Alves        | 201905853 | up201905853@fe.up.pt |
| Henrique Nunes   | 201906852 | up201906852@fe.up.pt |

----

## Project information

- The new engine can handle sxs files as it did in tp2. This means that the features to be implemented in tp3 were implemented without rebuilding the full engine.
- 2 new very realistic scenes were designed (adding to the one developed in tp2 and tp1) in order to play the checkers game in different environments.
- The checkers game can be added to a scene by simply adding a new tag (checkers) to the scene xml file. Inside this tag, one can configure the main and auxiliar boards, the pieces, and the spotlight that will follow a moving piece.
  - **Main Board**: set position and dimensions, tiles materials (light, dark and highlighted tile) and board walls material.
  - **Auxiliar Board**: set position and dimensions, tiles materials (light and dark tile), board walls material and color of the font used to display the results during the game
  - **Pieces**: set the material of the pieces (player 1, player 2 and highlighted piece)
  - **Spotlight**: set the heght of the spotlight and all its illumination configurations, besides the position and the target that is automatically calculated based on the position of the piece that is being moved.
- The auxiliar board has a vertical wall that show in real time the results of the game (players' score, players' turn time, players' total time spent and the total time of the game)
- The main menu has a button to go te scene, 3 buttons to change the scene, and 2 more buttons to set game configurations as the maximum turn time and maximum player's time.
- A checkers scene allow to start the game, pause it, restart it and go back to main menu with the press of some buttons.
- About the game, it starts with all the pieces in the board and one can pick a piece and then a tile to move it. When a piece is picked the tiles correspondent to valid moves for that piece are highlighted.
- All the checkers pieces are always present in the scene and do not magically appear/disappear.
- When a piece is collected, it is moved to the auxiliar board with a smooth parabolic jump animation.
- When a pawn piece is made king, a piece of the auxiliar board is moved a put on top of the pawn piece to make it a king. (If there is no piece in the auxiliar board, the future king waits for a piece to be collected to become a king)
- At the end of each turn, if the specific game camera is selected, the camera will turn over the board and change the view to the other player perspective. Although, it is possible to change it manually with a button tap.
- During the game, a player can undo as many plays as he wants.
- During the game, one can replay the game movie until that moment, and after that resume the game from where it was before.
- When the game is over, even by time out or no more moves, popup appears with the results of the game, the option to go back to the scene and the option to replay the game movie.
- The 2D interface was not removed to accomodate the features implemented before tp3, although it is not used in the checkers game. Instead, it is used a 3D interface based on buttons.

## Scenes
3 main scenes were designed and can be changed by clicking the buttons in the main menu. The 3 scenes are:

### FEUP garden
This scene is the same developed along [tp1](../tp1) and [tp2](../tp2/) but a checkers game was placed in the middle of the garden.

### FEUP "Queijos" class room
This scene represent the "Queijos" class room in FEUP in a very realistic way. The rows of chairs, and the steps are placed climbing the room. There is also the white board and the projector screen in the front of the room, as well as a door in each side of it. Not far from the white board there is the table with a desktop on it and the professor's desk with a checkers game above it.

### Living room
This scene is a living room of a rich and paixonate for games person. It has a wall gold frame containing a nice picture to motivate the board players. It has also a gold TV displaying a pool game and some poufs to one be able to accomodate them self. At the center of the room, there is a table and a chair in each, illuminated by ceiling lamp, that holds the checkers game.

----

## Issues/Problems

- All the features required were implemented
- There are still some doubts about the game rules, mostly when it refers to kings pieces. Despite that, the rules implemented are the ones that we understood from the [website](https://www.ultraboardgames.com/checkers/game-rules.php) given, and from the 2 first Google searches by online checkers games ([cardgames.io](https://cardgames.io/checkers/) and [247checkers.com](https://www.247checkers.com/)).
- No bugs were found in the final version of tp3.

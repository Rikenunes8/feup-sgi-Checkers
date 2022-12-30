import { CGFapplication } from '../lib/CGF.js';
import { XMLscene } from './XMLscene.js';
import { MyInterface } from './MyInterface.js';
import { MySceneGraph } from './MySceneGraph.js';

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
    function(m,key,value) {
      vars[decodeURIComponent(key)] = decodeURIComponent(value);
    });
    return vars;
}	 

function main() {
    // get file name provided in URL, e.g. http://localhost/myproj/?file=myfile.xml 
	// or use "demo.xml" as default (assumes files in subfolder "scenes", check MySceneGraph constructor) 
	
    const urlVars = getUrlVars();
    const themeNumber = urlVars["theme"];
    const theme = themeNumber == 1 || themeNumber == 2 || themeNumber == 3 ? `theme${themeNumber}.xml` : undefined;
    const filename = urlVars["file"] || theme || "theme1.xml";

	// Standard application, scene and interface setup
    var app = new CGFapplication(document.body);
    var myInterface = new MyInterface();
    var myScene = new XMLscene(myInterface, themeNumber);

    app.init();

    app.setScene(myScene);
    app.setInterface(myInterface);

    myInterface.setActiveCamera(myScene.camera);

	// create and load graph, and associate it to scene. 
	// Check console for loading errors
    var myGraph = new MySceneGraph(filename, myScene);
	
	// start
    app.run();
}

main();

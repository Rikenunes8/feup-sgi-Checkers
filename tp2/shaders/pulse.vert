attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform float timeFactor;
uniform float scale;

void main() {
    // TODO aVertexNormal is not normalized
	vec3 offset = aVertexNormal*scale*(sin(timeFactor*0.1)*0.5+0.5);

	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition+offset, 1.0);
}
#ifdef GL_ES
precision highp float;
#endif

uniform vec3 color;
uniform float timeFactor;

void main() {
    float frac = sin(timeFactor*0.1)*0.5+0.5;
    
	gl_FragColor =  vec4(mix(vec3(0.0,0.0,0.0), color, frac), 1.0);
}
#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main() {
	vec4 color = texture2D(uSampler, vTextureCoord);
	// use the color we want the text to be
	vec3 color3 = vec3(0.3, 0.3, 0.3);

	if (color.a < 0.5)
		discard;
	else
		gl_FragColor = color * vec4(color3, 1.0);
		
}



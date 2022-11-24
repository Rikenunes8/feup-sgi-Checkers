#version 300 es
precision highp float;

in vec4 vFinalColor;
in vec2 vTextureCoord;

in vec3 fcolor;         // TP2
in float ftimeFactor;   // TP2

out vec4 fragColor;

uniform sampler2D uSampler;

uniform bool uUseTexture;

void main() {
    float frac = ftimeFactor; // TP2
	
	// Branching should be reduced to a minimal. 
	// When based on a non-changing uniform, it is usually optimized.
	if (uUseTexture)
	{
		vec4 textureColor = texture(uSampler, vTextureCoord);
		fragColor = textureColor * vFinalColor;
	}
	else
		fragColor = vFinalColor;
    
    fragColor = mix(fragColor, vec4(fcolor, 1.0), frac); // TP2

}
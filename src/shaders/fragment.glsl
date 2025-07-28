precision mediump float;

uniform sampler2D u_previousFrame;
uniform float u_time;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform vec2 u_resolution;
uniform float u_blendWeight;


// ----- FBM Noise -----
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

// ----- Circle Helper -----
float circle(vec2 uv, float radius, float blur) {
  return smoothstep(radius + blur, radius - blur, length(uv));
}

// ----- Main Shader -----
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv -= 0.5;
  uv.x *= u_resolution.x / u_resolution.y;

  float time = u_time * 0.5;
  float r = length(uv);

  // FBM distortion
  float distortion = fbm(uv * 3.0 + vec2(time * 0.3, time * 0.1));
  uv += 0.03 * distortion * (u_treble + u_mid);

  // Ripple motion with bass
  float ripple = sin(20.0 * r - time * 5.0 + u_bass * 10.0);

  // Flow waves
  float flow = sin(12.0 * uv.y + time + u_treble * 5.0);

  // Circular glow
  float base = circle(uv, 0.3 + 0.05 * u_bass, 0.02 + 0.02 * u_mid);

  // Combined intensity
  float intensity = base * (0.2 + 0.1 * ripple * flow) + 0.2 * fbm(uv * 8.0);

  // Hue cycling and boost from treble
  float hue = mod(time * 0.1 + r + u_mid * 1.5, 1.0);
  vec3 color = vec3(hue, 0.6 + u_treble * 0.4, 0.5 + u_bass * 0.5);

  // Simple HSL-like to RGB approximation
  vec3 rgb = color * intensity;

  vec4 prev = texture2D(u_previousFrame, gl_FragCoord.xy / u_resolution);
  vec3 feedbackColor = mix(prev.rgb, rgb, 0.1); // 0.1 = low persistence
  gl_FragColor = vec4(feedbackColor * u_blendWeight, 1.0);
}


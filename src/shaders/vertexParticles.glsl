//
// uniform float u_time;
// uniform float u_bass;
// uniform float u_mid;
// uniform float u_treble;
// uniform vec2 u_resolution;
//
// attribute vec3 sphereTarget;
// attribute vec3 helixTarget;
//
// varying float v_alpha;
//
// float rand(vec3 co) {
//   return fract(sin(dot(co.xyz, vec3(12.9898, 78.233, 54.53))) * 43758.5453);
// }
//
// float noise(vec3 p) {
//   return rand(p + u_time);
// }
//
// void main() {
//   vec3 base = position;
//
//   float morphSphere = smoothstep(0.2, 0.8, u_bass);
//   float morphHelix = smoothstep(0.1, 0.6, u_mid);
//
//   // Blend toward target forms
//   vec3 target = mix(base, sphereTarget, morphSphere);
//   target = mix(target, helixTarget, morphHelix);
//
//   // Organic wobble
//   float wobbleStrength = 0.02 + u_treble * 0.03;
//   vec3 wobble = vec3(
//     noise(position * 3.0) - 0.5,
//     noise(position * 2.5 + 13.0) - 0.5,
//     noise(position * 1.5 - 5.0) - 0.5
//   ) * wobbleStrength;
//
//   vec3 finalPos = target + wobble;
//
//   v_alpha = 0.6 + 0.4 * u_bass;
//   gl_Position = vec4(finalPos, 1.0);
//   gl_PointSize = 2.0 + 6.0 * (u_bass + u_mid);
// }


uniform float u_time;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform vec2 u_resolution;

attribute vec3 sphereTarget;
attribute vec3 helixTarget;

varying float v_alpha;

// Random helper
float rand(vec3 co) {
  return fract(sin(dot(co.xyz, vec3(12.9898, 78.233, 54.53))) * 43758.5453);
}

// Noise based on time
float noise(vec3 p) {
  return rand(p + u_time);
}

void main() {
  vec3 base = position;

  // Morphing strengths based on audio input
  float morphSphere = clamp(pow(u_bass * 3.0, 2.0), 0.0, 1.0);
  float morphHelix  = clamp(pow(u_mid * 2.5, 1.8), 0.0, 1.0);

  // Morph positions
  vec3 target = mix(base, sphereTarget, morphSphere);
  target = mix(target, helixTarget, morphHelix);

  // Add audio-driven outward explosion effect
  float explode = pow(u_treble, 3.0) * 2.0;
  target += normalize(target + 0.0001) * explode;

  // Add twist effect over time
  float twist = sin(u_time * 2.0 + position.x * 10.0) * u_mid;
  mat2 rot = mat2(cos(twist), -sin(twist), sin(twist), cos(twist));
  target.xz = rot * target.xz;

  // Add wobble based on treble
  float wobbleStrength = 0.03 + pow(u_treble, 2.0) * 0.2;
  vec3 wobble = vec3(
    noise(position * 3.0) - 0.5,
    noise(position * 2.5 + 13.0) - 0.5,
    noise(position * 1.5 - 5.0) - 0.5
  ) * wobbleStrength;

  vec3 finalPos = target + wobble;

  // Fade alpha based on bass and treble
  v_alpha = 0.4 + 0.6 * max(u_bass, u_treble);

  gl_Position = vec4(finalPos, 1.0);
  gl_PointSize = 2.0 + 10.0 * (u_bass + u_mid);
}


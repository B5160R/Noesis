precision mediump float;

varying float v_alpha;

void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  float fade = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(1.0, 0.7, 1.0, v_alpha * fade);
}


import * as THREE from "three";
import { createAudioAnalyzer } from "./audio/audio.js";
import { getFrequencyBands } from "./audio/getFrequencyBands.js";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import vertexShaderParticles from "./shaders/vertexParticles.glsl";
import fragmentShaderParticles from "./shaders/fragmentParticles.glsl";

// --- Setup ---
let scene = new THREE.Scene();
let camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
camera.position.z = 1.5;
let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Render targets for feedback
const rtA = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
const rtB = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
let currentRT = rtA;
let nextRT = rtB;

// Blend weights
let trailWeight = 1.0;
let particleWeight = 1.0;
let targetTrail = 1.0;
let targetParticle = 1.0;

// --- Trail Setup ---
const trailUniforms = {
  u_time: { value: 0.0 },
  u_bass: { value: 0.0 },
  u_mid: { value: 0.0 },
  u_treble: { value: 0.0 },
  u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  u_previousFrame: { value: null },
  u_blendWeight: { value: trailWeight },
};

const trailMaterial = new THREE.ShaderMaterial({
  uniforms: trailUniforms,
  vertexShader,
  fragmentShader,
  transparent: true,
});

const trailGeometry = new THREE.PlaneGeometry(2, 2);
const trailMesh = new THREE.Mesh(trailGeometry, trailMaterial);
scene.add(trailMesh);

// --- Particles Setup ---
const PARTICLE_COUNT = 10000;
const positions = new Float32Array(PARTICLE_COUNT * 10);
const sphereTargets = new Float32Array(PARTICLE_COUNT * 100);
const helixTargets = new Float32Array(PARTICLE_COUNT * 100);

// Random initial positions inside cube [-1,1]
for (let i = 0; i < PARTICLE_COUNT; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 2.0;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 2.0;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 2.0;
}

// Generate sphere targets: Fibonacci Sphere for even distribution
for (let i = 0; i < PARTICLE_COUNT; i++) {
  const index = i + 0.5;
  const phi = Math.acos(1 - 2 * index / PARTICLE_COUNT);
  const theta = Math.PI * (1 + Math.sqrt(5)) * index;

  const r = 0.7; // radius of sphere

  sphereTargets[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
  sphereTargets[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  sphereTargets[i * 3 + 2] = r * Math.cos(phi);
}

// Generate helix targets: Helix around Y axis
const helixRadius = 0.5;
const helixTurns = 8;
const helixHeight = 2.0;

for (let i = 0; i < PARTICLE_COUNT; i++) {
  const t = i / PARTICLE_COUNT;
  const angle = helixTurns * 2 * Math.PI * t;
  const y = helixHeight * (t - 0.5);

  helixTargets[i * 3 + 0] = helixRadius * Math.cos(angle);
  helixTargets[i * 3 + 1] = y;
  helixTargets[i * 3 + 2] = helixRadius * Math.sin(angle);
}

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
particleGeometry.setAttribute("sphereTarget", new THREE.BufferAttribute(sphereTargets, 3));
particleGeometry.setAttribute("helixTarget", new THREE.BufferAttribute(helixTargets, 3));

const particleUniforms = {
  u_time: { value: 0 },
  u_bass: { value: 0 },
  u_mid: { value: 0 },
  u_treble: { value: 0 },
  u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  u_blendWeight: { value: particleWeight },
};

const particleMaterial = new THREE.ShaderMaterial({
  uniforms: particleUniforms,
  vertexShader: vertexShaderParticles,
  fragmentShader: fragmentShaderParticles,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

// --- Mode Switching ---
let visualMode = "hybrid";
function setMode(mode) {
  visualMode = mode;
  if (mode === "trail") {
    targetTrail = 1.0;
    targetParticle = 0.0;
  } else if (mode === "particles") {
    targetTrail = 0.0;
    targetParticle = 1.0;
  } else {
    targetTrail = 1.0;
    targetParticle = 1.0;
  }
}

let lastSwitch = 0;
const switchInterval = 15;
const modes = ["trail", "particles", "hybrid"];

// --- Animation Loop ---
async function init() {
  const { getFrequencyData } = await createAudioAnalyzer();

  function animate(time) {
    requestAnimationFrame(animate);

    const delta = 0.01;
    const seconds = time * 0.001;

    trailUniforms.u_time.value += delta;
    particleUniforms.u_time.value += delta;

    // Update mode
    if (seconds - lastSwitch > switchInterval) {
      const next = modes[Math.floor(Math.random() * modes.length)];
      setMode(next);
      lastSwitch = seconds;
    }
    setMode(modes[1]);

    // Smooth transition
    const smoothing = 0.05;
    trailWeight += (targetTrail - trailWeight) * smoothing;
    particleWeight += (targetParticle - particleWeight) * smoothing;

    // Update audio data
    const freqData = getFrequencyData();
    const { bass, mid, treble } = getFrequencyBands(freqData);

    const bassVal = Math.min(1.0, Math.pow(bass * 2.5, 1.5));
    const midVal = Math.min(1.0, Math.pow(mid * 2.0, 1.3));
    const trebleVal = Math.min(1.0, Math.pow(treble * 2.5, 1.2));

    trailUniforms.u_bass.value = bassVal;
    trailUniforms.u_mid.value = midVal;
    trailUniforms.u_treble.value = trebleVal;
    trailUniforms.u_previousFrame.value = currentRT.texture;
    trailUniforms.u_blendWeight.value = trailWeight;

    particleUniforms.u_bass.value = bassVal;
    particleUniforms.u_mid.value = midVal;
    particleUniforms.u_treble.value = trebleVal;
    particleUniforms.u_blendWeight.value = particleWeight;

    // Render feedback to framebuffer
    renderer.setRenderTarget(nextRT);
    renderer.render(scene, camera);

    // Final render
    renderer.setRenderTarget(null);
    scene.remove(particles);
    renderer.render(scene, camera);
    scene.add(particles);
    renderer.render(scene, camera);

    // Swap targets
    [currentRT, nextRT] = [nextRT, currentRT];
  }

  animate();
}

init();


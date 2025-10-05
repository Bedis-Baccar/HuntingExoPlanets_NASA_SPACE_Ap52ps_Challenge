// Lightweight Three.js starfield & nebula background for MPGA
// Client-only: call initThreeBackground(container) after DOM mounts.

import * as THREE from 'three';

let renderer, scene, camera, animationId, resizeHandler, mouseHandler, scrollHandler;
let stars, nebula;

const STAR_COUNT = 2500; // Balanced for performance

function createStars() {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(STAR_COUNT * 3);
  const colors = new Float32Array(STAR_COUNT * 3);
  const color = new THREE.Color();

  for (let i = 0; i < STAR_COUNT; i++) {
    const i3 = i * 3;
    // Distribute in a sphere-ish volume
    const radius = THREE.MathUtils.randFloat(50, 400);
    const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);

    // Slight warm/cool star color variation around off-white
    const hue = THREE.MathUtils.randFloat(0.02, 0.12); // subtle golden
    color.setHSL(hue, 0.4, THREE.MathUtils.randFloat(0.6, 0.9));
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 1.1,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
  });

  stars = new THREE.Points(geometry, material);
  scene.add(stars);
}

function createNebula() {
  // Procedural nebula using large transparent planes with gradient shaders could be heavier
  // Here: two overlapping foggy sprites using existing textures generated on canvas.
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(256, 256, 40, 256, 256, 256);
  gradient.addColorStop(0, 'rgba(199,150,101,0.55)'); // #c99665
  gradient.addColorStop(0.35, 'rgba(167,117,78,0.32)'); // #a7754e
  gradient.addColorStop(1, 'rgba(37,38,39,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0,0,512,512);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, opacity: 0.6, blending: THREE.AdditiveBlending });

  nebula = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const sprite = new THREE.Sprite(material.clone());
    sprite.scale.setScalar(600 + i * 200);
    sprite.position.set(
      THREE.MathUtils.randFloatSpread(200),
      THREE.MathUtils.randFloatSpread(120),
      -200 - i * 150
    );
    sprite.material.opacity = 0.25 + i * 0.08;
    nebula.add(sprite);
  }
  scene.add(nebula);
}

function handleResize(container) {
  const { clientWidth: w, clientHeight: h } = container;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

function animate() {
  animationId = requestAnimationFrame(animate);

  // Subtle autonomous drift
  const t = performance.now() * 0.00005;
  if (stars) stars.rotation.y = t * 5;
  if (nebula) nebula.rotation.z = t * 2;

  renderer.render(scene, camera);
}

function initThreeBackground(container) {
  if (!container || typeof window === 'undefined') return () => {};

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 1, 2000);
  camera.position.z = 120;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.pointerEvents = 'none';
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.inset = '0';

  container.appendChild(renderer.domElement);

  createNebula();
  createStars();

  // Parallax via mouse and scroll
  mouseHandler = (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    camera.position.x += (x * 10 - camera.position.x) * 0.02;
    camera.position.y += (-y * 10 - camera.position.y) * 0.02;
  };
  window.addEventListener('pointermove', mouseHandler, { passive: true });

  scrollHandler = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    camera.position.z = 120 + scrollY * 0.02; // gentle dolly
  };
  window.addEventListener('scroll', scrollHandler, { passive: true });

  resizeHandler = () => handleResize(container);
  window.addEventListener('resize', resizeHandler);

  animate();

  return function cleanup() {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resizeHandler);
    window.removeEventListener('pointermove', mouseHandler);
    window.removeEventListener('scroll', scrollHandler);
    if (stars) {
      stars.geometry.dispose();
      stars.material.dispose();
    }
    if (nebula) {
      nebula.children.forEach(s => s.material.dispose());
    }
    renderer.dispose();
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  };
}

export { initThreeBackground };

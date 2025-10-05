// Enhanced Pluto Orbit Visualization (Hero-only)
// Features:
//  - Textured Pluto with rotation
//  - Elliptical orbit around a glowing "sun" point light
//  - Orbital ring (faint) + subtle particle starfield
//  - Adaptive scaling on small screens
//  - Respect prefers-reduced-motion
//  - Pauses on tab visibility change
//  - Defensive cleanup to prevent memory leaks

(function() {
  const texturePath = '/pluto.png'; // fallback texture
  const containerId = 'pluto-orbit-container';
  const OBJ_PATH = '/static/models/custom_pluto.obj';
  const MTL_PATH = '/static/models/custom_pluto.mtl';
  let scene, camera, renderer, pluto, animationId, sunMesh, stars; 
  let startTime = performance.now();
  let containerEl;
  let reducedMotion = false;

  function init() {
    if (typeof THREE === 'undefined') {
      console.warn('[pluto-orbit] THREE not available; skipping');
      return;
    }
    containerEl = document.getElementById(containerId);
    if (!containerEl) {
      console.warn('[pluto-orbit] Container not found');
      return;
    }

    const { clientWidth: width, clientHeight: height } = containerEl;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050506, 0.018);
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  const baseScale = width < 640 ? 0.75 : 1; // scale down on very small screens
  camera.position.set(0, 0, 28 * baseScale);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    containerEl.appendChild(renderer.domElement);

    // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambient);
  const pointLight = new THREE.PointLight(0xffd5a1, 2.2, 160, 2);
  pointLight.position.set(0,0,0);
  scene.add(pointLight);

  // Sun core mesh (billboard-ish small sphere with emissive material)
  const sunGeo = new THREE.SphereGeometry(2.2 * baseScale, 32, 32);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xffcf88 });
  sunMesh = new THREE.Mesh(sunGeo, sunMat);
  scene.add(sunMesh);

  addOrbitRing(baseScale);
  addStars();

    // Try loading custom OBJ/MTL model first
    loadCustomModel(baseScale).catch(() => {
      // Fallback sphere if custom fails
      createFallbackSphere(baseScale);
    });

    window.addEventListener('resize', onResize);
    animate();
  }

  function loadCustomModel(scale=1) {
    return new Promise((resolve, reject) => {
      if (!THREE.MTLLoader || !THREE.OBJLoader) {
        console.warn('[pluto-orbit] OBJ/MTL loaders not found, fallback to sphere');
        reject();
        return;
      }
      const mtlLoader = new THREE.MTLLoader();
      mtlLoader.setResourcePath('/static/models/');
      mtlLoader.setPath('/static/models/');
      mtlLoader.load(MTL_PATH.split('/').pop(), (materials) => {
        materials.preload();
        const objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('/static/models/');
        objLoader.load(OBJ_PATH.split('/').pop(), (object) => {
          object.traverse(child => {
            if (child.isMesh) {
              child.castShadow = false;
              child.receiveShadow = false;
              if (child.material && child.material.map) {
                child.material.map.colorSpace = THREE.SRGBColorSpace;
              }
            }
          });
          object.scale.set(2.2*scale,2.2*scale,2.2*scale);
          pluto = object;
          scene.add(pluto);
          resolve(pluto);
        }, undefined, (err) => {
          console.warn('[pluto-orbit] OBJ load failed:', err);
          reject(err);
        });
      }, undefined, (err) => {
        console.warn('[pluto-orbit] MTL load failed:', err);
        reject(err);
      });
    });
  }

  function createFallbackSphere(scale=1) {
    const geometry = new THREE.SphereGeometry(5 * scale, 48, 48);
    const loader = new THREE.TextureLoader();
    loader.load(
      texturePath,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, metalness: 0.05, emissive: 0x2a0d0a, emissiveIntensity: 0.15 });
        pluto = new THREE.Mesh(geometry, material);
        scene.add(pluto);
      },
      undefined,
      () => {
        const material = new THREE.MeshStandardMaterial({ color: 0xc9b8aa });
        pluto = new THREE.Mesh(geometry, material);
        scene.add(pluto);
      }
    );
  }

  function onResize() {
    if (!renderer || !camera || !containerEl) return;
    const { clientWidth: width, clientHeight: height } = containerEl;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function animate() {
    animationId = requestAnimationFrame(animate);
    const elapsed = (performance.now() - startTime) * 0.001; // seconds

    if (pluto && !reducedMotion) {
      // Rotation (scaled for reduced motion awareness)
      pluto.rotation.y += 0.0025;
      pluto.rotation.x += 0.0008;

      // Elliptical orbit parameters
      const a = 14; // semi-major
      const b = 9;  // semi-minor
      const speed = 0.12; // angular speed
      const angle = elapsed * speed;
      pluto.position.set(
        Math.cos(angle) * a,
        Math.sin(angle * 0.7) * 2,
        Math.sin(angle) * b
      );
    }

    if (stars && !reducedMotion) {
      stars.rotation.y += 0.0006;
      stars.rotation.x += 0.00015;
    }

    renderer.render(scene, camera);
  }

  function addOrbitRing(scale=1) {
    const ringGeom = new THREE.RingGeometry(14 * 0.98 * scale, 14 * 1.02 * scale, 128, 1);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x6c4f42, side: THREE.DoubleSide, transparent: true, opacity: 0.18 });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
  }

  function addStars() {
    const starCount = 400;
    const positions = new Float32Array(starCount * 3);
    for (let i=0;i<starCount;i++) {
      const r = 80 + Math.random()*40;
      const theta = Math.random()*Math.PI*2;
      const phi = Math.acos((Math.random()*2)-1);
      positions[i*3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i*3+2] = r * Math.cos(phi);
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions,3));
    const mat = new THREE.PointsMaterial({ color: 0xfcecce, size: 0.7, sizeAttenuation: true, transparent: true, opacity: 0.55 });
    stars = new THREE.Points(geom, mat);
    scene.add(stars);
  }

  function cleanup() {
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener('resize', onResize);
    if (renderer) {
      renderer.dispose();
    }
    if (scene) {
      scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animationId) cancelAnimationFrame(animationId);
    } else {
      startTime = performance.now(); // reset timing to avoid large jump
      animate();
    }
  });

  // Reduced motion media query
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  function handleMotionPref(e){
    reducedMotion = e.matches;
  }
  handleMotionPref(media);
  media.addEventListener('change', handleMotionPref);

  window.addEventListener('beforeunload', cleanup);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

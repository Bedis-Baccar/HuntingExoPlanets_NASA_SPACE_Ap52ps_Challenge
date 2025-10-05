import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Lazy load loaders only on client (OBJ + MTL optional)
let OBJLoaderClass = null;
let MTLLoaderClass = null;
let GLTFLoaderClass = null;
async function getOBJLoader() {
  if (OBJLoaderClass) return OBJLoaderClass;
  const mod = await import('three/examples/jsm/loaders/OBJLoader.js');
  OBJLoaderClass = mod.OBJLoader;
  return OBJLoaderClass;
}
async function getMTLLoader() {
  if (MTLLoaderClass) return MTLLoaderClass;
  const mod = await import('three/examples/jsm/loaders/MTLLoader.js');
  MTLLoaderClass = mod.MTLLoader;
  return MTLLoaderClass;
}
async function getGLTFLoader() {
  if (GLTFLoaderClass) return GLTFLoaderClass;
  const mod = await import('three/examples/jsm/loaders/GLTFLoader.js');
  GLTFLoaderClass = mod.GLTFLoader;
  return GLTFLoaderClass;
}

function PlutoModel({
  emissive = '#b83c2c',
  path = '/models/pluto.obj',
  glbPath = '/models/pluto.glb',
  useGLBFirst = true,
  mtlPath,
  texturePath,
  preserveOriginal = true,
  targetSize = 10,
  applyEmissiveTint = false,
  doubleSided = true,
  debug = false,
  debugRandomColors = false,
  forceBasic = false
}) {
  const groupRef = useRef();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let object3d = null;
        let loadedType = 'none';

        if (useGLBFirst && glbPath) {
          try {
            const GLTFLoader = await getGLTFLoader();
            const gltfLoader = new GLTFLoader();
            const gltf = await new Promise((resolve, reject) => {
              gltfLoader.load(glbPath, resolve, undefined, reject);
            });
            if (!cancelled) {
              object3d = gltf.scene || gltf.scenes?.[0];
              loadedType = 'glb';
            }
          } catch (gErr) {
            if (debug) console.warn('[PlutoModel] GLB load failed, falling back to OBJ', gErr);
          }
        }

        if (!object3d) {
          const Loader = await getOBJLoader();
          let materials = null;
          if (mtlPath) {
            try {
              const MTLLoader = await getMTLLoader();
              const mtlLoader = new MTLLoader();
              materials = await new Promise((resolve, reject) => {
                mtlLoader.load(mtlPath, resolve, undefined, reject);
              });
              if (materials) materials.preload();
            } catch (mtlErr) {
              console.warn('[PlutoModel] MTL load failed, continuing without materials', mtlErr);
            }
          }
          const loader = new Loader();
          if (materials) loader.setMaterials(materials);
          object3d = await new Promise((resolve, reject) => {
            loader.load(path, resolve, undefined, reject);
          });
          loadedType = 'obj';
        }

        const obj = object3d;
        if (!obj) throw new Error('Model load produced no object');
        let meshCount = 0;
        obj.traverse(child => {
          if (child.isMesh) {
            child.castShadow = false;
            child.receiveShadow = false;
            if (child.geometry && !child.geometry.attributes.normal) {
              child.geometry.computeVertexNormals();
            }
            const mat = child.material;
            if (texturePath && mat && !Array.isArray(mat) && !forceBasic) {
              const tex = new THREE.TextureLoader().load(texturePath, (t)=>{ t.colorSpace = THREE.SRGBColorSpace; });
              mat.map = tex;
              mat.needsUpdate = true;
            }
            const simpleReplace = !preserveOriginal || forceBasic;
            if (simpleReplace) {
              const baseColor = mat && mat.color ? mat.color : new THREE.Color('#c9b8aa');
              child.material = new THREE.MeshStandardMaterial({
                color: debugRandomColors ? new THREE.Color(Math.random(), Math.random(), Math.random()) : baseColor,
                roughness: 0.85,
                metalness: 0.1,
                emissive: applyEmissiveTint ? new THREE.Color(emissive) : new THREE.Color('#000'),
                emissiveIntensity: applyEmissiveTint ? 0.25 : 0.0
              });
            } else {
              if (applyEmissiveTint && mat && !Array.isArray(mat)) {
                mat.emissive = new THREE.Color(emissive);
                mat.emissiveIntensity = 0.15;
              }
              if (mat && !Array.isArray(mat) && !mat.map && mat.color && mat.color.r < 0.05 && mat.color.g < 0.05 && mat.color.b < 0.05) {
                mat.color = new THREE.Color('#b5aca6');
              }
            }
            if (doubleSided && child.material && !Array.isArray(child.material)) {
              child.material.side = THREE.DoubleSide;
            }
            if (debug && child.material && !Array.isArray(child.material)) {
              console.log('[PlutoModel] Material', child.material.name || '(unnamed)', child.material.type, child.material);
            }
            meshCount++;
          }
        });
        const bbox = new THREE.Box3().setFromObject(obj);
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          const scale = targetSize / maxDim;
          obj.scale.setScalar(scale);
          const center = new THREE.Vector3();
          bbox.getCenter(center);
          obj.position.sub(center.multiplyScalar(scale));
        } else {
          console.warn('[PlutoModel] Bounding box dimension zero; using fallback scale');
          obj.scale.setScalar(2.5);
        }
        groupRef.current.add(obj);
        setLoaded(true);
        console.info('[PlutoModel] Loaded model', { meshCount, type: loadedType });
      } catch (e) {
        if (!cancelled) setError(e);
      }
    })();
    return () => { cancelled = true; };
  }, [path, glbPath, useGLBFirst, emissive, mtlPath, texturePath, preserveOriginal, targetSize, applyEmissiveTint, doubleSided, debug, debugRandomColors, forceBasic]);

  // Placeholder sphere if model fails or still loading
  return (
    <group ref={groupRef}>
      {!loaded && !error && (
        <mesh>
          <sphereGeometry args={[5, 32, 32]} />
          <meshStandardMaterial emissive={new THREE.Color(emissive)} emissiveIntensity={0.15} color={'#7a6d64'} roughness={0.9} />
        </mesh>
      )}
      {error && (
        <mesh>
          <icosahedronGeometry args={[5, 1]} />
          <meshStandardMaterial color="#b83c2c" wireframe />
        </mesh>
      )}
    </group>
  );
}

function OrbitingPluto({ orbitA = 35, orbitB = 22, scaleMultiplier = 1, modelSize = 10, centerOffsetX = 0, centerOffsetZ = 0, ...rest }) {
  const group = useRef();
  const rotationRef = useRef();
  const { clock, size } = useThree();
  const ellipse = useMemo(() => ({ a: orbitA, b: orbitB }), [orbitA, orbitB]); // semi-major/minor axes

  useFrame(() => {
    const t = clock.getElapsedTime() * 0.1; // slow orbit
    const angle = t % (Math.PI * 2);
  const x = Math.cos(angle) * ellipse.a + centerOffsetX;
  const z = Math.sin(angle) * ellipse.b + centerOffsetZ;
    if (group.current) {
      group.current.position.set(x, 5, z);
      group.current.rotation.y += 0.005; // spin
    }
  });

  // Slight adaptive scale for small screens
  const baseScale = size.width < 640 ? 0.4 : size.width < 1024 ? 0.6 : 0.8;
  const scale = baseScale * scaleMultiplier;

  return (
    <group ref={group} scale={scale}>
      {/* Neutral, fuller lighting for accurate albedo appearance */}
      <ambientLight intensity={0.6} />
      <hemisphereLight args={[0x888888, 0x111111, 0.55]} />
      <directionalLight position={[25, 40, 20]} intensity={0.9} color={'#ffffff'} castShadow={false} />
      <directionalLight position={[-35, -10, -25]} intensity={0.25} color={'#c9c9ff'} />
      <group ref={rotationRef}>
        <PlutoModel targetSize={modelSize} {...rest} />
      </group>
      {/* Simple emissive aura / glow shell */}
      <mesh scale={1.4}>
        <sphereGeometry args={[5.5, 32, 32]} />
        <meshBasicMaterial color={'#b83c2c'} transparent opacity={0.06} />
      </mesh>
    </group>
  );
}

/**
 * PlutoOrbit
 * High-level component rendering a softly orbiting, spinning Pluto model.
 * Sizing & Orbit Controls:
 *  - modelSize: Target bounding-box max dimension (world units) the OBJ will be normalized to.
 *  - scaleMultiplier: Multiplies responsive group scale (use for quick "make it bigger" tweaks).
 *  - orbitA / orbitB: Semi-major / semi-minor axes of elliptical orbit path.
 * Material / Appearance:
 *  - preserveOriginal: Keep original OBJ/MTL materials instead of replacing with standard.
 *  - mtlPath / texturePath: Optional material + diffuse texture asset paths.
 *  - emissive / applyEmissiveTint: Light self-glow tint controls.
 * Debug / Misc:
 *  - debug, debugRandomColors, forceBasic, doubleSided for material & lighting diagnostics.
 */
export default function PlutoOrbit({
  className = '',
  inline = false,
  height = 360,
  preserveOriginal = true,
  glbPath = '/models/pluto.glb',
  useGLBFirst = true,
  mtlPath,
  texturePath,
  emissive = '#b83c2c',
  applyEmissiveTint = false,
  aura = true,
  debug = false,
  doubleSided = true,
  debugRandomColors = false,
  forceBasic = false,
  modelSize = 10,
  scaleMultiplier = 1,
  orbitA = 35,
  orbitB = 22,
  centerOffsetX = 0,
  centerOffsetZ = 0
}) {
  // Reduced motion detection
  const prefersReducedMotion = useMemo(() => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  if (prefersReducedMotion) return null; // Skip heavy 3D for accessibility

  const containerClasses = inline
    ? `relative pointer-events-none w-full ${className}`
    : `pointer-events-none absolute inset-0 -z-10 ${className}`;

  return (
    <div className={containerClasses} aria-hidden="true" style={inline ? { height } : undefined}>
      <Canvas
        dpr={[1, 1.8]}
        camera={{ position: [0, 25, 65], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.outputEncoding = THREE.sRGBEncoding;
        }}
      >
        {!inline && <fog attach="fog" args={[ '#050506', 60, 180 ]} />}
        <OrbitingPluto
          preserveOriginal={preserveOriginal}
          glbPath={glbPath}
          useGLBFirst={useGLBFirst}
          mtlPath={mtlPath}
          texturePath={texturePath}
          emissive={emissive}
          applyEmissiveTint={applyEmissiveTint}
          debug={debug}
            doubleSided={doubleSided}
          debugRandomColors={debugRandomColors}
          forceBasic={forceBasic}
          modelSize={modelSize}
          scaleMultiplier={scaleMultiplier}
          orbitA={orbitA}
          orbitB={orbitB}
          centerOffsetX={centerOffsetX}
          centerOffsetZ={centerOffsetZ}
        />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}

// (Optional) Could add a prefetch for OBJ via fetch(path) but not required.
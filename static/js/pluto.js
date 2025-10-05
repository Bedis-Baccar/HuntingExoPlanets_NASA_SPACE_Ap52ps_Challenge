/**
 * Pluto 3D Orbit Visualization
 * Vanilla Three.js implementation (replaces react-three-fiber)
 */

export class PlutoOrbit {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.plutoModel = null;
        this.animationId = null;
        this.clock = new THREE.Clock();
        
        this.init();
    }

    /**
     * Initialize Three.js scene
     */
    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = null; // Transparent
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(25, 15, 25);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace; // Updated API
        
        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        this.scene.add(directionalLight);
        
        const pointLight = new THREE.PointLight(0xb83c2c, 0.4);
        pointLight.position.set(-10, 5, -10);
        this.scene.add(pointLight);
        
        // Load Pluto model
        this.loadPluto();
        
        // Create orbit path
        this.createOrbitPath();
        
        // Add stars
        this.createStarField();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Start animation
        this.animate();
    }

    /**
     * Load Pluto 3D model (try GLB first, fallback to OBJ)
     */
    async loadPluto() {
        const glbPath = '/static/models/pluto.glb';
        const objPath = '/static/models/pluto.obj';
        const mtlPath = '/static/models/pluto.mtl';
        
        let loaded = false;
        
        // Try GLB first
        if (typeof THREE.GLTFLoader !== 'undefined') {
            try {
                const loader = new THREE.GLTFLoader();
                const gltf = await new Promise((resolve, reject) => {
                    loader.load(glbPath, resolve, undefined, reject);
                });
                
                this.plutoModel = gltf.scene || gltf.scenes[0];
                loaded = true;
                console.log('[PlutoOrbit] Loaded GLB model');
            } catch (error) {
                console.warn('[PlutoOrbit] GLB load failed, trying OBJ:', error);
            }
        }
        
        // Fallback to OBJ + MTL
        if (!loaded && typeof THREE.OBJLoader !== 'undefined') {
            try {
                // Try to load MTL first
                let materials = null;
                if (typeof THREE.MTLLoader !== 'undefined') {
                    try {
                        const mtlLoader = new THREE.MTLLoader();
                        materials = await new Promise((resolve, reject) => {
                            mtlLoader.load(mtlPath, resolve, undefined, reject);
                        });
                        materials.preload();
                    } catch (mtlError) {
                        console.warn('[PlutoOrbit] MTL load failed:', mtlError);
                    }
                }
                
                // Load OBJ
                const objLoader = new THREE.OBJLoader();
                if (materials) {
                    objLoader.setMaterials(materials);
                }
                
                this.plutoModel = await new Promise((resolve, reject) => {
                    objLoader.load(objPath, resolve, undefined, reject);
                });
                
                loaded = true;
                console.log('[PlutoOrbit] Loaded OBJ model');
            } catch (error) {
                console.error('[PlutoOrbit] OBJ load failed:', error);
            }
        }
        
        // If model loaded, process and add to scene
        if (this.plutoModel) {
            this.processPlutoModel();
            this.scene.add(this.plutoModel);
        } else {
            // Fallback: create a simple sphere
            console.warn('[PlutoOrbit] Creating fallback sphere');
            this.createFallbackPluto();
        }
    }

    /**
     * Process the loaded Pluto model
     */
    processPlutoModel() {
        // Traverse and enhance materials
        this.plutoModel.traverse((child) => {
            if (child.isMesh) {
                // Compute normals if missing
                if (child.geometry && !child.geometry.attributes.normal) {
                    child.geometry.computeVertexNormals();
                }
                
                // Enhance material
                const mat = child.material;
                if (mat && !Array.isArray(mat)) {
                    // Add subtle emissive glow
                    mat.emissive = new THREE.Color('#b83c2c');
                    mat.emissiveIntensity = 0.15;
                    mat.roughness = 0.85;
                    mat.metalness = 0.1;
                }
            }
        });
        
        // Scale and center the model
        const bbox = new THREE.Box3().setFromObject(this.plutoModel);
        const size = new THREE.Vector3();
        bbox.getSize(size);
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 3; // Desired size in scene units
        
        if (maxDim > 0) {
            const scale = targetSize / maxDim;
            this.plutoModel.scale.setScalar(scale);
            
            const center = new THREE.Vector3();
            bbox.getCenter(center);
            this.plutoModel.position.sub(center.multiplyScalar(scale));
        }
    }

    /**
     * Create fallback sphere if model fails to load
     */
    createFallbackPluto() {
        const geometry = new THREE.SphereGeometry(3, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0xc9b8aa,
            emissive: 0xb83c2c,
            emissiveIntensity: 0.2,
            roughness: 0.8,
            metalness: 0.1
        });
        
        this.plutoModel = new THREE.Mesh(geometry, material);
        this.scene.add(this.plutoModel);
    }

    /**
     * Create orbital path
     */
    createOrbitPath() {
        const curve = new THREE.EllipseCurve(
            0, 0,           // center x, y
            15, 12,         // x radius, y radius
            0, 2 * Math.PI, // start angle, end angle
            false,          // clockwise
            0               // rotation
        );
        
        const points = curve.getPoints(100);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0xb83c2c,
            opacity: 0.3,
            transparent: true
        });
        
        const orbitLine = new THREE.Line(geometry, material);
        orbitLine.rotation.x = Math.PI / 2; // Make it horizontal
        this.scene.add(orbitLine);
    }

    /**
     * Create star field background
     */
    createStarField() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 800;
        const positions = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 200;     // x
            positions[i + 1] = (Math.random() - 0.5) * 200; // y
            positions[i + 2] = (Math.random() - 0.5) * 200; // z
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5,
            transparent: true,
            opacity: 0.6
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
    }

    /**
     * Animation loop
     */
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        const elapsed = this.clock.getElapsedTime();
        
        // Rotate Pluto
        if (this.plutoModel) {
            this.plutoModel.rotation.y = elapsed * 0.15;
            
            // Orbit motion (elliptical path)
            const angle = elapsed * 0.2;
            const radiusX = 15;
            const radiusZ = 12;
            this.plutoModel.position.x = Math.cos(angle) * radiusX;
            this.plutoModel.position.z = Math.sin(angle) * radiusZ;
        }
        
        // Gentle camera movement
        this.camera.position.x = Math.sin(elapsed * 0.1) * 2 + 25;
        this.camera.lookAt(0, 0, 0);
        
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Cleanup
     */
    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        window.removeEventListener('resize', () => this.onWindowResize());
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.scene) {
            this.scene.traverse((object) => {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }
    }
}

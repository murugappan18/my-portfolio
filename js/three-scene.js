// =================================================================
// Hero 3D Scene — particles + floating wireframe geometry
// Uses Three.js (loaded via importmap from CDN)
// =================================================================

import * as THREE from 'three';

const canvas = document.getElementById('hero-canvas');
if (!canvas) {
  console.warn('hero-canvas not found');
} else {
  initScene(canvas);
}

function initScene(canvas) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 8;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Theme-aware colors
  const colors = {
    blue: new THREE.Color(0x3b82f6),
    violet: new THREE.Color(0x8b5cf6),
  };

  // ----- Particles -----
  const particleCount = 1500;
  const positions = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 30;
    positions[i3 + 1] = (Math.random() - 0.5) * 20;
    positions[i3 + 2] = (Math.random() - 0.5) * 20;

    const mix = Math.random();
    const c = colors.blue.clone().lerp(colors.violet, mix);
    particleColors[i3] = c.r;
    particleColors[i3 + 1] = c.g;
    particleColors[i3 + 2] = c.b;

    sizes[i] = Math.random() * 0.05 + 0.02;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const particleMat = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ----- Floating wireframe geometry -----
  const shapes = [];

  function makeShape(geometry, position, color) {
    const wireMat = new THREE.MeshBasicMaterial({
      color,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const mesh = new THREE.Mesh(geometry, wireMat);
    mesh.position.set(...position);
    mesh.userData = {
      rotSpeedX: (Math.random() - 0.5) * 0.005,
      rotSpeedY: (Math.random() - 0.5) * 0.005,
      floatOffset: Math.random() * Math.PI * 2,
      basePos: [...position],
    };
    scene.add(mesh);
    shapes.push(mesh);
    return mesh;
  }

  makeShape(new THREE.IcosahedronGeometry(1.2, 0), [-5, 1.5, -2], 0x8b5cf6);
  makeShape(new THREE.OctahedronGeometry(1.0, 0), [5, -1, -1], 0x3b82f6);
  makeShape(new THREE.TorusGeometry(0.8, 0.3, 16, 50), [-4, -2, 1], 0x06b6d4);
  makeShape(new THREE.TetrahedronGeometry(1.0, 0), [4.5, 2, 0], 0xec4899);
  makeShape(new THREE.DodecahedronGeometry(0.7, 0), [0, -3.5, -3], 0x8b5cf6);

  // Subtle ambient glow via a giant transparent sphere - skip; particles + shapes is enough

  // ----- Mouse parallax -----
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMouseMove = (e) => {
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener('mousemove', onMouseMove);

  // Touch support
  window.addEventListener('touchmove', (e) => {
    if (e.touches[0]) {
      mouse.tx = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
    }
  });

  // ----- Resize -----
  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', onResize);

  // ----- Scroll-tied movement -----
  let scrollY = 0;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });

  // ----- Animation loop -----
  const clock = new THREE.Clock();

  function animate() {
    const elapsed = clock.getElapsedTime();

    // smooth mouse
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    // particles drift
    particles.rotation.y = elapsed * 0.03;
    particles.rotation.x = Math.sin(elapsed * 0.1) * 0.05;

    // shapes
    shapes.forEach((shape) => {
      shape.rotation.x += shape.userData.rotSpeedX;
      shape.rotation.y += shape.userData.rotSpeedY;
      const [bx, by, bz] = shape.userData.basePos;
      shape.position.y = by + Math.sin(elapsed + shape.userData.floatOffset) * 0.3;
      shape.position.x = bx + Math.cos(elapsed * 0.5 + shape.userData.floatOffset) * 0.2;
    });

    // camera parallax
    camera.position.x = mouse.x * 0.5;
    camera.position.y = -mouse.y * 0.3;
    camera.lookAt(0, 0, 0);

    // scroll fade-out (the canvas dims as user scrolls past hero)
    const heroHeight = window.innerHeight;
    const fade = Math.max(0, 1 - scrollY / heroHeight);
    canvas.style.opacity = fade;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  // ----- Theme awareness -----
  // Adjust opacity based on theme so it reads well in both
  const themeObserver = new MutationObserver(() => {
    const theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'light') {
      particleMat.opacity = 0.55;
      shapes.forEach((s) => (s.material.opacity = 0.35));
    } else {
      particleMat.opacity = 0.8;
      shapes.forEach((s) => (s.material.opacity = 0.5));
    }
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  // Initial sync
  if (document.documentElement.getAttribute('data-theme') === 'light') {
    particleMat.opacity = 0.55;
    shapes.forEach((s) => (s.material.opacity = 0.35));
  }
}

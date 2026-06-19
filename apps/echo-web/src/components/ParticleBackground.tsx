'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

const PARTICLE_COUNT = 15000;
const SPARK_COUNT = 2000;
const STAR_COUNT = 7000;

export default function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let composer: EffectComposer;
    let controls: OrbitControls;
    let particles: THREE.Points;
    let sparkles: THREE.Points;
    let stars: THREE.Points;
    const clock = new THREE.Clock();
    let currentPattern = 0;
    let isTrans = false;
    let prog = 0;
    const morphSpeed = 0.03;
    let animationFrameId: number;

    // Norm and math attractors
    function normalise(points: THREE.Vector3[], size: number): THREE.Vector3[] {
      if (points.length === 0) return [];
      const box = new THREE.Box3().setFromPoints(points);
      const sizeVec = new THREE.Vector3();
      box.getSize(sizeVec);
      const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z) || 1;
      const centre = new THREE.Vector3();
      box.getCenter(centre);
      return points.map(p => p.clone().sub(centre).multiplyScalar(size / maxDim));
    }

    function torusKnot(n: number): THREE.Vector3[] {
      const geometry = new THREE.TorusKnotGeometry(10, 3, 200, 16, 2, 3);
      const points: THREE.Vector3[] = [];
      const positionAttribute = geometry.attributes.position;
      for (let i = 0; i < positionAttribute.count; i++) {
        points.push(new THREE.Vector3().fromBufferAttribute(positionAttribute, i));
      }
      const result: THREE.Vector3[] = [];
      for (let i = 0; i < n; i++) {
        result.push(points[i % points.length].clone());
      }
      geometry.dispose();
      return normalise(result, 50);
    }

    function halvorsen(n: number): THREE.Vector3[] {
      const pts: THREE.Vector3[] = [];
      let x = 0.1, y = 0, z = 0;
      const a = 1.89;
      const dt = 0.005;
      for (let i = 0; i < n * 25; i++) {
        const dx = -a * x - 4 * y - 4 * z - y * y;
        const dy = -a * y - 4 * z - 4 * x - z * z;
        const dz = -a * z - 4 * x - 4 * y - x * x;
        x += dx * dt;
        y += dy * dt;
        z += dz * dt;
        if (i > 200 && i % 25 === 0) {
          pts.push(new THREE.Vector3(x, y, z));
        }
        if (pts.length >= n) break;
      }
      while (pts.length < n) pts.push(pts[Math.floor(Math.random() * pts.length)].clone());
      return normalise(pts, 60);
    }

    function dualHelix(n: number): THREE.Vector3[] {
      const pts: THREE.Vector3[] = [];
      const turns = 5;
      const radius = 15;
      const height = 40;
      for (let i = 0; i < n; i++) {
        const isSecondHelix = i % 2 === 0;
        const angle = (i / n) * Math.PI * 2 * turns;
        const y = (i / n) * height - height / 2;
        const r = radius + (isSecondHelix ? 5 : -5);
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        pts.push(new THREE.Vector3(x, y, z));
      }
      return normalise(pts, 60);
    }

    function deJong(n: number): THREE.Vector3[] {
      const pts: THREE.Vector3[] = [];
      let x = 0.1, y = 0.1;
      const a = 1.4, b = -2.3, c = 2.4, d = -2.1;
      for (let i = 0; i < n; i++) {
        const xn = Math.sin(a * y) - Math.cos(b * x);
        const yn = Math.sin(c * x) - Math.cos(d * y);
        x = xn;
        y = yn;
        const z = Math.sin(x * y * 0.5);
        pts.push(new THREE.Vector3(x, y, z));
      }
      return normalise(pts, 55);
    }

    const PATTERNS = [torusKnot, halvorsen, dualHelix, deJong];

    function createStars(): THREE.Points {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(STAR_COUNT * 3);
      const col = new Float32Array(STAR_COUNT * 3);
      const size = new Float32Array(STAR_COUNT);
      const rnd = new Float32Array(STAR_COUNT);
      const R = 900;
      for (let i = 0; i < STAR_COUNT; i++) {
        const i3 = i * 3;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = R * Math.cbrt(Math.random());
        pos[i3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i3 + 2] = r * Math.cos(phi);
        const c = new THREE.Color().setHSL(
          Math.random() * 0.6,
          0.3 + 0.3 * Math.random(),
          0.55 + 0.35 * Math.random()
        );
        col[i3] = c.r;
        col[i3 + 1] = c.g;
        col[i3 + 2] = c.b;
        size[i] = 0.25 + Math.pow(Math.random(), 4) * 2.1;
        rnd[i] = Math.random() * Math.PI * 2;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      geo.setAttribute('size', new THREE.BufferAttribute(size, 1));
      geo.setAttribute('random', new THREE.BufferAttribute(rnd, 1));

      const mat = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `
          attribute float size;
          attribute float random;
          varying vec3 vColor;
          varying float vRnd;
          void main() {
            vColor = color;
            vRnd = random;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (250.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          uniform float time;
          varying vec3 vColor;
          varying float vRnd;
          void main() {
            vec2 uv = gl_PointCoord - 0.5;
            float d = length(uv);
            float a = 1.0 - smoothstep(0.4, 0.5, d);
            a *= 0.7 + 0.3 * sin(time * (0.6 + vRnd * 0.3) + vRnd * 5.0);
            if (a < 0.02) discard;
            gl_FragColor = vec4(vColor, a);
          }
        `,
        transparent: true,
        depthWrite: false,
        vertexColors: true,
        blending: THREE.AdditiveBlending
      });
      return new THREE.Points(geo, mat);
    }

    function makeParticles(count: number, palette: THREE.Color[]): THREE.Points {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      const size = new Float32Array(count);
      const rnd = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const base = palette[Math.floor(Math.random() * palette.length)];
        const hsl = { h: 0, s: 0, l: 0 };
        base.getHSL(hsl);
        hsl.h += (Math.random() - 0.5) * 0.05;
        hsl.s = Math.min(1, Math.max(0.7, hsl.s + (Math.random() - 0.5) * 0.3));
        hsl.l = Math.min(0.9, Math.max(0.5, hsl.l + (Math.random() - 0.5) * 0.4));
        const c = new THREE.Color().setHSL(hsl.h, hsl.s, hsl.l);
        col[i3] = c.r;
        col[i3 + 1] = c.g;
        col[i3 + 2] = c.b;
        size[i] = 0.7 + Math.random() * 1.1;
        rnd[i3] = Math.random() * 10;
        rnd[i3 + 1] = Math.random() * Math.PI * 2;
        rnd[i3 + 2] = 0.5 + 0.5 * Math.random();
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      geo.setAttribute('size', new THREE.BufferAttribute(size, 1));
      geo.setAttribute('random', new THREE.BufferAttribute(rnd, 3));

      const mat = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 }, hueSpeed: { value: 0.12 } },
        vertexShader: `
          uniform float time;
          attribute float size;
          attribute vec3 random;
          varying vec3 vCol;
          varying float vR;
          void main() {
            vCol = color;
            vR = random.z;
            vec3 p = position;
            float t = time * 0.25 * random.z;
            float ax = t + random.y, ay = t * 0.75 + random.x;
            float amp = (0.6 + sin(random.x + t * 0.6) * 0.3) * random.z;
            p.x += sin(ax + p.y * 0.06 + random.x * 0.1) * amp;
            p.y += cos(ay + p.z * 0.06 + random.y * 0.1) * amp;
            p.z += sin(ax * 0.85 + p.x * 0.06 + random.z * 0.1) * amp;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            float pulse = 0.9 + 0.1 * sin(time * 1.15 + random.y);
            gl_PointSize = size * pulse * (350.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform float hueSpeed;
          varying vec3 vCol;
          varying float vR;

          vec3 hueShift(vec3 c, float h) {
            const vec3 k = vec3(0.57735);
            float cosA = cos(h);
            float sinA = sin(h);
            return c * cosA + cross(k, c) * sinA + k * dot(k, c) * (1.0 - cosA);
          }

          void main() {
            vec2 uv = gl_PointCoord - 0.5;
            float d = length(uv);
            
            float core = smoothstep(0.05, 0.0, d);
            float angle = atan(uv.y, uv.x);
            float flare = pow(max(0.0, sin(angle * 6.0 + time * 2.0 * vR)), 4.0);
            flare *= smoothstep(0.5, 0.0, d);
            float glow = smoothstep(0.4, 0.1, d);
            
            float alpha = core * 1.0 + flare * 0.5 + glow * 0.2;
            
            vec3 color = hueShift(vCol, time * hueSpeed);
            vec3 finalColor = mix(color, vec3(1.0, 0.95, 0.9), core);
            finalColor = mix(finalColor, color, flare * 0.5 + glow * 0.5);

            if (alpha < 0.01) discard;
            
            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
        transparent: true,
        depthWrite: false,
        vertexColors: true,
        blending: THREE.AdditiveBlending
      });
      return new THREE.Points(geo, mat);
    }

    function createSparkles(count: number): THREE.Points {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      const size = new Float32Array(count);
      const rnd = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        size[i] = 0.5 + Math.random() * 0.8;
        rnd[i * 3] = Math.random() * 10;
        rnd[i * 3 + 1] = Math.random() * Math.PI * 2;
        rnd[i * 3 + 2] = 0.5 + 0.5 * Math.random();
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('size', new THREE.BufferAttribute(size, 1));
      geo.setAttribute('random', new THREE.BufferAttribute(rnd, 3));

      const mat = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `
          uniform float time;
          attribute float size;
          attribute vec3 random;
          void main() {
            vec3 p = position;
            float t = time * 0.25 * random.z;
            float ax = t + random.y, ay = t * 0.75 + random.x;
            float amp = (0.6 + sin(random.x + t * 0.6) * 0.3) * random.z;
            p.x += sin(ax + p.y * 0.06 + random.x * 0.1) * amp;
            p.y += cos(ay + p.z * 0.06 + random.y * 0.1) * amp;
            p.z += sin(ax * 0.85 + p.x * 0.06 + random.z * 0.1) * amp;
            vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform float time;
          void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            float alpha = 1.0 - smoothstep(0.4, 0.5, d);
            if (alpha < 0.01) discard;
            gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });

      return new THREE.Points(geo, mat);
    }

    // Setup scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040307, 0.012);

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2500);
    camera.position.set(0, 0, 80);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 20;
    controls.maxDistance = 200;
    controls.target.set(0, 0, 0);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enableZoom = false;

    stars = createStars();
    scene.add(stars);

    const palette = [0xff3c78, 0xff8c00, 0xfff200, 0x00cfff, 0xb400ff, 0xffffff, 0xff4040].map(
      c => new THREE.Color(c)
    );
    particles = makeParticles(PARTICLE_COUNT, palette);
    sparkles = createSparkles(SPARK_COUNT);
    scene.add(particles);
    scene.add(sparkles);

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(width, height), 0.45, 0.5, 0.85));

    const after = new AfterimagePass();
    after.uniforms.damp.value = 0.92;
    composer.addPass(after);
    composer.addPass(new OutputPass());

    function applyPattern(i: number) {
      const pts = PATTERNS[i](PARTICLE_COUNT);
      const particleArr = particles.geometry.attributes.position.array as Float32Array;
      const sparkleArr = sparkles.geometry.attributes.position.array as Float32Array;
      for (let j = 0; j < PARTICLE_COUNT; j++) {
        const idx = j * 3;
        const p = pts[j] || new THREE.Vector3();
        particleArr[idx] = p.x;
        particleArr[idx + 1] = p.y;
        particleArr[idx + 2] = p.z;
        if (j < SPARK_COUNT) {
          sparkleArr[idx] = p.x;
          sparkleArr[idx + 1] = p.y;
          sparkleArr[idx + 2] = p.z;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;
      sparkles.geometry.attributes.position.needsUpdate = true;
    }

    applyPattern(currentPattern);

    function beginMorph() {
      if (isTrans) return;
      isTrans = true;
      prog = 0;
      const next = (currentPattern + 1) % PATTERNS.length;
      const fromPts = (particles.geometry.attributes.position.array as Float32Array).slice();
      const toPts = PATTERNS[next](PARTICLE_COUNT);

      const to = new Float32Array(PARTICLE_COUNT * 3);
      if (toPts.length > 0) {
        for (let j = 0; j < PARTICLE_COUNT; j++) {
          const idx = j * 3;
          const p = toPts[j];
          to[idx] = p.x;
          to[idx + 1] = p.y;
          to[idx + 2] = p.z;
        }
        particles.userData = { from: fromPts, to, next };
        sparkles.userData = { from: fromPts, to, next };
      }
    }

    // Listen to custom window event to trigger morph
    const handleMorphEvent = () => {
      beginMorph();
    };
    window.addEventListener('morph-particle-shape', handleMorphEvent);

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const t = clock.getElapsedTime();

      controls.update();

      if (particles.material instanceof THREE.ShaderMaterial) {
        particles.material.uniforms.time.value = t;
      }
      if (sparkles.material instanceof THREE.ShaderMaterial) {
        sparkles.material.uniforms.time.value = t;
      }
      if (stars.material instanceof THREE.ShaderMaterial) {
        stars.material.uniforms.time.value = t;
      }

      if (isTrans) {
        prog += morphSpeed;
        const eased = prog >= 1 ? 1 : 1 - Math.pow(1 - prog, 3);
        const { from, to } = particles.userData;
        if (to) {
          const particleArr = particles.geometry.attributes.position.array as Float32Array;
          const sparkleArr = sparkles.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < particleArr.length; i++) {
            const val = from[i] + (to[i] - from[i]) * eased;
            particleArr[i] = val;
            if (i < sparkleArr.length) {
              sparkleArr[i] = val;
            }
          }
          particles.geometry.attributes.position.needsUpdate = true;
          sparkles.geometry.attributes.position.needsUpdate = true;
        }
        if (prog >= 1) {
          currentPattern = particles.userData.next;
          isTrans = false;
        }
      }

      composer.render(dt);
    }

    animate();

    // Clean up on unmount
    return () => {
      window.removeEventListener('morph-particle-shape', handleMorphEvent);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      scene.remove(stars);
      scene.remove(particles);
      scene.remove(sparkles);

      stars.geometry.dispose();
      (stars.material as THREE.Material).dispose();

      particles.geometry.dispose();
      (particles.material as THREE.Material).dispose();

      sparkles.geometry.dispose();
      (sparkles.material as THREE.Material).dispose();

      controls.dispose();
      renderer.dispose();
      composer.dispose();
      
      if (containerRef.current && renderer.domElement) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className="fixed inset-0 w-full h-full -z-10 bg-[#040307]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 35%, #1d1431 0%, transparent 65%), linear-gradient(180deg, #000000 0%, #070012 100%)',
          pointerEvents: 'none',
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(circle at center, rgba(0,0,0,0) 65%, rgba(0,0,0,.5) 100%)',
        }}
      />
    </>
  );
}

'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import { ArrowDown, ArrowRight, Sparkles, Users, ShieldCheck, Trophy } from 'lucide-react';

const NUM_MORPH_POINTS = 100000;
const NUM_STAR_POINTS = 800;

const MORPH_STATES = [
  { morph1: 0, morph2: 0, morph3: 1, morph4: 0, morph5: 0, rotation: 0.3, cameraDistance: 120 },
  { morph1: 1, morph2: 0, morph3: 0, morph4: 0, morph5: 0, rotation: 0.8, cameraDistance: 140 },
  { morph1: 0, morph2: 1, morph3: 0, morph4: 0, morph5: 0, rotation: 1.5, cameraDistance: 100 },
  { morph1: 0, morph2: 0, morph3: 0, morph4: 1, morph5: 0, rotation: 0.6, cameraDistance: 110 },
  { morph1: 0, morph2: 0, morph3: 0, morph4: 0, morph5: 1, rotation: 0.4, cameraDistance: 125 },
];

export function DotsetHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const [isShadowActive, setIsShadowActive] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#ffffff');
    scene.fog = new THREE.FogExp2('#ffffff', 0.003);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
    camera.position.set(80, 50, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.autoClear = false;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1;
    renderer.domElement.style.touchAction = 'pan-y';

    const colorPalette = [
      new THREE.Color('#293681'),
      new THREE.Color('#4274d9'),
      new THREE.Color('#95ccdd'),
      new THREE.Color('#38bdf8'),
      new THREE.Color('#0d47a1'),
    ];

    const getBasePointSize = () => (container.clientWidth < 768 ? 4.5 : 3.5);

    // --- 1. STAR PARTICLES (Shooting rays from center) ---
    const starDirs = new Float32Array(NUM_STAR_POINTS * 3);
    const starColors = new Float32Array(NUM_STAR_POINTS * 3);
    const starOffsets = new Float32Array(NUM_STAR_POINTS);

    for (let i = 0; i < NUM_STAR_POINTS; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const rad = 0.2 + Math.random() * 0.8;
      starDirs[i * 3] = Math.sin(phi) * Math.cos(theta) * rad;
      starDirs[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * rad;
      starDirs[i * 3 + 2] = Math.cos(phi) * rad;
      starOffsets[i] = ((i * 0.61803398875) % 1) * 600;

      const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      starColors[i * 3] = c.r;
      starColors[i * 3 + 1] = c.g;
      starColors[i * 3 + 2] = c.b;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NUM_STAR_POINTS * 3), 3));
    starGeo.setAttribute('direction', new THREE.BufferAttribute(starDirs, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    starGeo.setAttribute('travelOffset', new THREE.BufferAttribute(starOffsets, 1));

    const starMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPointSize: { value: getBasePointSize() * 0.8 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uPointSize;

        attribute vec3 direction;
        attribute vec3 color;
        attribute float travelOffset;

        varying vec3 vColor;
        varying float vOpacity;

        void main() {
          vColor = color;
          float distFromCenter = mod(travelOffset + uTime * 15.0 * length(direction), 600.0);
          vec3 particlePosition = normalize(direction) * distFromCenter;
          vOpacity = smoothstep(0.0, 100.0, distFromCenter) * smoothstep(600.0, 400.0, distFromCenter) * 0.6;

          vec4 mvPosition = modelViewMatrix * vec4(particlePosition, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = uPointSize * (200.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vOpacity;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          if (length(coord) > 0.5) discard;
          gl_FragColor = vec4(vColor, vOpacity);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    scene.add(new THREE.Points(starGeo, starMat));

    // --- 2. 100K 3D MORPHING POINT CLOUD ---
    const posLorenz = new Float32Array(NUM_MORPH_POINTS * 3);
    const posTorusKnot = new Float32Array(NUM_MORPH_POINTS * 3);
    const posSphere = new Float32Array(NUM_MORPH_POINTS * 3);
    const posMobius = new Float32Array(NUM_MORPH_POINTS * 3);
    const posVenn = new Float32Array(NUM_MORPH_POINTS * 3);
    const morphColors = new Float32Array(NUM_MORPH_POINTS * 3);

    let lx = 0.1, ly = 0, lz = 0, dt = 0.006;
    for (let i = 0; i < NUM_MORPH_POINTS; i++) {
      // 1. Lorenz Attractor
      const dx = 10 * (ly - lx) * dt;
      const dy = (lx * (28 - lz) - ly) * dt;
      const dz = (lx * ly - (8 / 3) * lz) * dt;
      lx += dx; ly += dy; lz += dz;
      posLorenz[i * 3] = lx * 1.5;
      posLorenz[i * 3 + 1] = ly * 1.5 - 35;
      posLorenz[i * 3 + 2] = lz * 1.5 - 35;

      // 2. Torus Knot
      const tk = (i / NUM_MORPH_POINTS) * Math.PI * 2 * 120;
      const r = 25 + 10 * Math.cos(5 * tk);
      posTorusKnot[i * 3] = r * Math.cos(3 * tk) + (Math.random() - 0.5) * 2;
      posTorusKnot[i * 3 + 1] = r * Math.sin(3 * tk) + (Math.random() - 0.5) * 2;
      posTorusKnot[i * 3 + 2] = 10 * Math.sin(5 * tk) + (Math.random() - 0.5) * 2;

      // 3. Fibonacci Sphere
      const phi = Math.acos(1 - 2 * (i + 0.5) / NUM_MORPH_POINTS);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const spR = 45 + Math.random() * 3;
      posSphere[i * 3] = spR * Math.cos(theta) * Math.sin(phi);
      posSphere[i * 3 + 1] = spR * Math.cos(phi);
      posSphere[i * 3 + 2] = spR * Math.sin(theta) * Math.sin(phi);

      // 4. Möbius Strip
      const u = Math.random() * Math.PI * 2;
      const v = (Math.random() - 0.5) * 35;
      posMobius[i * 3] = (35 + v * Math.cos(u / 2)) * Math.cos(u) + (Math.random() - 0.5) * 2;
      posMobius[i * 3 + 1] = (35 + v * Math.cos(u / 2)) * Math.sin(u) + (Math.random() - 0.5) * 2;
      posMobius[i * 3 + 2] = v * Math.sin(u / 2) + (Math.random() - 0.5) * 2;

      // 5. Venn Diagram
      const vd = Math.random() * Math.PI * 2;
      const side = Math.random() > 0.5 ? -22 : 22;
      posVenn[i * 3] = side + 35 * Math.cos(vd) + (Math.random() - 0.5) * 3;
      posVenn[i * 3 + 1] = 35 * Math.sin(vd) + (Math.random() - 0.5) * 3;
      posVenn[i * 3 + 2] = (Math.random() - 0.5) * 6;

      // Colors
      const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      morphColors[i * 3] = c.r;
      morphColors[i * 3 + 1] = c.g;
      morphColors[i * 3 + 2] = c.b;
    }

    const morphGeo = new THREE.BufferGeometry();
    morphGeo.setAttribute('position', new THREE.BufferAttribute(posSphere, 3));
    morphGeo.setAttribute('color', new THREE.BufferAttribute(morphColors, 3));
    morphGeo.setAttribute('posLorenz', new THREE.BufferAttribute(posLorenz, 3));
    morphGeo.setAttribute('posTorusKnot', new THREE.BufferAttribute(posTorusKnot, 3));
    morphGeo.setAttribute('posSphere', new THREE.BufferAttribute(posSphere, 3));
    morphGeo.setAttribute('posMobius', new THREE.BufferAttribute(posMobius, 3));
    morphGeo.setAttribute('posVenn', new THREE.BufferAttribute(posVenn, 3));

    const morphMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMorph1: { value: 0 },
        uMorph2: { value: 0 },
        uMorph3: { value: 1 },
        uMorph4: { value: 0 },
        uMorph5: { value: 0 },
        uPointSize: { value: getBasePointSize() },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uMorph1;
        uniform float uMorph2;
        uniform float uMorph3;
        uniform float uMorph4;
        uniform float uMorph5;
        uniform float uPointSize;

        attribute vec3 posLorenz;
        attribute vec3 posTorusKnot;
        attribute vec3 posSphere;
        attribute vec3 posMobius;
        attribute vec3 posVenn;
        attribute vec3 color;

        varying vec3 vColor;

        void main() {
          vColor = color;
          vec3 morphedPos = posLorenz * uMorph1
            + posTorusKnot * uMorph2
            + posSphere * uMorph3
            + posMobius * uMorph4
            + posVenn * uMorph5;

          float floatNoise = sin(uTime * 2.0 + morphedPos.x * 0.05) * 1.5;
          morphedPos.y += floatNoise;

          vec4 mvPosition = modelViewMatrix * vec4(morphedPos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = uPointSize * (150.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          if (length(coord) > 0.5) discard;
          gl_FragColor = vec4(vColor, 0.85);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    scene.add(new THREE.Points(morphGeo, morphMat));

    // --- 3. TEXT PARTICLE LOGO REVEAL SCENE ---
    const textScene = new THREE.Scene();
    const textCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    textCamera.position.z = 1;

    let textGeo: THREE.BufferGeometry | null = null;
    let textMat: THREE.ShaderMaterial | null = null;
    let textTimeline: gsap.core.Timeline | null = null;
    let isDisposed = false;

    const buildTextParticles = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = width;
      offscreenCanvas.height = height;
      const ctx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx || !titleRef.current) return;

      const compStyle = window.getComputedStyle(titleRef.current);
      const titleRect = titleRef.current.getBoundingClientRect();
      const contRect = container.getBoundingClientRect();
      const centerX = titleRect.left - contRect.left + titleRect.width / 2;
      const centerY = titleRect.top - contRect.top + titleRect.height / 2;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#ffffff';
      ctx.font = `${compStyle.fontWeight} ${compStyle.fontSize} ${compStyle.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('dotset', centerX, centerY);

      const imgData = ctx.getImageData(0, 0, width, height).data;
      const step = width < 640 ? 2 : 3;
      const targetPosList: number[] = [];
      const colorList: number[] = [];
      const delayList: number[] = [];

      const layerOffsets = [
        { offset: 16, color: colorPalette[4], delay: 0 },
        { offset: 12, color: colorPalette[3], delay: 0.035 },
        { offset: 8, color: colorPalette[2], delay: 0.07 },
        { offset: 4, color: colorPalette[1], delay: 0.105 },
        { offset: 0, color: new THREE.Color('#ffffff'), delay: 0.14 },
      ];

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const idx = (y * width + x) * 4;
          if (imgData[idx + 3] > 128) {
            layerOffsets.forEach((layer) => {
              targetPosList.push(x - width / 2 + layer.offset, height / 2 - y - layer.offset, 0);
              colorList.push(layer.color.r, layer.color.g, layer.color.b);
              delayList.push(layer.delay + Math.random() * 0.14);
            });
          }
        }
      }

      const numParticles = targetPosList.length / 3;
      const initialPositions = new Float32Array(numParticles * 3);
      const targetPositions = new Float32Array(targetPosList);
      const particleColors = new Float32Array(colorList);
      const particleDelays = new Float32Array(delayList);

      for (let i = 0; i < numParticles; i++) {
        initialPositions[i * 3] = (Math.random() - 0.5) * width * 1.8;
        initialPositions[i * 3 + 1] = (Math.random() - 0.5) * height * 1.8;
        initialPositions[i * 3 + 2] = 0;
      }

      textGeo = new THREE.BufferGeometry();
      textGeo.setAttribute('position', new THREE.BufferAttribute(initialPositions, 3));
      textGeo.setAttribute('targetPosition', new THREE.BufferAttribute(targetPositions, 3));
      textGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
      textGeo.setAttribute('arrivalDelay', new THREE.BufferAttribute(particleDelays, 1));

      const particleSize = Math.min(window.devicePixelRatio, 2) * 3.4;

      textMat = new THREE.ShaderMaterial({
        uniforms: {
          uProgress: { value: 0 },
          uOpacity: { value: 1 },
          uPointSize: { value: particleSize },
        },
        vertexShader: `
          uniform float uProgress;
          uniform float uPointSize;

          attribute vec3 targetPosition;
          attribute vec3 color;
          attribute float arrivalDelay;

          varying vec3 vColor;

          void main() {
            vColor = color;
            float localProgress = smoothstep(arrivalDelay, 1.0, uProgress);
            vec3 particlePosition = mix(position, targetPosition, localProgress);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(particlePosition, 1.0);
            gl_PointSize = uPointSize;
          }
        `,
        fragmentShader: `
          uniform float uOpacity;
          varying vec3 vColor;

          void main() {
            vec2 coord = gl_PointCoord - vec2(0.5);
            if (length(coord) > 0.5) discard;
            gl_FragColor = vec4(vColor, uOpacity);
          }
        `,
        transparent: true,
        depthWrite: false,
      });

      textScene.add(new THREE.Points(textGeo, textMat));

      if (titleRef.current) {
        gsap.set(titleRef.current, { opacity: 0, scale: 0.97, filter: 'blur(18px)' });
      }
      if (subtitleRef.current) {
        gsap.set(subtitleRef.current, { opacity: 0, y: 14, filter: 'blur(8px)' });
      }

      textTimeline = gsap.timeline({ delay: 0.15 })
        .to(textMat.uniforms.uProgress, { value: 1, duration: 3.2, ease: 'power3.inOut' })
        .to(titleRef.current, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.7, ease: 'power2.out' }, '-=0.4')
        .to(textMat.uniforms.uOpacity, { value: 0, duration: 1.7, ease: 'power2.inOut' }, '<')
        .to(textMat.uniforms.uPointSize, { value: particleSize * 0.65, duration: 1.7, ease: 'power2.inOut' }, '<')
        .to(subtitleRef.current, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out', onStart: () => setIsShadowActive(true) }, '<0.15');
    };

    // Wait for DotLirium font before sampling offscreen text
    document.fonts.load('12vw "DotLirium"').then(() => {
      if (!isDisposed) buildTextParticles();
    }).catch(() => {
      if (!isDisposed && titleRef.current) {
        gsap.set(titleRef.current, { opacity: 1 });
        setIsShadowActive(true);
      }
    });

    // --- 4. MORPH TRANSITION CYCLING ---
    let stateIdx = 0;
    let morphTl: gsap.core.Timeline | null = null;

    const cycleMorph = () => {
      stateIdx = (stateIdx + 1) % MORPH_STATES.length;
      const targetState = MORPH_STATES[stateIdx];
      morphTl?.kill();
      morphTl = gsap.timeline();

      const morphUniforms = [
        morphMat.uniforms.uMorph1,
        morphMat.uniforms.uMorph2,
        morphMat.uniforms.uMorph3,
        morphMat.uniforms.uMorph4,
        morphMat.uniforms.uMorph5,
      ];
      const targetValues = [
        targetState.morph1,
        targetState.morph2,
        targetState.morph3,
        targetState.morph4,
        targetState.morph5,
      ];

      morphUniforms.forEach((u, idx) => {
        morphTl?.to(u, { value: targetValues[idx], duration: 3, ease: 'power3.inOut' }, 0);
      });

      morphTl.to(controls, { autoRotateSpeed: targetState.rotation, duration: 3 }, 0);

      const normCam = new THREE.Vector3().copy(camera.position).normalize();
      morphTl.to(camera.position, {
        x: normCam.x * targetState.cameraDistance,
        y: normCam.y * targetState.cameraDistance,
        z: normCam.z * targetState.cameraDistance,
        duration: 3,
        ease: 'power2.inOut',
      }, 0);
    };

    const morphInterval = window.setInterval(cycleMorph, 5500);

    // --- 5. RESIZE HANDLER ---
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      textCamera.left = -w / 2;
      textCamera.right = w / 2;
      textCamera.top = h / 2;
      textCamera.bottom = -h / 2;
      textCamera.updateProjectionMatrix();

      renderer.setSize(w, h);

      const ptSize = getBasePointSize();
      morphMat.uniforms.uPointSize.value = ptSize;
      starMat.uniforms.uPointSize.value = ptSize * 0.8;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // --- 6. RENDER LOOP ---
    let animFrameId = 0;
    let elapsed = 0;
    let lastTime = performance.now();

    const animate = (time: number) => {
      elapsed += (time - lastTime) / 1000;
      lastTime = time;

      morphMat.uniforms.uTime.value = elapsed;
      starMat.uniforms.uTime.value = elapsed;

      controls.update();

      renderer.clear();
      renderer.render(scene, camera);
      renderer.clearDepth();
      renderer.render(textScene, textCamera);

      animFrameId = requestAnimationFrame(animate);
    };

    animFrameId = requestAnimationFrame(animate);

    // CLEANUP
    return () => {
      isDisposed = true;
      window.removeEventListener('resize', handleResize);
      window.clearInterval(morphInterval);
      cancelAnimationFrame(animFrameId);
      morphTl?.kill();
      textTimeline?.kill();

      controls.dispose();
      starGeo.dispose();
      starMat.dispose();
      morphGeo.dispose();
      morphMat.dispose();
      textGeo?.dispose();
      textMat?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <section className="relative min-h-[92vh] sm:min-h-screen w-full flex items-center justify-center overflow-hidden select-none bg-[#080808]">
      
      {/* 3D WebGL Canvas Scene */}
      <div ref={containerRef} className="dotset-reveal-scene" />

      {/* Overlay: Text Particle Reveal & Cycling Motto */}
      <div className="dotset-reveal-overlay">
        <div className="dotset-reveal-copy">
          
          {/* Main Logo Title in DotLirium */}
          <div
            ref={titleRef}
            className="dotset-reveal-title font-dotlirium tracking-wider"
            aria-label="dotset"
          >
            dotset
          </div>

          {/* Cycling Subtitle Slogan with animated text shadows */}
          <p
            ref={subtitleRef}
            className={`dotset-reveal-subtitle ${isShadowActive ? 'is-shadow-active' : ''}`}
          >
            <span className="dotset-reveal-subtitle-link">
              <strong className="dotset-reveal-focus font-bold">Discover</strong> early drops
            </span>
            <span className="dotset-reveal-subtitle-link">
              <strong className="dotset-reveal-focus font-bold">Enter</strong> social quests
            </span>
            <span className="dotset-reveal-subtitle-link">
              <strong className="dotset-reveal-focus font-bold">Win</strong> whitelist spots
            </span>
          </p>

          {/* Quick Action CTA Button */}
          <div className="pointer-events-auto flex items-center justify-center mt-8 sm:mt-10 z-20">
            <a
              href="#active-raffles"
              className="btn-primary-cq shadow-2xl px-6 py-3 text-sm font-semibold"
            >
              <span>Explore Active Raffles</span>
              <ArrowRight size={16} />
            </a>
          </div>

          {/* Floating Stats Badges */}
          <div className="pointer-events-auto grid grid-cols-3 gap-2.5 sm:gap-4 mt-8 sm:mt-12 max-w-2xl w-full mx-auto px-4 z-20">
            <div className="bg-white/90 backdrop-blur-md border border-gray-200 p-3 sm:p-4 rounded-xl shadow-md transition-all hover:border-[#293681] text-center">
              <div className="flex justify-center text-[#293681] mb-1">
                <Sparkles size={16} />
              </div>
              <div className="font-grotesk text-lg sm:text-xl font-bold text-gray-900">
                LIVE
              </div>
              <div className="font-mono-dm text-[10px] text-gray-500 uppercase mt-0.5 font-medium">
                Active Raffles
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-md border border-gray-200 p-3 sm:p-4 rounded-xl shadow-md transition-all hover:border-[#293681] text-center">
              <div className="flex justify-center text-[#4274d9] mb-1">
                <Users size={16} />
              </div>
              <div className="font-grotesk text-lg sm:text-xl font-bold text-gray-900">
                100%
              </div>
              <div className="font-mono-dm text-[10px] text-gray-500 uppercase mt-0.5 font-medium">
                Open to All
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-md border border-gray-200 p-3 sm:p-4 rounded-xl shadow-md transition-all hover:border-[#293681] text-center">
              <div className="flex justify-center text-[#16a34a] mb-1">
                <ShieldCheck size={16} />
              </div>
              <div className="font-grotesk text-lg sm:text-xl font-bold text-gray-900">
                GTD / FCFS
              </div>
              <div className="font-mono-dm text-[10px] text-gray-500 uppercase mt-0.5 font-medium">
                Spots Available
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Animated Scroll Down Indicator */}
      <a
        href="#active-raffles"
        className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 text-[11px] font-mono-dm tracking-widest text-gray-500 uppercase hover:text-[#293681] transition-colors"
      >
        <span>Scroll Down</span>
        <ArrowDown size={14} className="animate-bounce text-[#4274d9]" />
      </a>

    </section>
  );
}

'use client';

import { useEffect, useRef } from"react";
import * as THREE from"three";
import { WebGLSurface, useEffectReducedMotion } from "@/lib/effects/shared/webgl-surface";

const vertexShader = `
 varying vec2 vUv;
 void main() {
 vUv = uv;
 gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
 }
`;

const fragmentShader = `
 uniform sampler2D uTexture;
 uniform vec2 uResolution;
 uniform vec2 uTextureSize;
 uniform vec2 uMouse;
 uniform float uParallaxStrength;
 uniform float uDistortionMultiplier;
 uniform float uGlassStrength;
 uniform float uStripesFrequency;
 uniform float uGlassSmoothness;
 uniform float uEdgePadding;

 varying vec2 vUv;

 #define M_PI 3.1415926535897932384626433832795

 vec2 getCoverUV(vec2 uv, vec2 textureSize) {
 if (textureSize.x < 1.0 || textureSize.y < 1.0) return uv;

 vec2 s = uResolution / textureSize;
 float scale = max(s.x, s.y);

 vec2 scaledSize = textureSize * scale;
 vec2 offset = (uResolution - scaledSize) * 0.5;

 return (uv * uResolution - offset) / scaledSize;
 }

 float smoothEdge(float x, float padding) {
 float edge = padding;
 if (x < edge) {
 return smoothstep(0.0, edge, x);
 } else if (x > 1.0 - edge) {
 return 1.0 - smoothstep(1.0 - edge, 1.0, x);
 }
 return 1.0;
 }

 void main() {
 vec2 uv = vUv;

 float edgeFactor = smoothEdge(uv.x, uEdgePadding);
 float stripeCount = max(2.0, uStripesFrequency);
 float stripeIndex = floor(uv.x * stripeCount);
 float stripeCurve = sin(fract(uv.x * stripeCount) * M_PI);
 float stripeDirection = mod(stripeIndex, 2.0) * 2.0 - 1.0;
 float pointer = (uMouse.x - 0.5) * 2.0;
 float refractionStrength = 0.7 + min(uDistortionMultiplier, 10.0) * 0.03;
 float staticRefraction = stripeDirection * (0.018 + stripeCurve * 0.045) * uGlassStrength;
 float pointerRefraction = pointer * (0.035 + stripeCurve * 0.105) * uParallaxStrength;

 uv.x += (staticRefraction + pointerRefraction) * refractionStrength * edgeFactor;
 uv.y += sin((uv.x + uMouse.y * 0.35) * stripeCount * M_PI) * stripeCurve * 0.009 * uGlassSmoothness * edgeFactor;

 vec2 coverUV = getCoverUV(uv, uTextureSize);

 if (coverUV.x < 0.0 || coverUV.x > 1.0 || coverUV.y < 0.0 || coverUV.y > 1.0) {
 coverUV = clamp(coverUV, 0.0, 1.0);
 }

 vec4 color = texture2D(uTexture, coverUV);
 float glassHighlight = pow(stripeCurve, 3.0) * (0.05 + abs(pointer) * 0.12) * edgeFactor;
 color.rgb *= 0.96 + stripeCurve * 0.08 * uGlassStrength;
 color.rgb += vec3(0.10, 0.15, 0.30) * glassHighlight;

 gl_FragColor = color;
 }
`;

function GlassStripParallax({
 imageSrc ="https://pub-830233752de349e29c6104a501b309d4.r2.dev/effects/fractal-glass/fractal-glass-img01.jpg?v=2", // ← new prop: path/URL to image file
 videoSrc = null, 
 mediaType ="image", 
 stripesFrequency = 8.0,
 glassStrength = 0.8,
 glassSmoothness = 0.5,
 parallaxStrength = 0.6,
 distortionMultiplier = 8.0,
 edgePadding = 0.12,
}) {
 const mountRef = useRef(null);
 const reducedMotion = useEffectReducedMotion();
 const videoRef = useRef(null); // keeps reference to video element for cleanup

 useEffect(() => {
 const el = mountRef.current;
 if (!el) return;

 let disposed = false;
 const W = Math.max(1, el.clientWidth);
 const H = Math.max(1, el.clientHeight);

 const renderer = new THREE.WebGLRenderer({ antialias: true });
 renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
 renderer.setSize(W, H);
 el.appendChild(renderer.domElement);

 const scene = new THREE.Scene();
 const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
 camera.position.z = 1;

 const uniforms = {
 uTexture: { value: new THREE.Texture() },
 uResolution: { value: new THREE.Vector2(W, H) },
 uTextureSize: { value: new THREE.Vector2(1, 1) },
 uMouse: { value: new THREE.Vector2(0.5, 0.5) },
 uParallaxStrength: { value: parallaxStrength },
 uDistortionMultiplier:{ value: distortionMultiplier },
 uGlassStrength: { value: glassStrength },
 uStripesFrequency: { value: stripesFrequency },
 uGlassSmoothness: { value: glassSmoothness },
 uEdgePadding: { value: edgePadding },
 };

 let videoEl = null;
 let videoTexture = null;

 if (mediaType ==="video" && videoSrc) {
 // ── Video path ──────────────────────────────────────────────
 videoEl = document.createElement("video");
 videoEl.src = videoSrc;
 videoEl.crossOrigin ="anonymous";
 videoEl.loop = true;
 videoEl.muted = true;
 videoEl.playsInline = true;
 videoEl.autoplay = !reducedMotion;
 videoRef.current = videoEl;

 videoEl.onloadedmetadata = () => {
 uniforms.uTextureSize.value.set(videoEl.videoWidth, videoEl.videoHeight);
 };

 if (!reducedMotion) videoEl.play().catch(() => {
 // Autoplay blocked — still renders first frame when available
 });

 videoTexture = new THREE.VideoTexture(videoEl);
 videoTexture.minFilter = THREE.LinearFilter;
 videoTexture.magFilter = THREE.LinearFilter;
 videoTexture.wrapS = THREE.ClampToEdgeWrapping;
 videoTexture.wrapT = THREE.ClampToEdgeWrapping;
 uniforms.uTexture.value.dispose();
 uniforms.uTexture.value = videoTexture;
 videoEl.onloadeddata = () => { if (!disposed) renderer.render(scene, camera); };

 } else {
 // ── Image path ──────────────────────────────────────────────
 const loader = new THREE.TextureLoader();
 loader.crossOrigin ="anonymous";
 loader.load(imageSrc, (tex) => {
 if (disposed) { tex.dispose(); return; }
 uniforms.uTexture.value.dispose();
 tex.minFilter = THREE.LinearFilter;
 tex.magFilter = THREE.LinearFilter;
 tex.wrapS = THREE.ClampToEdgeWrapping;
 tex.wrapT = THREE.ClampToEdgeWrapping;
 uniforms.uTexture.value = tex;
 uniforms.uTextureSize.value.set(
 tex.image.naturalWidth || tex.image.width || 1920,
 tex.image.naturalHeight || tex.image.height || 1080
 );
 renderer.render(scene, camera);
 });
 }

 const geo = new THREE.PlaneGeometry(2, 2);
 const mat = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
 scene.add(new THREE.Mesh(geo, mat));
 renderer.render(scene, camera);

 const target = { x: 0.5, y: 0.5 };
 const current = { x: 0.5, y: 0.5 };

 const setTarget = (x, y) => {
 if (reducedMotion) return;
 const rect = el.getBoundingClientRect();
 target.x = (x - rect.left) / Math.max(1, rect.width);
 target.y = 1 - (y - rect.top) / Math.max(1, rect.height);
 };
 const onMouse = (e) => setTarget(e.clientX, e.clientY);
 el.addEventListener("pointermove", onMouse);

 const onResize = () => {
 const w = Math.max(1, el.clientWidth), h = Math.max(1, el.clientHeight);
 renderer.setSize(w, h);
 uniforms.uResolution.value.set(w, h);
 renderer.render(scene, camera);
 };
 const observer = new ResizeObserver(onResize);
 observer.observe(el);

 let raf;
 const tick = () => {
 if (!reducedMotion) raf = requestAnimationFrame(tick);
 current.x += (target.x - current.x) * 0.04;
 current.y += (target.y - current.y) * 0.04;
 uniforms.uMouse.value.set(current.x, current.y);
 // For video, mark texture as needing update every frame
 if (videoTexture) videoTexture.needsUpdate = true;
 renderer.render(scene, camera);
 };
 tick();

 return () => {
 disposed = true;
 cancelAnimationFrame(raf);
 el.removeEventListener("pointermove", onMouse);
 observer.disconnect();
 if (videoEl) {
 videoEl.onloadedmetadata = null;
 videoEl.onloadeddata = null;
 videoEl.pause();
 videoEl.removeAttribute("src");
 videoEl.load();
 videoRef.current = null;
 }
 uniforms.uTexture.value.dispose();
 renderer.dispose();
 mat.dispose();
 geo.dispose();
 if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
 };
 }, [imageSrc, videoSrc, mediaType, stripesFrequency, glassStrength, glassSmoothness,
 parallaxStrength, distortionMultiplier, edgePadding, reducedMotion]);

 return <div ref={mountRef} className="absolute inset-0 h-full w-full overflow-hidden" />;
}

/** @param {{ imageSrc?: string, videoSrc?: string | null, mediaType?: string, stripesFrequency?: number, glassStrength?: number, glassSmoothness?: number, parallaxStrength?: number, distortionMultiplier?: number, edgePadding?: number, className?: string, style?: import("react").CSSProperties }} props */
export function FractalGlass({ imageSrc = "https://pub-830233752de349e29c6104a501b309d4.r2.dev/effects/fractal-glass/fractal-glass-img01.jpg?v=2", className, style, ...props } = {}) {
 return <WebGLSurface className={className} style={style} imageSrc={imageSrc} label="ObsidianUI refracted glass image">
   <GlassStripParallax imageSrc={imageSrc} {...props} />
 </WebGLSurface>;
}

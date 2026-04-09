"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import * as THREE from "three";

const ease = [0.16, 1, 0.3, 1] as const;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float iTime;
  uniform vec2 iResolution;
  uniform float isDark;
  varying vec2 vUv;

  #define PI 3.141592654

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vec2 uv = vUv;
    uv.x *= iResolution.x / iResolution.y;

    float t = iTime * 0.15;

    float beam1 = snoise(vec3(uv.x * 1.5 + t * 0.5, uv.y * 0.8 - t * 0.2, t * 0.3));
    float beam2 = snoise(vec3(uv.x * 2.0 - t * 0.3, uv.y * 0.6 + t * 0.1, t * 0.2 + 10.0));
    float beam3 = snoise(vec3(uv.x * 1.2 + t * 0.2, uv.y * 1.0 - t * 0.15, t * 0.25 + 20.0));

    float verticalFade = pow(1.0 - uv.y, 1.5);
    float verticalFade2 = pow(1.0 - uv.y, 2.5);

    float light1 = smoothstep(0.0, 0.8, beam1 * verticalFade);
    float light2 = smoothstep(0.0, 0.7, beam2 * verticalFade);
    float light3 = smoothstep(0.0, 0.6, beam3 * verticalFade2);

    float xPos = uv.x / (iResolution.x / iResolution.y);

    float centerGlow = exp(-pow((xPos - 0.5) * 2.0, 2.0)) * verticalFade2;

    vec3 col;

    if (isDark > 0.5) {
      col = vec3(0.02, 0.02, 0.06);

      vec3 orange = vec3(0.95, 0.4, 0.1);
      vec3 red = vec3(0.85, 0.15, 0.2);
      vec3 pink = vec3(0.7, 0.2, 0.4);
      vec3 blue = vec3(0.1, 0.3, 0.7);
      vec3 cyan = vec3(0.1, 0.6, 0.8);

      col += orange * light1 * 0.6 * smoothstep(0.6, 0.2, xPos);
      col += red * light1 * 0.5 * smoothstep(0.3, 0.5, xPos) * smoothstep(0.7, 0.5, xPos);
      col += pink * light2 * 0.4 * smoothstep(0.4, 0.6, xPos);
      col += blue * light3 * 0.5 * smoothstep(0.5, 0.8, xPos);
      col += cyan * light2 * 0.3 * smoothstep(0.7, 1.0, xPos);
      col += vec3(0.9, 0.5, 0.3) * centerGlow * 0.3;

      float vignette = 1.0 - pow(length(uv - vec2(0.5 * iResolution.x / iResolution.y, 0.5)) * 0.8, 2.0);
      col *= max(vignette, 0.3);
      col = pow(col, vec3(0.9));
    } else {
      col = vec3(0.98, 0.98, 0.97);

      vec3 peach = vec3(1.0, 0.85, 0.75);
      vec3 salmon = vec3(1.0, 0.75, 0.7);
      vec3 lavender = vec3(0.85, 0.75, 0.95);
      vec3 skyBlue = vec3(0.75, 0.85, 1.0);

      float blobIntensity = light1 * 0.5 + light2 * 0.3 + centerGlow * 0.8;
      blobIntensity = smoothstep(0.0, 1.0, blobIntensity);

      vec3 gradientColor = mix(peach, salmon, smoothstep(0.3, 0.5, xPos));
      gradientColor = mix(gradientColor, lavender, smoothstep(0.5, 0.7, xPos));
      gradientColor = mix(gradientColor, skyBlue, smoothstep(0.7, 0.9, xPos));

      col = mix(col, gradientColor, blobIntensity * 0.7);

      float radialFade = 1.0 - length(vec2(xPos - 0.5, uv.y - 0.3) * vec2(1.2, 1.5));
      radialFade = smoothstep(0.0, 0.8, radialFade);
      col = mix(vec3(0.98, 0.98, 0.97), col, radialFade);
    }

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function FinalCTA(): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number>(0);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2(width, height) },
      isDark: { value: isDark ? 1.0 : 0.0 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const startTime = Date.now();
    function animate() {
      uniforms.iTime.value = (Date.now() - startTime) / 1000;
      renderer.render(scene, camera);
      frameIdRef.current = requestAnimationFrame(animate);
    }
    animate();

    function handleResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      uniforms.iResolution.value.set(w, h);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameIdRef.current);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isDark]);

  return (
    <section className="relative flex min-h-[20vh] w-full items-center justify-center overflow-hidden">
      <div
        ref={containerRef}
        className="absolute inset-0 z-0"
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center sm:px-8 sm:py-32">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="mx-auto max-w-md font-serif text-4xl font-medium leading-tight text-foreground md:text-5xl"
        >
          Ready to accept payments without limits?
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2, ease }}
          className="mt-10"
        >
          <a
            href="/signup"
            className="inline-flex items-center rounded-full bg-foreground px-8 py-4 text-sm font-medium text-background transition-all duration-150 hover:bg-foreground/90 active:scale-[0.97]"
          >
            Get started free
          </a>
        </motion.div>
      </div>
    </section>
  );
}

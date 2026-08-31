"use client";

import React, { useEffect, useRef, useState } from "react";

interface CasaMoneyRainProps {
  /** Target CSS selector for the button to absorb money */
  targetSelector?: string;
  /** Total simultaneous particles in the burst from center */
  count?: number;
  /** Whether full screen */
  fullScreen?: boolean;
  /** Global opacity */
  opacity?: number;
  /** Custom z-index */
  zIndex?: number;
  /** Callback fired once all bills have finished flying into the button and disappeared */
  onComplete?: () => void;
}

interface Particle {
  id: number;
  imgIndex: number;
  // Position
  x: number;
  y: number;
  // Physics & Phases: burst_radial -> flutter_scatter -> swarm_to_target -> absorbed
  phase: "burst_radial" | "flutter_scatter" | "swarm_to_target" | "absorbed";
  phaseTime: number;
  totalTime: number;
  // Velocities & Drag
  vx: number;
  vy: number;
  drag: number;
  // Flutter / Scatter attributes
  swayFreq: number;
  swayAmp: number;
  scatterDuration: number;
  // Swarm attributes
  swarmSpeed: number;
  // 3D rotation simulation
  rotZ: number;
  rotSpeedZ: number;
  rotX: number;
  rotSpeedX: number;
  scale: number;
  targetScale: number;
  width: number;
  height: number;
  alpha: number;
  targetAlpha: number;
}

export default function CasaMoneyRain({
  targetSelector = "#header-user-menu-trigger",
  count = 45,
  fullScreen = true,
  opacity = 0.9,
  zIndex = 99999,
  onComplete,
}: CasaMoneyRainProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Load banknote images
    const srcList = ["/hero-bill-1.png", "/hero-bill-2.png", "/hero-bill-3.png"];
    let loadedCount = 0;
    const imgs: HTMLImageElement[] = [];

    srcList.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === srcList.length) {
          imagesRef.current = imgs;
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === srcList.length) {
          imagesRef.current = imgs;
          setImagesLoaded(true);
        }
      };
      imgs.push(img);
    });
  }, []);

  useEffect(() => {
    if (!imagesLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvasRef.current) return;
      width = canvasRef.current.width = window.innerWidth;
      height = canvasRef.current.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Find Target Position
    const getTargetPos = (): { x: number; y: number } => {
      const el = document.querySelector(targetSelector);
      if (el) {
        const rect = el.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }
      // Fallback: top header position
      return {
        x: document.dir === "rtl" ? 80 : width - 80,
        y: 36,
      };
    };

    // Center coordinates where money emerges and scatters
    const centerX = width / 2;
    const centerY = height * 0.48;

    // Helper to spawn a particle exploding outward from center of screen
    const spawnParticle = (id: number, index: number): Particle => {
      const isMobile = width < 640;
      const baseWidth = isMobile
        ? 32 + Math.random() * 18
        : 44 + Math.random() * 26;
      const baseHeight = baseWidth * 0.48;

      // 360 degree radial explosion angle from center
      const angle = (index / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.45;
      const initialBurstSpeed = isMobile
        ? 7 + Math.random() * 9
        : 10 + Math.random() * 13;

      // Staggered launch delay
      const delayMs = (index % 5) * 35;

      return {
        id,
        imgIndex: Math.floor(Math.random() * 3),
        // Start precisely in the middle of the screen
        x: centerX + (Math.random() - 0.5) * 20,
        y: centerY + (Math.random() - 0.5) * 20,
        phase: "burst_radial",
        phaseTime: -delayMs,
        totalTime: 0,
        vx: Math.cos(angle) * initialBurstSpeed,
        vy: Math.sin(angle) * initialBurstSpeed * 0.85, // slightly oval spread
        drag: 0.92,
        swayFreq: 2.5 + Math.random() * 2.0,
        swayAmp: 16 + Math.random() * 20,
        scatterDuration: 0.75 + Math.random() * 0.55, // duration hovering in center
        swarmSpeed: 0,
        rotZ: (Math.random() - 0.5) * 2.5,
        rotSpeedZ: (Math.random() - 0.5) * 0.12,
        rotX: Math.random() * Math.PI,
        rotSpeedX: 0.05 + Math.random() * 0.08,
        scale: 0.2, // emerges from tiny point in center
        targetScale: 1.0,
        width: baseWidth,
        height: baseHeight,
        alpha: 0,
        targetAlpha: opacity * (0.8 + Math.random() * 0.2),
      };
    };

    // Spawn all particles starting from the center of the page
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push(spawnParticle(i, i));
    }

    let lastTime = performance.now();
    let hitCounter = 0;
    let completedTriggered = false;

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      const target = getTargetPos();
      let activeCount = 0;

      particles.forEach((p) => {
        // If absorbed, bill is permanently gone
        if (p.phase === "absorbed") {
          return;
        }

        activeCount++;
        p.phaseTime += dt;
        p.totalTime += dt;

        // Skip if still in initial micro-stagger
        if (p.phaseTime < 0) return;

        // Scale & Alpha interpolation
        p.scale += (p.targetScale - p.scale) * 0.14;
        p.alpha += (p.targetAlpha - p.alpha) * 0.18;

        // 3D rotation update
        p.rotZ += p.rotSpeedZ;
        p.rotX += p.rotSpeedX;

        // --- State Machine ---

        // PHASE 1: Explosive radial spray from center of page
        if (p.phase === "burst_radial") {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= p.drag;
          p.vy *= p.drag;

          // Transition to floating scatter after decelerating
          if (p.phaseTime >= 0.35 || Math.hypot(p.vx, p.vy) < 1.4) {
            p.phase = "flutter_scatter";
            p.phaseTime = 0;
          }
        }
        // PHASE 2: Fluttering and drifting beautifully in the center of the page
        else if (p.phase === "flutter_scatter") {
          p.x += Math.sin(p.totalTime * p.swayFreq) * p.swayAmp * dt * 2.2;
          p.y += Math.cos(p.totalTime * p.swayFreq * 0.8) * 8 * dt;

          // After hovering in center, get sucked into the header fuel button!
          if (p.phaseTime >= p.scatterDuration) {
            p.phase = "swarm_to_target";
            p.phaseTime = 0;
            p.swarmSpeed = 6;
          }
        }
        // PHASE 3: Accelerated flight path straight into the target button
        else if (p.phase === "swarm_to_target") {
          const dx = target.x - p.x;
          const dy = target.y - p.y;
          const dist = Math.hypot(dx, dy);

          // Accelerate aggressively towards button
          p.swarmSpeed += 52 * dt;
          const angle = Math.atan2(dy, dx);

          // Curving suction physics
          p.vx += (Math.cos(angle) * p.swarmSpeed - p.vx) * 0.28;
          p.vy += (Math.sin(angle) * p.swarmSpeed - p.vy) * 0.28;

          p.x += p.vx;
          p.y += p.vy;

          // Align rotation with direction of flight
          p.rotZ = angle + Math.sin(p.totalTime * 14) * 0.2;
          // Shrink as it enters the button
          p.targetScale = Math.max(0.18, Math.min(1.0, dist / 220));

          // Contact detection with button
          if (dist < 32 || (p.y < target.y + 16 && Math.abs(dx) < 28)) {
            p.phase = "absorbed";
            p.alpha = 0;
            hitCounter++;

            // Dispatch fuel event to trigger button rumble & green fuel glow
            window.dispatchEvent(
              new CustomEvent("money-fuel-pulse", {
                detail: {
                  hitCount: hitCounter,
                  targetX: target.x,
                  targetY: target.y,
                },
              })
            );
          }
        }

        // Draw Bill on Canvas
        const img = imagesRef.current[p.imgIndex];
        if (img && p.alpha > 0.01 && p.phase !== "absorbed") {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotZ);

          // 3D flip effect
          const flipScaleY = Math.cos(p.rotX);
          ctx.scale(p.scale, p.scale * flipScaleY);

          ctx.globalAlpha = p.alpha;

          ctx.shadowColor = "rgba(15, 23, 42, 0.28)";
          ctx.shadowBlur = 8;
          ctx.shadowOffsetY = 4;

          ctx.drawImage(
            img,
            -p.width / 2,
            -p.height / 2,
            p.width,
            p.height
          );
          ctx.restore();
        }
      });

      // When all bills are absorbed into the button -> trigger climax & finish
      if (activeCount === 0) {
        ctx.clearRect(0, 0, width, height);
        if (!completedTriggered) {
          completedTriggered = true;

          // Dispatch climax sequence event to target button
          window.dispatchEvent(
            new CustomEvent("money-fuel-climax", {
              detail: {
                totalBills: count,
                durationMs: 1850,
                targetX: target.x,
                targetY: target.y,
              },
            })
          );

          // Block all further transitions until the fuel tank sequence has fully completed!
          setTimeout(() => {
            if (onCompleteRef.current) {
              onCompleteRef.current();
            }
          }, 1850);
        }
        return; // stop RAF loop completely
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, [imagesLoaded, count, opacity, targetSelector]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none select-none ${
        fullScreen ? "fixed inset-0" : "absolute inset-0"
      }`}
      style={{ zIndex }}
    />
  );
}

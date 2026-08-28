"use client";

import React from "react";

interface GrowlabLogoIconProps {
  className?: string;
  size?: number;
  tone?: "header" | "footer" | "light" | "dark" | "auto";
}

export default function GrowlabLogoIcon({
  className = "",
  size = 36,
  tone = "header",
}: GrowlabLogoIconProps) {
  const isDarkBag = tone === "footer" || tone === "dark";

  if (isDarkBag) {
    // Black Bag Logo for Dark Backgrounds (Footer)
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 select-none ${className}`}
        aria-hidden="true"
      >
        <g>
          {/* Back Strap Handle */}
          <path
            d="M218 120 C220 50, 275 16, 318 16 C358 16, 382 52, 386 112"
            stroke="#111318"
            strokeWidth="22"
            strokeLinecap="round"
            fill="none"
          />

          {/* Front Strap Handle */}
          <path
            d="M174 135 C176 65, 230 24, 272 24 C312 24, 336 62, 340 125"
            stroke="#111318"
            strokeWidth="24"
            strokeLinecap="round"
            fill="none"
          />

          {/* Right 3D Side Depth Panel */}
          <path
            d="M362 104 L422 130 C432 134 438 144 440 155 L458 438 C460 452 449 464 435 464 L384 466 L362 104 Z"
            fill="#1D2027"
          />

          {/* Main Bag Front Face */}
          <path
            d="M136 136 C136 126 144 118 154 116 L356 102 C366 101 375 109 376 119 L396 438 C397 450 387 460 375 461 L116 434 C104 433 95 422 96 410 L136 136 Z"
            fill="#111318"
          />

          {/* 3D Vertical Edge Crease / Highlight */}
          <path
            d="M362 104 L384 466"
            stroke="#FFFFFF"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Bottom Fold Highlight */}
          <path
            d="M384 466 L435 464"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Flask Lip Rim */}
          <path
            d="M212 284 C210 284 207 286 207 288 C207 292 214 294 220 294 L276 294 C282 294 289 292 289 288 C289 286 286 284 284 284"
            stroke="#FFFFFF"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Flask Body Frame */}
          <path
            d="M228 294 L228 306 L175 418 C166 437 180 458 201 458 L295 458 C316 458 330 437 321 418 L268 306 L268 294"
            stroke="#FFFFFF"
            strokeWidth="15"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Central Sprout Stem */}
          <path
            d="M250 420 C242 380 236 345 244 300 C252 255 246 220 280 180 C264 216 254 260 252 350 C251 385 252 405 250 420 Z"
            fill="#FFFFFF"
          />

          {/* Large Top-Right Leaf */}
          <path
            d="M246 282 C248 240 270 178 346 104 C350 148 334 202 280 238 C265 248 252 264 246 282 Z"
            fill="#FFFFFF"
          />

          {/* Left Leaf */}
          <path
            d="M242 262 C228 248 196 230 156 190 C162 232 188 268 238 276 C240 271 241 266 242 262 Z"
            fill="#FFFFFF"
          />

          {/* Seed Droplet */}
          <path
            d="M225 390 C216 370 236 350 242 372 C246 386 234 402 225 390 Z"
            fill="#FFFFFF"
          />
        </g>
      </svg>
    );
  }

  // White Bag Logo with Black Plant for Light Backgrounds (Header)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-hidden="true"
    >
      <g>
        {/* Back Strap Outline & Fill */}
        <path
          d="M218 120 C220 50, 275 16, 318 16 C358 16, 382 52, 386 112"
          stroke="#111318"
          strokeWidth="10"
          strokeLinecap="round"
          fill="#FFFFFF"
        />

        {/* Front Strap Outline & Fill */}
        <path
          d="M174 135 C176 65, 230 24, 272 24 C312 24, 336 62, 340 125"
          stroke="#111318"
          strokeWidth="10"
          strokeLinecap="round"
          fill="#FFFFFF"
        />

        {/* Right 3D Side Depth Panel */}
        <path
          d="M362 104 L422 130 C432 134 438 144 440 155 L458 438 C460 452 449 464 435 464 L384 466 L362 104 Z"
          fill="#F4F4F5"
          stroke="#111318"
          strokeWidth="9"
          strokeLinejoin="round"
        />

        {/* Main Bag Front Face */}
        <path
          d="M136 136 C136 126 144 118 154 116 L356 102 C366 101 375 109 376 119 L396 438 C397 450 387 460 375 461 L116 434 C104 433 95 422 96 410 L136 136 Z"
          fill="#FFFFFF"
          stroke="#111318"
          strokeWidth="9"
          strokeLinejoin="round"
        />

        {/* Flask Lip Rim */}
        <path
          d="M212 284 C210 284 207 286 207 288 C207 292 214 294 220 294 L276 294 C282 294 289 292 289 288 C289 286 286 284 284 284"
          stroke="#111318"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Flask Body Frame */}
        <path
          d="M228 294 L228 306 L175 418 C166 437 180 458 201 458 L295 458 C316 458 330 437 321 418 L268 306 L268 294"
          stroke="#111318"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Central Sprout Stem */}
        <path
          d="M250 420 C242 380 236 345 244 300 C252 255 246 220 280 180 C264 216 254 260 252 350 C251 385 252 405 250 420 Z"
          fill="#111318"
        />

        {/* Large Top-Right Leaf */}
        <path
          d="M246 282 C248 240 270 178 346 104 C350 148 334 202 280 238 C265 248 252 264 246 282 Z"
          fill="#111318"
        />

        {/* Left Leaf */}
        <path
          d="M242 262 C228 248 196 230 156 190 C162 232 188 268 238 276 C240 271 241 266 242 262 Z"
          fill="#111318"
        />

        {/* Seed Droplet */}
        <path
          d="M225 390 C216 370 236 350 242 372 C246 386 234 402 225 390 Z"
          fill="#111318"
        />
      </g>
    </svg>
  );
}

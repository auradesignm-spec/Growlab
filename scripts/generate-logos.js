const sharp = require("sharp");
const fs = require("fs");

// Precise vector generation for Growlab Header (White Bag with Black Plant & Outlines)
const headerSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Soft background transparent padding -->
  <g transform="translate(12, 10)">
    <!-- 1. BACK HANDLE -->
    <path
      d="M440 250 C440 90, 620 90, 620 250"
      stroke="#111318"
      stroke-width="26"
      stroke-linecap="round"
      fill="#FFFFFF"
    />
    <path
      d="M440 250 C440 90, 620 90, 620 250"
      stroke="#111318"
      stroke-width="26"
      stroke-linecap="round"
      fill="none"
    />

    <!-- 2. FRONT HANDLE -->
    <path
      d="M360 270 C360 110, 540 110, 540 270"
      stroke="#111318"
      stroke-width="28"
      stroke-linecap="round"
      fill="#FFFFFF"
    />
    <path
      d="M360 270 C360 110, 540 110, 540 270"
      stroke="#111318"
      stroke-width="28"
      stroke-linecap="round"
      fill="none"
    />

    <!-- 3. 3D RIGHT SIDE PANEL -->
    <path
      d="M710 220 L805 255 C820 260 830 275 832 290 L870 825 C873 845 860 865 840 872 L760 905 L710 220 Z"
      fill="#FFFFFF"
      stroke="#111318"
      stroke-width="20"
      stroke-linejoin="round"
    />

    <!-- 4. FRONT BAG FACE -->
    <path
      d="M270 270 C270 255 282 242 298 240 L702 220 C718 218 732 230 734 246 L762 880 C764 898 750 914 732 915 L212 855 C194 853 180 837 182 819 L270 270 Z"
      fill="#FFFFFF"
      stroke="#111318"
      stroke-width="22"
      stroke-linejoin="round"
    />

    <!-- 5. 3D INNER CREASE LINE -->
    <path
      d="M710 220 L760 905"
      stroke="#111318"
      stroke-width="14"
      stroke-linecap="round"
    />
    <path
      d="M760 905 L840 872"
      stroke="#111318"
      stroke-width="14"
      stroke-linecap="round"
    />

    <!-- 6. FLASK LOWER FRAME -->
    <!-- Flask lip flange -->
    <path
      d="M405 570 C395 570 390 575 390 580 C390 588 400 592 410 592 L565 592 C575 592 585 588 585 580 C585 575 580 570 570 570"
      stroke="#111318"
      stroke-width="24"
      stroke-linecap="round"
    />
    <!-- Flask body outline -->
    <path
      d="M428 592 L428 610 L330 820 C316 850 338 885 372 885 L608 885 C642 885 664 850 650 820 L552 610 L552 592"
      stroke="#111318"
      stroke-width="26"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />

    <!-- 7. FLASK NECK SOLID BASE WITH CUTOUT SEED -->
    <path
      d="M428 600 L428 670 C430 730 460 780 490 805 C510 780 540 730 552 670 L552 600 Z"
      fill="#111318"
    />

    <!-- Central S-curve stem rising up -->
    <path
      d="M470 760 C455 690 450 630 475 560 C495 500 480 430 535 360 C510 420 490 490 495 580 C500 640 488 710 470 760 Z"
      fill="#111318"
    />

    <!-- 8. LEFT LEAF (Plump, elegant leaf pointing top-left) -->
    <path
      d="M475 560 C450 540 380 500 290 395 C305 470 365 545 470 565 Z"
      fill="#111318"
    />

    <!-- 9. RIGHT LEAF (Magnificent large sweeping leaf pointing top-right) -->
    <path
      d="M480 550 C485 450 530 330 705 230 C710 325 665 425 540 505 C510 525 490 540 480 550 Z"
      fill="#111318"
    />

    <!-- 10. SEED / DROPLET INSIDE FLASK (Negative space cut) -->
    <path
      d="M445 745 C430 705 465 675 480 710 C490 735 465 765 445 745 Z"
      fill="#FFFFFF"
    />
  </g>
</svg>
`;

// Precise vector generation for Growlab Footer (Black Bag with White Plant & White Frame)
const footerSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(12, 10)">
    <!-- 1. BACK HANDLE -->
    <path
      d="M440 250 C440 90, 620 90, 620 250"
      stroke="#111318"
      stroke-width="36"
      stroke-linecap="round"
      fill="none"
    />

    <!-- 2. FRONT HANDLE -->
    <path
      d="M360 270 C360 110, 540 110, 540 270"
      stroke="#111318"
      stroke-width="38"
      stroke-linecap="round"
      fill="none"
    />

    <!-- 3. 3D RIGHT SIDE PANEL (Dark Charcoal 3D depth) -->
    <path
      d="M710 220 L805 255 C820 260 830 275 832 290 L870 825 C873 845 860 865 840 872 L760 905 L710 220 Z"
      fill="#1E222B"
    />

    <!-- 4. FRONT BAG FACE (Solid Black) -->
    <path
      d="M270 270 C270 255 282 242 298 240 L702 220 C718 218 732 230 734 246 L762 880 C764 898 750 914 732 915 L212 855 C194 853 180 837 182 819 L270 270 Z"
      fill="#111318"
    />

    <!-- 5. 3D WHITE HIGHLIGHT EDGES -->
    <path
      d="M710 220 L760 905"
      stroke="#FFFFFF"
      stroke-width="10"
      stroke-linecap="round"
      opacity="0.9"
    />
    <path
      d="M760 905 L840 872"
      stroke="#FFFFFF"
      stroke-width="8"
      stroke-linecap="round"
      opacity="0.8"
    />

    <!-- 6. FLASK LOWER FRAME (Crisp White) -->
    <!-- Flask lip flange -->
    <path
      d="M405 570 C395 570 390 575 390 580 C390 588 400 592 410 592 L565 592 C575 592 585 588 585 580 C585 575 580 570 570 570"
      stroke="#FFFFFF"
      stroke-width="24"
      stroke-linecap="round"
    />
    <!-- Flask body outline -->
    <path
      d="M428 592 L428 610 L330 820 C316 850 338 885 372 885 L608 885 C642 885 664 850 650 820 L552 610 L552 592"
      stroke="#FFFFFF"
      stroke-width="26"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />

    <!-- 7. FLASK NECK SOLID BASE (White) -->
    <path
      d="M428 600 L428 670 C430 730 460 780 490 805 C510 780 540 730 552 670 L552 600 Z"
      fill="#FFFFFF"
    />

    <!-- Central S-curve stem rising up -->
    <path
      d="M470 760 C455 690 450 630 475 560 C495 500 480 430 535 360 C510 420 490 490 495 580 C500 640 488 710 470 760 Z"
      fill="#FFFFFF"
    />

    <!-- 8. LEFT LEAF (White) -->
    <path
      d="M475 560 C450 540 380 500 290 395 C305 470 365 545 470 565 Z"
      fill="#FFFFFF"
    />

    <!-- 9. RIGHT LEAF (White) -->
    <path
      d="M480 550 C485 450 530 330 705 230 C710 325 665 425 540 505 C510 525 490 540 480 550 Z"
      fill="#FFFFFF"
    />

    <!-- 10. SEED / DROPLET INSIDE FLASK (Negative space cut inside white base) -->
    <path
      d="M445 745 C430 705 465 675 480 710 C490 735 465 765 445 745 Z"
      fill="#111318"
    />
  </g>
</svg>
`;

async function main() {
  await sharp(Buffer.from(headerSvg))
    .resize(512, 512)
    .png()
    .toFile("public/logo-header.png");
  console.log("Wrote high-res public/logo-header.png");

  await sharp(Buffer.from(footerSvg))
    .resize(512, 512)
    .png()
    .toFile("public/logo-footer.png");
  console.log("Wrote high-res public/logo-footer.png");
}

main().catch(console.error);

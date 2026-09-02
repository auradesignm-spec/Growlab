---
name: Bousala Financial Compliance
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#665f3d'
  on-secondary: '#ffffff'
  secondary-container: '#eae0b5'
  on-secondary-container: '#6a6341'
  tertiary: '#50616b'
  on-tertiary: '#ffffff'
  tertiary-container: '#94a5b0'
  on-tertiary-container: '#2b3b44'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#ede3b8'
  secondary-fixed-dim: '#d1c79d'
  on-secondary-fixed: '#201c02'
  on-secondary-fixed-variant: '#4d4727'
  tertiary-fixed: '#d3e5f1'
  tertiary-fixed-dim: '#b7c9d5'
  on-tertiary-fixed: '#0c1e26'
  on-tertiary-fixed-variant: '#384953'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
typography:
  display-lg:
    fontFamily: Cairo
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 60px
  headline-lg:
    fontFamily: Cairo
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Cairo
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Cairo
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Tajawal
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Tajawal
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Tajawal
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  caption:
    fontFamily: Tajawal
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  section-padding: 80px
---

## Brand & Style

This design system is engineered for a high-stakes financial and legal environment. The brand personality is authoritative yet accessible, positioning itself as a precise navigational tool for Omani businesses. It leverages a **Modern Corporate** aesthetic with **Glassmorphic** accents to signify transparency and technological sophistication.

The visual direction emphasizes structural integrity and clarity. It avoids any form of whimsy, utilizing a strict RTL layout and abstract geometric motifs to communicate efficiency. The emotional response is one of security, reliability, and modern foresight.

## Colors

The palette is anchored by a deep "Omani Green" spectrum, symbolizing growth and regulatory compliance. 

- **Primary**: Used for main actions and brand identifiers.
- **Secondary Pastels**: Applied to background highlights, category chips, and soft compartmentalization of data.
- **Neutrals**: A sophisticated range of cool grays. Dark mode surfaces should utilize `#111827`, while light mode leverages `#FFFFFF` with `#F9FAFB` for section differentiation.
- **Status Colors**: Standardized for immediate recognition of compliance states: Green (Compliant), Yellow (Pending), Red (Non-Compliant).

## Typography

The typography system is optimized for Arabic script legibility in financial contexts.

- **Headings (Cairo)**: A geometric sans-serif that provides a strong architectural foundation. Use for all titles and section headers.
- **Body & Labels (Tajawal)**: Chosen for its high legibility in long-form text and data tables. 
- **Alignment**: Strictly Right-to-Left (RTL). Ensure paragraph tracking and line heights are generous to account for the verticality of Arabic characters.

## Layout & Spacing

The layout follows a **Fixed Grid** model within a 1280px container, centered on the viewport. 

- **Grid**: 12-column system for desktop, 6-column for tablet, and 2-column for mobile.
- **Vertical Rhythm**: Generous vertical spacing (80px between major sections) to prevent cognitive overload in complex compliance dashboards.
- **RTL Logic**: All horizontal flows (navigation, progress indicators, form labels) must originate from the right.

## Elevation & Depth

This design system uses a hybrid of **Tonal Layers** and **Glassmorphism** to establish hierarchy.

- **Level 1 (Base)**: `#FFFFFF` or `#F9FAFB`.
- **Level 2 (Cards)**: Solid white with a soft, diffused shadow (`0 10px 25px -5px rgba(0,0,0,0.04)`) or a semi-transparent glass effect (`rgba(255,255,255,0.7)`) with a 12px backdrop-blur and a subtle `1px` border in `#E5E7EB`.
- **Level 3 (Modals/Popovers)**: Higher contrast shadows to isolate the element from the data-heavy background.

## Shapes

The shape language combines strict grid alignment with highly organic corner treatments.

- **Interactive Elements**: Buttons and input fields utilize a `pill-shaped` (fully rounded) profile to feel approachable and modern.
- **Containers**: Cards and main UI surfaces use a large corner radius (1.5rem to 2rem) to soften the "industrial" feel of financial data.
- **Decorative Elements**: Only use abstract geometric shapes (circles, triangles, lines). Do not use icons that represent literal objects unless they are standard UI glyphs.

## Components

### Buttons
- **Primary**: Pill-shaped, `#10B981` background, `#FFFFFF` text. Elevation: Slight hover lift.
- **Secondary**: Pill-shaped, `#F3F4F6` background, `#1F2937` text.
- **Ghost**: No background, primary color border and text.

### Cards
- **Compliance Card**: Large 24px-32px border radius. Use glassmorphic treatment for AI-generated insights to distinguish them from static data.

### Input Fields
- Fully rounded borders. 1px solid `#D1D5DB`. Focus state: 2px solid `#10B981` with a soft green outer glow.

### Progress Bars
- 4px height (Thin). Track: `#F3F4F6`. Fill: `#10B981`.

### Chips / Tags
- Used for compliance status. Pill-shaped with low-saturation pastel backgrounds from the secondary palette and high-saturation text of the same hue.

### Tables
- Clean, minimal borders. Header row background: `#F9FAFB`. Text alignment: Right.

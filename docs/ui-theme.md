Here’s an updated version of your **UI Theme Documentation** reflecting the changes to an **interactive blue-white theme** with **text-black font** across the app:

---

# UI Theme Documentation (Interactive Blue-White Theme)

This document outlines the UI theme implementation for the Disaster Management project. The project uses TailwindCSS with a custom theme configuration that supports both light and dark modes.

## Color System

### Base Colors
The theme uses HSL (Hue, Saturation, Lightness) color values for consistent and flexible color management.

#### Light Mode

- **Background**: Soft White (`--background: 210 40% 98%`)
- **Foreground**: Black (`--foreground: 0 0% 0%`)
- **Primary**: Interactive Blue (`--primary: 217 90% 60%`)
- **Secondary**: Light Blue Tint (`--secondary: 210 100% 96%`)
- **Accent**: Light Blue Tint (`--accent: 210 100% 96%`)
- **Destructive**: Alert Red (`--destructive: 0 84.2% 60.2%`)

#### Dark Mode

- **Background**: Deep Navy (`--background: 217.2 32.6% 12%`)
- **Foreground**: White (`--foreground: 0 0% 100%`)
- **Primary**: Bright Interactive Blue (`--primary: 217 100% 65%`)
- **Secondary**: Dim Blue Tint (`--secondary: 217 32% 20%`)
- **Accent**: Dim Blue Tint (`--accent: 217 32% 20%`)
- **Destructive**: Muted Red (`--destructive: 0 62.8% 30.6%`)

### Chart Colors
Interactive palette for data visualization:

1. Interactive Blue: `--chart-1`
2. Electric Indigo: `--chart-2`
3. Vivid Pink: `--chart-3`
4. Signal Red: `--chart-4`
5. Soft Yellow: `--chart-5`
6. Aqua Green: `--chart-6`

## Component Styling

### Cards
- **Light mode**: White base with black text
- **Dark mode**: Navy base with white text
- Rounded corners and subtle shadows for depth

### Popover Elements
- Inherits card theme
- Maintains clarity in both light and dark themes

### Input Elements
- Blue borders with light backgrounds
- Ring focus in interactive blue
- Strong contrast with black placeholder text

## Animations and Transitions

### Theme Transitions
Smooth transitions for:
- Backgrounds
- Borders
- Text
- SVG elements

**Duration**: 150ms  
**Timing**: cubic-bezier(0.4, 0, 0.2, 1)

### Pulse Animation
- **Opacity** alternates between `1` and `0.5`
- **Duration**: 2s  
- **Loop**: Infinite  
- **Timing**: cubic-bezier(0.4, 0, 0.6, 1)

## Usage

### Base Styles
```css
@apply bg-background text-black;
```

### Border Styles
```css
@apply border-blue-200;
```

### Border Radius
Default radius: 0.5rem (`--radius: 0.5rem`)

## Best Practices

1. **Always use color variables** (`--primary`, `--background`) over hard-coded values
2. **Ensure high contrast** between text and background
3. **Test** in both light and dark modes
4. **Use theme transitions** for smoother UX
5. **Apply chart colors** sequentially for visual coherence

## Technical Implementation

The theme is implemented using TailwindCSS with custom properties. It includes:

- `@tailwind base`
- `@tailwind components`
- `@tailwind utilities`

Theme toggling uses the `.dark` class modifier. All text defaults to black unless overridden in dark mode.

---

Let me know if you want a snippet of the actual `tailwind.config.js` file for this theme too!
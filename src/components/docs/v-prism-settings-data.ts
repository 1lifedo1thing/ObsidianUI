export const vPrismSettings = [
  { name: "ambientLight", description: "Low-level light across the scene.", range: "0–0.2" },
  { name: "pointLights", description: "Strength of the three point lights around the prism.", range: "0–0.5" },
  { name: "spotIntensity", description: "Spotlight strength applied to the spectrum beam.", range: "0–3" },
  { name: "rainbowGlow", description: "Emission intensity of the rainbow when the beam hits the prism.", range: "0–10" },
  { name: "bloom", description: "Glow added around bright parts of the beam.", range: "0–5" },
  { name: "reflections", description: "Screen-space reflection strength in the reference project.", range: "0–10" },
  { name: "roughness", description: "Surface roughness of the glass; lower values look smoother.", range: "0–1" },
  { name: "ior", description: "Glass index of refraction, which changes how strongly the beam bends.", range: "1–2.33" },
  { name: "thickness", description: "Transmission thickness used by the glass material.", range: "0–3" },
  { name: "background", description: "Scene background color as a hex value.", range: "Any CSS hex color" },
  { name: "prismTint", description: "Base tint color of the prism glass as a hex value.", range: "Any CSS hex color" },
] as const;

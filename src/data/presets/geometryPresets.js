/**
 * Abstract Lines & Geometry Design Presets (Original 50 Themes + 20 New Unique Templates = 70 Total)
 */

function createAbstractTheme(id, name, bg, text, accent, meta, font, pattern, desc, options = {}) {
  return {
    id: `geo-${id}`,
    name,
    category: 'geometry',
    description: desc,
    background: bg,
    textColor: text,
    accentColor: accent,
    metaColor: meta,
    cardBackground: options.cardBackground || 'transparent',
    borderStyle: options.borderStyle || 'none',
    borderColor: options.borderColor || 'transparent',
    fontFamily: font,
    authorFontFamily: options.authorFontFamily || 'Plus Jakarta Sans',
    textAlign: options.textAlign || 'center',
    quoteMarkStyle: options.quoteMarkStyle || 'classic',
    cardStyle: options.cardStyle || 'flat',
    abstractPattern: pattern,
    gradient: options.gradient || null,
    badgeStyle: options.badgeStyle || 'subtle-tag',
    layoutId: options.layoutId || 'classic-centered',
    letterSpacing: options.letterSpacing || '0.02em',
    lineHeight: options.lineHeight || 1.5
  };
}

export const GEOMETRY_PRESETS = [
  // Original 50 Themes
  createAbstractTheme('bauhaus-rings', 'Bauhaus Orbital Rings', '#0a0d14', '#ffffff', '#38bdf8', '#94a3b8', 'Space Grotesk', 'orbital-rings', 'Concentric planetary orbit lines intersecting in subtle harmony.'),
  createAbstractTheme('golden-fibonacci', 'Golden Fibonacci Spiral', '#0b0908', '#fef3c7', '#d4af37', '#a19379', 'Cinzel', 'fibonacci', 'Divine proportion golden spiral gently arced in luminous gold.'),
  createAbstractTheme('celestial-starmap', 'Celestial Star Map', '#040711', '#e0f2fe', '#818cf8', '#64748b', 'Outfit', 'celestial', 'Delicate navigational star chart lines and astrolabe arcs.'),
  createAbstractTheme('zen-waves', 'Zen Wave Contours', '#f5f3ee', '#292524', '#78716c', '#a8a29e', 'Playfair Display', 'zen-waves', 'Flowing Japanese sand garden rake lines curving softly.'),
  createAbstractTheme('isometric-grid', 'Isometric Matrix Grid', '#0f172a', '#f8fafc', '#38bdf8', '#94a3b8', 'Space Mono', 'isometric', 'Three-dimensional architectural perspective lines.'),
  createAbstractTheme('art-deco-sunburst', 'Art Deco Sunburst', '#110d1b', '#faf5ff', '#c084fc', '#e9d5ff', 'Cinzel', 'sunburst', 'Emanating dawn sunburst rays from the upper quadrant.'),
  createAbstractTheme('sacred-yantra', 'Sacred Yantra Mandala', '#180a0a', '#fef2f2', '#f43f5e', '#fecdd3', 'Syne', 'mandala', 'Intricate intersecting sacred triangles and celestial circles.'),
  createAbstractTheme('minimal-diagonal-hatch', 'Diagonal Fine Hatching', '#ffffff', '#111827', '#2563eb', '#6b7280', 'Plus Jakarta Sans', 'diagonal-hatch', 'Ultra-light 45-degree architectural drafting lines.'),
  createAbstractTheme('memphis-subtle', 'Memphis Micro-Geometries', '#fefce8', '#1c1917', '#e11d48', '#ca8a04', 'Syne', 'memphis', 'Playful subtle geometric squiggles, triangles, and dots.'),
  createAbstractTheme('topographic-contour', 'Topographic Alpine Map', '#0e1713', '#ecfdf5', '#34d399', '#6ee7b7', 'Outfit', 'topography', 'Smooth elevation contour lines resembling mountain ranges.'),

  createAbstractTheme('tangent-circles', 'Tangent Geodetic Arcs', '#0a0a0f', '#ffffff', '#a855f7', '#d8b4fe', 'Space Grotesk', 'orbital-rings', 'Floating geometric tangent rings with mathematical rhythm.'),
  createAbstractTheme('soundwave-pulse', 'Harmonic Sound Pulse', '#020617', '#f8fafc', '#06b6d4', '#67e8f9', 'Space Mono', 'zen-waves', 'Subtle audio frequency sine wave ribbons.'),
  createAbstractTheme('prism-caustics', 'Prism Caustic Rays', '#170e24', '#ffffff', '#f472b6', '#38bdf8', 'Outfit', 'sunburst', 'Refracted optical light beams splitting through crystal.'),
  createAbstractTheme('origami-polygons', 'Origami Facet Lines', '#f8fafc', '#0f172a', '#6366f1', '#94a3b8', 'Plus Jakarta Sans', 'isometric', 'Subtle polygonal fold facets and clean creased geometry.'),
  createAbstractTheme('horizon-perspective', 'Vanishing Point Horizon', '#090a0f', '#f1f5f9', '#22d3ee', '#94a3b8', 'Space Grotesk', 'perspective', 'One-point perspective road grid receding into infinity.'),
  createAbstractTheme('hex-hive-vector', 'Hexagonal Carbon Hive', '#0d1117', '#e6edf3', '#2ea043', '#8b949e', 'Space Mono', 'isometric', 'Subtle molecular hexagonal honeycomb network.'),
  createAbstractTheme('sacred-flower-life', 'Flower of Life Geometry', '#16120e', '#faf5ea', '#d4af37', '#a19379', 'Cinzel', 'mandala', 'Ancient overlapping circular geometry symbolizing creation.'),
  createAbstractTheme('crosshair-telemetry', 'Aerospace Crosshairs', '#0b0f19', '#f8fafc', '#f59e0b', '#64748b', 'Space Mono', 'celestial', 'Precision surveyor crosshairs and millimeter tick marks.'),
  createAbstractTheme('sandstone-strata', 'Sedimentary Strata Lines', '#f7f2ea', '#3b2f2f', '#c2410c', '#8a7369', 'Playfair Display', 'topography', 'Wavy geological canyon rock strata lines.'),
  createAbstractTheme('kinetic-slanted', 'Kinetic Vector Rays', '#13041c', '#ffffff', '#ff007f', '#d946ef', 'Syne', 'diagonal-hatch', 'High-speed diagonal motion rays cutting across dark velvet.'),

  createAbstractTheme('nordic-minimal-arc', 'Nordic Horizon Arc', '#fdfbf7', '#1f2937', '#4f46e5', '#9ca3af', 'Plus Jakarta Sans', 'orbital-rings', 'Single majestic sweeping circle intersecting the quote.'),
  createAbstractTheme('quantum-orbit', 'Quantum Electron Cloud', '#05070e', '#e0e7ff', '#6366f1', '#a5b4fc', 'Outfit', 'orbital-rings', 'Tilted elliptical orbital planes of atomic particles.'),
  createAbstractTheme('parchment-compass', 'Navigator Compass Rose', '#f5eee1', '#292524', '#78350f', '#a8a29e', 'Playfair Display', 'celestial', '16th century maritime navigational rhumb lines.'),
  createAbstractTheme('emerald-facets', 'Cut Gemstone Facets', '#04160f', '#ecfdf5', '#10b981', '#a7f3d0', 'Cinzel', 'isometric', 'Precision diamond facet edge lines and reflections.'),
  createAbstractTheme('monolith-shadow-lines', 'Monolith Blind Slats', '#111111', '#ffffff', '#e5e5e5', '#737373', 'Space Grotesk', 'diagonal-hatch', 'Venetian blind shadow lines raking across dark concrete.'),
  createAbstractTheme('astrolabe-dial', 'Medieval Astrolabe Dial', '#0d0d12', '#fefce8', '#ca8a04', '#713f12', 'Cinzel', 'mandala', 'Celestial coordinate grids and graduated circumference rings.'),
  createAbstractTheme('lunar-phases', 'Lunar Phase Orbit', '#07090e', '#f8fafc', '#94a3b8', '#475569', 'Outfit', 'orbital-rings', 'Subtle moon phase cycle silhouettes aligned along an arc.'),
  createAbstractTheme('architect-blueprint-lines', 'Architect Structural Lines', '#022c54', '#ffffff', '#38bdf8', '#bae6fd', 'Space Mono', 'isometric', 'Crisp dimension arrows and structural grid references.'),
  createAbstractTheme('sand-zen-spiral', 'Kyoto Sand Spiral', '#ede6d8', '#2e2820', '#856b50', '#a89d8f', 'Merriweather', 'fibonacci', 'Spiral combed sand lines around moss stones.'),
  createAbstractTheme('synth-retro-sun', 'Synthwave Vector Sun', '#1f092b', '#ffffff', '#ff71ce', '#c084fc', 'Syne', 'sunburst', 'Horizontally sliced sunset disc rising behind quote.'),

  createAbstractTheme('voronoi-cells', 'Voronoi Organic Mesh', '#f4f4f5', '#18181b', '#0ea5e9', '#71717a', 'Plus Jakarta Sans', 'topography', 'Mathematical cellular natural tessellation.'),
  createAbstractTheme('moire-interference', 'Moiré Wave Interference', '#050505', '#f8fafc', '#a855f7', '#64748b', 'Space Grotesk', 'zen-waves', 'Overlapping concentric ring sets creating moiré ripples.'),
  createAbstractTheme('golden-triangle', 'Golden Triad Proportions', '#0c0a07', '#faf5ea', '#d4af37', '#a19379', 'Cinzel', 'mandala', 'Sacred equilateral triangles nested in golden harmony.'),
  createAbstractTheme('radar-sweep', 'Deep Space Radar Sweep', '#011208', '#dcfce7', '#22c55e', '#86efac', 'Space Mono', 'celestial', 'Circular radar degree increments and sweep sector.'),
  createAbstractTheme('crystal-lattice', 'Mineral Crystal Lattice', '#0f172a', '#e2e8f0', '#38bdf8', '#94a3b8', 'Outfit', 'isometric', 'Molecular bonding vectors and node coordinates.'),
  createAbstractTheme('desert-dune-ripples', 'Sahara Wind Ripples', '#faf3e7', '#422006', '#d97706', '#92400e', 'Playfair Display', 'zen-waves', 'Micro-ridges formed by wind across sand dunes.'),
  createAbstractTheme('neon-circuit-traces', 'PCB Vector Traces', '#090a0f', '#ffffff', '#00f2fe', '#94a3b8', 'Space Mono', 'isometric', 'Sleek 45-degree circuit traces with circular vias.'),
  createAbstractTheme('abstract-fluid-contour', 'Liquid Mercury Flow', '#121418', '#f1f5f9', '#94a3b8', '#64748b', 'Syne', 'topography', 'Viscous liquid contours curving organically.'),
  createAbstractTheme('radial-speed-lines', 'Kinetic Manga Burst', '#ffffff', '#000000', '#dc2626', '#4b5563', 'Space Grotesk', 'sunburst', 'Dramatic explosive focus lines drawing eye to text.'),
  createAbstractTheme('ethereal-orbitals', 'Atomic Probability Shells', '#100c24', '#faf5ff', '#c084fc', '#e9d5ff', 'Outfit', 'orbital-rings', 'Diffuse probability electron clouds with orbital rings.'),

  createAbstractTheme('metatron-cube', 'Metatron Cube Geometry', '#0a0a0d', '#fdfbf7', '#d4af37', '#a19379', 'Cinzel', 'mandala', 'Sacred geometry linking all 5 Platonic solids.'),
  createAbstractTheme('matrix-rain-vector', 'Subtle Binary Cascades', '#030d06', '#f0fdf4', '#22c55e', '#4ade80', 'Space Mono', 'diagonal-hatch', 'Faint green vertical code drops spaced in background.'),
  createAbstractTheme('seismograph-pulse', 'Seismograph Earth Pulse', '#f8fafc', '#0f172a', '#ef4444', '#64748b', 'Space Grotesk', 'zen-waves', 'Tremor waveform lines recording tectonic energy.'),
  createAbstractTheme('infinity-loop', 'Lemniscate Infinity Line', '#060a12', '#ffffff', '#38bdf8', '#818cf8', 'Syne', 'fibonacci', 'Graceful continuous infinity loop woven behind words.'),
  createAbstractTheme('tangent-arcs-brass', 'Brushed Brass Geometrics', '#16130f', '#fefce8', '#eab308', '#a16207', 'Playfair Display', 'orbital-rings', 'Artisan hand-drawn brass compass arcs.'),
  createAbstractTheme('glacier-crevasse', 'Glacial Fissure Lines', '#05192d', '#f0f9ff', '#38bdf8', '#7dd3fc', 'Outfit', 'topography', 'Deep blue ice fault lines and stress fractures.'),
  createAbstractTheme('bamboo-stalk-lines', 'Kyoto Bamboo Silhouettes', '#f2ede4', '#1f2e1a', '#4f693e', '#78716c', 'Merriweather', 'diagonal-hatch', 'Vertical bamboo stalk geometry with soft leaf lines.'),
  createAbstractTheme('vector-light-cone', 'Relativistic Light Cone', '#040714', '#e0e7ff', '#818cf8', '#64748b', 'Space Mono', 'perspective', 'Spacetime light cone geometry with event horizon.'),
  createAbstractTheme('astronomy-eclipse-arcs', 'Corona Eclipse Ring', '#000000', '#ffffff', '#fbbf24', '#78716c', 'Cinzel', 'orbital-rings', 'Solar corona diamond ring with faint orbital arcs.'),
  createAbstractTheme('pure-geometry-manifesto', 'Geometric Harmony', '#ffffff', '#111827', '#6366f1', '#4b5563', 'Space Grotesk', 'mandala', 'The golden union of square, circle, and triangle.'),

  // 20 New Unique Geometry Templates
  createAbstractTheme('hypercube-tesseract', 'Tesseract 4D Projection', '#060814', '#e2e8f0', '#00f2fe', '#818cf8', 'Space Mono', 'isometric', 'Four-dimensional hypercube vertices projected in light wireframe.', {
    layoutId: 'cutout-right',
    borderStyle: 'fine-frame',
    borderColor: 'rgba(0, 242, 254, 0.3)',
    cardStyle: 'glass',
    cardBackground: 'rgba(6, 12, 30, 0.65)'
  }),
  createAbstractTheme('penrose-tiling', 'Penrose Aperiodic Rhombus', '#120d09', '#fef3c7', '#d97706', '#92400e', 'Cinzel', 'mandala', 'Infinite non-repeating golden ratio rhombic mathematical tiling.', {
    layoutId: 'offset-editorial',
    borderStyle: 'none'
  }),
  createAbstractTheme('chladni-plate', 'Chladni Acoustic Nodal Lines', '#0a0a0c', '#ffffff', '#38bdf8', '#94a3b8', 'Syne', 'zen-waves', 'Standing sound resonance patterns vibrating across dark slate.', {
    layoutId: 'classic-centered',
    letterSpacing: '0.03em'
  }),
  createAbstractTheme('lissajous-curves', 'Lissajous Harmonic Oscillations', '#03071e', '#e0f2fe', '#06b6d4', '#64748b', 'Space Grotesk', 'fibonacci', 'Parametric sine curve knots traced by intersecting frequencies.', {
    layoutId: 'cutout-left',
    cardStyle: 'glass',
    cardBackground: 'rgba(3, 15, 40, 0.6)'
  }),
  createAbstractTheme('solar-astrolabe', 'Imperial Astrolabe Rete', '#140f08', '#faf5ea', '#eab308', '#a16207', 'Cinzel', 'celestial', 'Precision bronze astrolabe zodiac coordinate pointers and celestial rings.', {
    layoutId: 'badge-pinned-top',
    borderStyle: 'fine-frame',
    borderColor: '#ca8a04'
  }),
  createAbstractTheme('quantum-lattice', 'Superconductor Atomic Lattice', '#080c16', '#f8fafc', '#60a5fa', '#94a3b8', 'Space Mono', 'isometric', 'Crystalline lattice vectors illustrating quantum electron tunneling.', {
    layoutId: 'author-hero-top',
    badgeStyle: 'code-block'
  }),
  createAbstractTheme('golden-spiral-aurora', 'Fibonacci Emerald Aurora', '#021814', '#ecfdf5', '#10b981', '#6ee7b7', 'Playfair Display', 'fibonacci', 'Golden spiral curling gently behind words in luminous emerald tones.', {
    layoutId: 'classic-centered',
    gradient: 'linear-gradient(135deg, #02201b 0%, #064e3b 100%)'
  }),
  createAbstractTheme('hyperbolic-plane', 'Poincaré Hyperbolic Disk', '#080811', '#fdfbf7', '#a855f7', '#c084fc', 'Outfit', 'orbital-rings', 'Non-Euclidean hyperbolic disk tessellation receding to edge infinity.', {
    layoutId: 'cutout-bottom'
  }),
  createAbstractTheme('apollonian-gasket', 'Apollonian Fractal Gasket', '#fcfbf7', '#1c1917', '#4338ca', '#6366f1', 'Plus Jakarta Sans', 'orbital-rings', 'Fractal packing of mutually tangent osculating circles.', {
    layoutId: 'swiss-asymmetric',
    borderStyle: 'none'
  }),
  createAbstractTheme('zenith-sundial', 'Noon Zenith Sundial Declination', '#faf5eb', '#292524', '#b45309', '#78350f', 'Playfair Display', 'sunburst', 'Solar hour lines and declination curves calibrated for summer solstice.', {
    layoutId: 'author-stat-sidebar',
    borderStyle: 'fine-frame',
    borderColor: '#e7decb'
  }),
  createAbstractTheme('cymatics-hex', 'Cymatics Hexagonal Standing Wave', '#0d0d12', '#f3f4f6', '#ec4899', '#f472b6', 'Syne', 'mandala', 'Harmonic fluid vibration producing symmetrical hexagonal wave geometry.', {
    layoutId: 'classic-centered'
  }),
  createAbstractTheme('geodesic-dome', 'Buckminster Geodesic Sphere', '#0b1120', '#f1f5f9', '#38bdf8', '#64748b', 'Space Grotesk', 'isometric', 'Spherical geodesic structural triangles engineered for maximum load.', {
    layoutId: 'cutout-right',
    borderStyle: 'fine-frame',
    borderColor: 'rgba(56, 189, 248, 0.3)'
  }),
  createAbstractTheme('torus-donut', 'Parametric Vector Torus', '#0f051d', '#faf5ff', '#d946ef', '#c084fc', 'Outfit', 'orbital-rings', 'Toroidal geometric surface mesh rendered in luminous violet wireframe.', {
    layoutId: 'author-hero-center'
  }),
  createAbstractTheme('cycloid-wheel', 'Brachistochrone Cycloid Arch', '#f7f6f2', '#18181b', '#0284c7', '#52525b', 'Plus Jakarta Sans', 'zen-waves', 'The curve of fastest descent mathematically traced across clean canvas.', {
    layoutId: 'left-accent-bar',
    borderStyle: 'thick-left',
    borderColor: '#0284c7'
  }),
  createAbstractTheme('triquetra-knot', 'Interlaced Triquetra Arc', '#0a100d', '#f4fbf7', '#14b8a6', '#5eead4', 'Cinzel', 'mandala', 'Sacred geometry trinity arc with continuous seamless interlock.', {
    layoutId: 'classic-centered'
  }),
  createAbstractTheme('sierpinski-mesh', 'Sierpiński Fractal Triangle', '#0f172a', '#e2e8f0', '#f59e0b', '#fbbf24', 'Space Mono', 'diagonal-hatch', 'Recursive fractal subdivision triangles fading delicately into the distance.', {
    layoutId: 'cutout-left',
    badgeStyle: 'code-block'
  }),
  createAbstractTheme('vector-vortex', 'Centripetal Streamline Vortex', '#050c1e', '#e0f2fe', '#00f2fe', '#38bdf8', 'Outfit', 'zen-waves', 'Logarithmic fluid streamlines spiraling gently into deep center.', {
    layoutId: 'big-watermark'
  }),
  createAbstractTheme('prism-refraction', 'Diffraction Grating Ray Paths', '#120826', '#ffffff', '#f43f5e', '#a855f7', 'Syne', 'sunburst', 'Parallel monochromatic light rays diffracting into spectral wavelengths.', {
    layoutId: 'cutout-bottom'
  }),
  createAbstractTheme('mobius-strip', 'Möbius Continuous Boundary', '#fafaf9', '#0c0a09', '#10b981', '#78716c', 'Space Grotesk', 'fibonacci', 'Single continuous surface loop symbolizing eternity and continuous evolution.', {
    layoutId: 'classic-centered',
    borderStyle: 'none'
  }),
  createAbstractTheme('polar-coordinates', 'Nautical Polar Radians', '#02182b', '#f0f9ff', '#38bdf8', '#7dd3fc', 'Space Mono', 'celestial', 'Concentric radial circles with azimuth angle ticks and radian markers.', {
    layoutId: 'author-hero-top',
    badgeStyle: 'code-block'
  })
];

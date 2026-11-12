export const COLORS = {
  background: '#0A0A0A',      // True dark background
  surface: '#1A1A1A',         // Card/panel surface
  surfaceHover: '#2A2A2A',    // Active card/surface
  border: '#333333',          // Dividers and borders
  
  // Industrial Safety/Hazard Colors
  yellow: '#FFE600',          // High-visibility safety yellow
  orange: '#FF6B00',          // Hazard orange
  red: '#FF3B30',             // Alert / Lockout red
  green: '#4CD964',           // Safe / Interlock green
  blue: '#0A84FF',            // Informational blue
  
  // Text Colors
  textPrimary: '#FFFFFF',     // Main text
  textSecondary: '#A0A0A0',   // Secondary metadata
  textDark: '#0A0A0A',        // Text to overlay on yellow/orange/green buttons
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const TYPOGRAPHY = {
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  header: {
    fontSize: 20,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  subheader: {
    fontSize: 16,
    fontWeight: '700',
  },
  body: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
};

export const GLOVE_TARGETS = {
  buttonHeight: 64,          // Min size to operate with heavy gloves
  iconSize: 24,
  borderRadius: 8,
  borderWidth: 2,            // Thick borders for visual clarity
};

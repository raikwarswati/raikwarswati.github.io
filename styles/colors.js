import { Q5_CONNECTION_ORDER } from '../categoryRules.js';

// Color palette for visualizations
export const colorPalette = {
  primary: {
    light: '#FF944D',    // Light orange
    medium: '#E86A1A',   // Medium orange
    dark: '#CC5500',     // Dark orange
    darker: '#994000',   // Very dark orange
    darkest: '#662B00'   // Almost brown orange
  },
  secondary: {
    light: '#FFA666',
    medium: '#E87F33',
    dark: '#CC6619',
    darker: '#994D19',
    darkest: '#663300'
  },
  tertiary: {
    light: '#FFB380',
    medium: '#E8994D',
    dark: '#CC7733'
  },
  theme: {
    background: '#0f0f0f',    // Dark background
    text: '#e0e0e0',          // Light text
    accent: '#e86a1a',        // Orange accent
    secondary: '#cc5500',     // Dark orange secondary
    muted: '#333333'          // Dark gray for muted elements
  }
};

// Function to generate color mapping for categories
export function generateCategoryColors(categories, palette = colorPalette.primary, order = null) {
  const colors = {};
  const colorValues = Object.values(palette);
  // Use the provided order if available, otherwise use categories
  const orderedCategories = order || categories;
  orderedCategories.forEach((category, index) => {
    colors[category] = colorValues[index % colorValues.length];
  });
  return colors;
} 
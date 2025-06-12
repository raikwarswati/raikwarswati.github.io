// categoryRules.js

// Custom order for Q5_identity_connection
export const Q5_CONNECTION_ORDER = [
  "Not at all connected",
  "Not very connected",
  "A little connected",
  "Somewhat connected",
  "Very connected"
];

// Example: Custom order for Q3_generation (edit as needed for your data)
export const Q3_GENERATION_ORDER = [
  "Silent Generation (born ~1928–1945)",
  "Boomer (born ~1946–1964)",
  "Gen X (born ~1965–1980)",
  "Millennial (born ~1981–1996)",
  "Gen Z (born ~1997–2012)"
];

// Label overrides (optional, for display purposes)
export const LABEL_OVERRIDES = {
  Q5_identity_connection: {
    "Not at all connected": "Not at all connected",
    "Not very connected": "Not very connected",
    "A little connected": "A little connected",
    "Somewhat connected": "Somewhat connected",
    "Very connected": "Very connected"
  },
  // Add more label overrides for other properties as needed
}; 
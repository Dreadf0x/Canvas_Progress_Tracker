export const THEMES = {
  ubtech: {
    id: "ubtech",
    name: "UBTech",
    logo: "assets/branding/Wayfinder_White.svg"
  },

  slate: {
    id: "slate",
    name: "Slate",
    logo: "assets/branding/Wayfinder_Dark.svg"
  },

  forest: {
    id: "forest",
    name: "Forest",
    logo: "assets/branding/Wayfinder_Dark.svg"
  },

  dark: {
    id: "dark",
    name: "Dark",
    logo: "assets/branding/Wayfinder_White.svg"
  },

  midnight: {
    id: "midnight",
    name: "Midnight",
    logo: "assets/branding/Wayfinder_White.svg"
  },

  highcontrast: {
    id: "highcontrast",
    name: "High Contrast",
    logo: "assets/branding/Wayfinder_Dark.svg"
  }
};

export function getTheme(themeId = "ubtech") {
  return THEMES[themeId] || THEMES.ubtech;
}

export function applyTheme(themeId = "ubtech") {
  document.documentElement.dataset.cptTheme = themeId;
}
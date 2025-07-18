module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "black-85": "rgba(0,0,0,0.85)",
        "black-65": "rgba(0,0,0,0.65)",
        "black-45": "rgba(0,0,0,0.45)",
        "black-25": "rgba(0,0,0,0.25)",
        "black-25": "rgba(0,0,0,0.15)",
        "white-75": "rgba(255,255,255,0.75)",
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};

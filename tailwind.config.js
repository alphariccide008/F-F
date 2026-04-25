/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.{js,jsx,ts,tsx}",       // entry file
    "./App.{js,jsx,ts,tsx}",         // main app
    "./app/**/*.{js,jsx,ts,tsx}",    // expo-router (pages, _layout, etc.)
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}", // optional if you keep separate screens
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#030014",
        secondary: "#151312",
        light:{
          100:"#D6C6FF",
          200:"#A8B5DB",
          300:"#9CA4AB",
        },
        dark:{
          100:"#221f3d",
          200:"#0f0d23",
          300:"#151312",
        },

        accent: "#AB8BFF",
      },
    },
  },
  plugins: [],
};

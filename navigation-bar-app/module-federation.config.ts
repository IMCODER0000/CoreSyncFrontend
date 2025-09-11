export const mfConfig = {
  name: "navigationBarApp",
  filename: "remoteEntry.js",
  exposes: {
    "./App": "./src/App",
    "./Sidebar": "./src/components/sidebar/Sidebar.tsx",
    "./Topbar": "./src/components/topbar/Topbar.tsx",
  },
  shared: {
    react: { singleton: true, requiredVersion: "^18.2.0" },
    "react-dom": { singleton: true, requiredVersion: "^18.2.0" },
    "@mui/material": { singleton: true, requiredVersion: "^7.0.1" },
    "react-router-dom": { singleton: true, requiredVersion: "^6.30.0" },
  },
};
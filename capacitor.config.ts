import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
    appId: "com.cosmosjourneyer.game",
    appName: "Cosmos Journeyer",
    webDir: "packages/game/dist",
    bundledWebRuntime: false,
    android: {
        backgroundColor: "#000000",
        webContentsDebuggingEnabled: true,
    },
};

export default config;

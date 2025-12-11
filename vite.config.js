import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const roomApiUrl = env.VITE_ROOM_API_URL || "https://watchparty-nodejs-streaming-service.onrender.com";

  return {
    server: {
      proxy: {
        "/stream-service/api": {
          target: roomApiUrl,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/stream-service\/api/, "/api"),
        },
        "/stream-service/socket.io": {
          target: roomApiUrl,
          ws: true,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/stream-service\/socket.io/, "/socket.io"),
        },
      },
    },
  };
});

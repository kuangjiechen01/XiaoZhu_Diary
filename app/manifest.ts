import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "小猪 APP",
    short_name: "小猪",
    description: "一个适合长期记录、双人协作、云同步的共同生活记录 PWA。",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f1ea",
    theme_color: "#f5f1ea",
    lang: "zh-CN",
    icons: [
      {
        src: "/icon",
        type: "image/png",
        sizes: "512x512"
      },
      {
        src: "/apple-icon",
        type: "image/png",
        sizes: "512x512"
      }
    ]
  };
}

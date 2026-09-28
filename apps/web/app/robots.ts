import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://researchos.io";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/discover", "/discover/*", "/search", "/journals", "/login"],
        disallow: [
          "/dashboard/*",
          "/api/*",
          "/settings/*",
          "/submissions/new",
          "/reviews/*",
        ],
      },
      {
        userAgent: ["Googlebot", "Google-Scholar", "bingbot", "Applebot"],
        allow: ["/", "/discover", "/discover/*", "/search"],
        disallow: ["/api/*", "/dashboard/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

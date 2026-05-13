import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;
  const paths = [
    "/",
    "/pricing",
    "/docs",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/book-demo",
    "/book-demo/thanks",
    "/products/payment-gateway",
    "/products/chargeback-shield",
    "/products/instant-settlement",
  ];

  return paths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));
}

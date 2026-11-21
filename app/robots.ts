import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/", "/login", "/signup"], disallow: ["/chats", "/settings", "/groups"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

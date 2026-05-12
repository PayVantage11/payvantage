import { readFile } from "node:fs/promises";
import path from "node:path";

const allowedPluginFiles = new Set([
  "Payvantage-woocomerce.zip",
  "shopify.zip",
]);

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const file = url.searchParams.get("file");

  if (!file || !allowedPluginFiles.has(file)) {
    return Response.json({ error: "Plugin not found" }, { status: 404 });
  }

  try {
    const filePath = path.join(process.cwd(), "plugins", file);
    const data = await readFile(filePath);

    return new Response(data, {
      headers: {
        "Content-Disposition": `attachment; filename="${file}"`,
        "Content-Type": "application/zip",
      },
    });
  } catch (error) {
    console.error(`Failed to read plugin file: ${file}`, error);
    return Response.json({ error: "Plugin not found" }, { status: 404 });
  }
}

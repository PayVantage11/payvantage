import { ArrowRight, Download, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

const integrations = [
  {
    name: "WooCommerce",
    description:
      "Accept PayVantage payments on your WordPress/WooCommerce store. Download the plugin, enter your API keys, and you're live.",
    steps: [
      "Download the plugin ZIP file below",
      "In WordPress, go to Plugins → Add New → Upload Plugin",
      "Activate the plugin and navigate to WooCommerce → Settings → Payments",
      "Enable PayVantage and enter your Publishable and Secret API keys",
      "Save and test with a small payment",
    ],
    downloadHref: "#",
    docsHref: "#",
  },
  {
    name: "Shopify",
    description:
      "Integrate PayVantage as a custom payment method in your Shopify store using our Node.js app bridge.",
    steps: [
      "Create a Custom App in your Shopify admin panel",
      "Clone our Shopify integration starter from GitHub",
      "Set your PayVantage API keys in the environment variables",
      "Deploy to your preferred hosting (Vercel, Railway, etc.)",
      "Install the app in your Shopify store",
    ],
    downloadHref: "#",
    docsHref: "#",
  },
];

export default function IntegrationsPage(): ReactNode {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Integrations
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect PayVantage to your e-commerce platform.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {integrations.map((integration) => (
          <div
            key={integration.name}
            className="flex flex-col rounded-xl border border-border bg-muted/30 p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/10 font-semibold text-foreground">
                {integration.name.charAt(0)}
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {integration.name}
              </h3>
            </div>

            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              {integration.description}
            </p>

            <div className="mb-6 flex-1">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Setup Steps
              </p>
              <ol className="space-y-2">
                {integration.steps.map((step, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm text-foreground/80"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-xs font-medium text-foreground">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={integration.downloadHref}
                className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                <Download className="h-4 w-4" />
                Download Plugin
              </a>
              <a
                href={integration.docsHref}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <ExternalLink className="h-4 w-4" />
                Docs
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-6">
        <h3 className="text-lg font-semibold text-foreground">
          Custom Integration
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Build your own integration using the PayVantage REST API. Send a POST
          request to <code className="text-foreground">/api/checkout</code> with
          your API key, amount, and currency to create a checkout session.
        </p>
        <a
          href="#"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent transition-opacity hover:opacity-80"
        >
          View API Documentation
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

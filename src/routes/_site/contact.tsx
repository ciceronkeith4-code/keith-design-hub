import { createFileRoute } from "@tanstack/react-router";
import { Contact } from "@/components/portfolio/Contact";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/contact")({
  head: () =>
    pageHead({
      path: "/contact",
      title: "Contact | Keith Ciceron",
      description:
        "Get in touch with Keith Ciceron by email, on LinkedIn, or through the contact form.",
    }),
  component: Contact,
});

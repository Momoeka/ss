import fs from "node:fs";
import path from "node:path";

// Body markup migrated 1:1 from legacy index.html. Will be progressively
// componentized — for now we render it as raw HTML so the site is functional
// from day one.
const bodyHtml = fs.readFileSync(
  path.join(process.cwd(), "src", "legacy", "body.html"),
  "utf-8"
);

export default function Home() {
  return <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />;
}

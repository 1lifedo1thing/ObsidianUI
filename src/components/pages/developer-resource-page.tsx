import Link from "next/link";
import { developerResources } from "@/lib/agent/developer-resources";

export function DeveloperResourcePage({ pathname }: { pathname: string }) {
  const resource = developerResources[pathname];
  return (
    <main id="main-content" className="landing-typography mx-auto w-full max-w-4xl px-6 py-16 sm:px-8">
      <Link href="/developers" className="landing-copy text-sm underline underline-offset-4">ObsidianUI Developers</Link>
      <h1 className="landing-title mt-6 text-3xl font-medium tracking-tight sm:text-4xl">{resource.title}</h1>
      <p className="landing-copy mt-5 max-w-[65ch] text-base leading-7">{resource.description}</p>
      {resource.sections.map(section => (
        <section key={section.id} aria-labelledby={section.id} className="mt-12">
          <h2 id={section.id} className="landing-title scroll-mt-24 text-xl font-medium tracking-tight">{section.title}</h2>
          {section.paragraphs?.map(paragraph => <p key={paragraph} className="landing-copy mt-4 text-base leading-7">{paragraph}</p>)}
          {section.code && <pre className="mt-5 overflow-x-auto rounded-xl bg-muted p-5 text-sm leading-7"><code>{section.code}</code></pre>}
          {section.links && (
            <ul className="mt-5 space-y-3">
              {section.links.map(link => (
                <li key={link.href} className="landing-copy text-base leading-7">
                  <Link href={link.href} prefetch={false} className="text-foreground underline decoration-border underline-offset-4 hover:decoration-current">{link.title}</Link>
                  {link.description && <> — {link.description}</>}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </main>
  );
}

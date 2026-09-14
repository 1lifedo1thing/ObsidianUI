"use client";

import * as Accordion from "@radix-ui/react-accordion";
import Link from "next/link";
import { Plus } from "lucide-react";
import "./landing-faq.css";

const REPOSITORY = "https://github.com/Atharvsinh-codez/ObsidianUI";

const sections = [
  {
    id: "open-source",
    title: "Open Source",
    items: [
      {
        id: "free",
        question: "Is ObsidianUI free and open source?",
        answer: <>Yes. ObsidianUI is an open-source component library. Browse the previews, copy the source, and adapt the components to your project. The code is available on <a href={REPOSITORY}>GitHub</a>.</>,
      },
      {
        id: "commercial",
        question: "Can I use ObsidianUI in commercial projects?",
        answer: <>The repository uses the MIT license. Keep its copyright and permission notice with copies of the software. Third-party assets and dependencies retain their own licenses; check those when using demo media. Read the <a href={`${REPOSITORY}/blob/main/LICENSE`}>license</a> for the full terms.</>,
      },
      {
        id: "account",
        question: "Do I need an account or subscription?",
        answer: <>No account or subscription is needed to browse the component library, read the docs, or copy component source code.</>,
      },
      {
        id: "contribute",
        question: "How can I contribute to ObsidianUI?",
        answer: <>Share a bug report, suggest a component, or open a pull request on <a href={REPOSITORY}>GitHub</a>. Include a clear description and a small example so others can understand and try your change.</>,
      },
    ],
  },
  {
    id: "components",
    title: "Components",
    items: [
      {
        id: "stack",
        question: "What do I need to use the components?",
        answer: <>The components are built for React and Tailwind CSS. Many animations use Motion, while some effects use GSAP, Canvas, or Three.js. Each component page lists its dependencies and setup steps.</>,
      },
      {
        id: "install",
        question: "How do I add a component to my project?",
        answer: <>Choose a <Link href="/components">component</Link>, then use its ObsidianUI registry install command or copy all the listed source files manually. Start with the <Link href="/docs/installation">installation guide</Link> if you are setting up a new project.</>,
      },
      {
        id: "customize",
        question: "Can I change the colors, layout, and animation?",
        answer: <>Yes. The source files live in your project, so you can edit the styles, content, props, and animation settings to match your interface.</>,
      },
      {
        id: "preview",
        question: "Can I preview a component before installing it?",
        answer: <>Yes. Explore the <Link href="/components">showcase</Link> and open a component’s documentation to try its preview, inspect the code, and check how it fits your project.</>,
      },
    ],
  },
  {
    id: "support",
    title: "Support",
    items: [
      {
        id: "bugs",
        question: "Where can I report a bug or request a component?",
        answer: <>Open an <a href={`${REPOSITORY}/issues`}>issue on GitHub</a>. For bugs, include the component name, browser, framework version, and steps to reproduce the problem.</>,
      },
      {
        id: "updates",
        question: "How do I update a component I have customized?",
        answer: <>Your copied files stay under your control. Compare your version with the current source before applying an update, then bring over the changes you need while keeping your customizations.</>,
      },
      {
        id: "creator",
        question: "Who is building ObsidianUI?",
        answer: <>ObsidianUI is built by Atharv. Visit <a href="https://athrix.me">athrix.me</a> to see more of his work, or follow <a href="https://x.com/athrix_codes">@athrix_codes</a> for updates.</>,
      },
    ],
  },
];

export function LandingFAQ() {
  return (
    <section id="faq" className="landing-faq" aria-labelledby="faq-title">
      <div className="landing-faq-inner">
        <div className="landing-faq-heading">
          <h2 id="faq-title" className="landing-title">Frequently Asked Questions</h2>
          <p className="landing-copy">Everything about open source, our components, and building your next interface.</p>
        </div>

        <Accordion.Root type="single" collapsible className="landing-faq-groups">
          {sections.map((section) => (
            <div key={section.id} className="landing-faq-group">
              <h3 className="landing-title">{section.title}</h3>
              <div className="landing-faq-items">
                {section.items.map((item) => (
                  <Accordion.Item key={item.id} value={item.id} className="landing-faq-item">
                    <span className="landing-faq-guides" aria-hidden="true"><i /><i /><i /><i /></span>
                    <Accordion.Header asChild>
                      <h4 className="landing-faq-question">
                        <Accordion.Trigger className="landing-faq-trigger">
                          <span>{item.question}</span>
                          <Plus className="landing-faq-plus" size={20} aria-hidden="true" />
                        </Accordion.Trigger>
                      </h4>
                    </Accordion.Header>
                    <Accordion.Content className="landing-faq-answer">
                      <p className="landing-copy">{item.answer}</p>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </div>
            </div>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}

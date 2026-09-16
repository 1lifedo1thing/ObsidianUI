
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PreviewVideo } from "@/components/media/preview-video";

const templates = [
    {
        id: "project-one",
        title: "Project One",
        tags: ["Landing", "Fintech", "Web3"],
        href: "/project-one",
        videoUrl: "https://cdn.obsidianui.dev/templates/project-one.mp4",
        poster: "https://image.mux.com/douTLfhlOThh95tbZdrKwYDGynkP2LG9lKiUbJ00X77Q/thumbnail.png?time=1",
    },
];

function TemplateCard({ template }: { template: typeof templates[0] }) {
    return (
        <article
            className="group block w-full max-w-[600px] mx-auto"
        >
            <div className="rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
                {/* 16:9 Container */}
                <PreviewVideo src={template.videoUrl} label={`${template.title} template preview`} poster={template.poster} playOnHover showControls={false} className="aspect-video" />

                {/* Footer */}
                <Link href={template.href} prefetch={false} className="p-4 flex items-center justify-between gap-3 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring">
                    <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-heading text-sm font-normal text-zinc-900 dark:text-white">
                            {template.title}
                        </h3>
                        <div className="flex items-center gap-1.5">
                            {template.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-normal bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-md"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                    </div>
                </Link>
            </div>
        </article>
    );
}

export default function TemplatesPage() {
    return (
        <div className="font-body font-normal min-h-screen bg-[#fafafa] dark:bg-black">

            <main id="main-content" className="w-full flex flex-col items-center px-4 py-12">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="font-heading text-2xl font-normal text-zinc-900 dark:text-white mb-1">
                        Templates
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Production-ready UI for your next project.
                    </p>
                </div>

                {/* Templates List */}
                <div className="w-full max-w-[1000px] flex flex-col items-center gap-8">
                    {templates.map((template) => (
                        <TemplateCard key={template.id} template={template} />
                    ))}
                </div>
            </main>
        </div>
    );
}

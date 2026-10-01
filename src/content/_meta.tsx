const meta = {
    "index": {
        "title": "Introduction",
        "type": "page",
        "display": "hidden",
        "theme": {
            "layout": "full"
        }
    },
    "---1": {
        "type": "separator",
        "title": "Installation"
    },
    "installation": "Install Next.js",
    "install-tailwind": "Install Tailwind CSS",
    "add-utilities": "Add utilities",
    "cli": "CLI",
    "---2": {
        "type": "separator",
        "title": "Files & Media"
    },
    "hover-img": "Hover Image",
    "---3": {
        "type": "separator",
        "title": "Components"
    },
    "v-prism": "v-prism",
    "404": "404",
    "split-showcase": "Split Showcase",
    "art-gallery": "Art Gallery",
    "---4": {
        "type": "separator",
        "title": "Text Animations"
    },
    "flip-text": "Flip Text",
    "text-stream": "Text reel",
    "---5": {
        "type": "separator",
        "title": "Scroll Animations"
    },
    "draggable-marquee": "Draggable Marquee",
};

// Numeric keys enumerate before other keys. Keep 404 beside v-prism for
// the sidebar, search catalogue, and generated documentation.
export const documentationEntries = Object.entries(meta).filter(([slug]) => slug !== "404");
documentationEntries.splice(
    documentationEntries.findIndex(([slug]) => slug === "v-prism") + 1,
    0,
    ["404", meta["404"]],
);

export default meta;

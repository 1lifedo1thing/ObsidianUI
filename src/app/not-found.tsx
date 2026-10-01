import { FourOhFour } from "@/components/block/404";

export default function NotFound() {
  return (
    <main id="main-content" className="flex min-h-[calc(100svh-160px)] items-center justify-center px-4 py-8 sm:px-8">
      <FourOhFour className="h-[min(68vh,700px)] min-h-[520px] max-w-[1200px] rounded-[28px] border border-border" />
    </main>
  );
}

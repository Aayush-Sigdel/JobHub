import { NotFoundGlitch } from "@/components/motion/not-found/glitch";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] items-center justify-center p-6 bg-background">
      <NotFoundGlitch
        homeHref="/"
        homeLabel="Back to home"
      />
    </div>
  );
}

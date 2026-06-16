import dynamic from "next/dynamic";

// The animator relies on browser-only APIs (rAF, ResizeObserver, MediaRecorder),
// so render it client-side only.
const Animator = dynamic(
  () => import("@/animator/components/Animator").then((m) => m.Animator),
  { ssr: false },
);

export default function Home() {
  return <Animator />;
}

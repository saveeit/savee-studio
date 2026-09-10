import dynamic from "next/dynamic";
import { AnimatorSkeleton } from "@/animator/components/AnimatorSkeleton";

const Animator = dynamic(
  () => import("@/animator/components/Animator").then((m) => m.Animator),
  { ssr: false, loading: () => <AnimatorSkeleton /> },
);

export default function Home() {
  return <Animator />;
}

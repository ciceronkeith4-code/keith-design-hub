import { motion, useScroll, useSpring } from "framer-motion";
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return <motion.div aria-hidden style={{ scaleX }} className="fixed left-0 top-0 z-[110] h-[3px] w-full origin-left bg-[#EB5E28]" />;
}

"use client";
// Reusable animation variants & scroll-triggered wrapper using framer-motion
// Usage: wrap any element with <FadeIn>, <SlideIn>, <ScaleIn>, or <StaggerContainer>

import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";

// ─── Shared Variants ───
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

// ─── Scroll-Triggered FadeIn Wrapper ───
interface AnimProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variants?: Variants;
  once?: boolean;
}

export function FadeIn({ children, className, delay = 0, variants = fadeUp, once = true }: AnimProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideLeft({ children, className, delay = 0 }: AnimProps) {
  return <FadeIn className={className} delay={delay} variants={slideLeft}>{children}</FadeIn>;
}

export function SlideRight({ children, className, delay = 0 }: AnimProps) {
  return <FadeIn className={className} delay={delay} variants={slideRight}>{children}</FadeIn>;
}

export function ScaleIn({ children, className, delay = 0 }: AnimProps) {
  return <FadeIn className={className} delay={delay} variants={scaleUp}>{children}</FadeIn>;
}

// ─── Stagger Container ───
export function StaggerContainer({ children, className, delay = 0 }: AnimProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Stagger Child (used inside StaggerContainer) ───
export function StaggerChild({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={fadeUp} className={className}>
      {children}
    </motion.div>
  );
}

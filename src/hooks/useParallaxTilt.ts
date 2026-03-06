import { useEffect, type RefObject } from "react";

// Adds parallax tilt to an element based on mouse position (desktop) and scroll (mobile).
// containerRef = the area that detects mouse movement; targetRef = the element that tilts.
export function useParallaxTilt(
  containerRef: RefObject<HTMLDivElement | null>,
  targetRef: RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    const targetElement = targetRef.current;
    const containerElement = containerRef.current;
    if (!targetElement || !containerElement) return;

    // Desktop: tilt toward mouse position
    function handleMouseMove(event: MouseEvent) {
      if (!containerElement || !targetElement) return;
      const rect = containerElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const offsetX = ((event.clientX - centerX) / (rect.width / 2)) * 6;
      const offsetY = ((event.clientY - centerY) / (rect.height / 2)) * 6;
      targetElement.style.transform = `perspective(200px) rotateY(${offsetX}deg) rotateX(${-offsetY}deg)`;
    }

    function handleMouseLeave() {
      if (!targetElement) return;
      targetElement.style.transform = "perspective(200px) rotateY(0deg) rotateX(0deg)";
    }

    // Mobile: subtle float based on scroll position
    function handleScroll() {
      if (!containerElement || !targetElement) return;
      const rect = containerElement.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const distanceFromCenter = (rect.top + rect.height / 2 - viewportCenter) / viewportCenter;
      const tiltX = distanceFromCenter * 4;
      targetElement.style.transform = `perspective(200px) rotateX(${tiltX}deg)`;
    }

    containerElement.addEventListener("mousemove", handleMouseMove);
    containerElement.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      containerElement.removeEventListener("mousemove", handleMouseMove);
      containerElement.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [containerRef, targetRef]);
}

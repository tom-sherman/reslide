import type { ReactNode } from "react";
import { useEffect } from "react";
import { useAtomsDebugValue } from "jotai/devtools";
import { atom, Provider, useSetAtom } from "jotai";
import { slidesAtom } from "./state";
import { Slide } from "./Slide";

export interface SlideDescription {
  element: ReactNode;
  index: number;
}

export interface PresentationProps {
  children: ReactNode;
  slides: SlideDescription[];
}

export function Presentation({ children, slides }: PresentationProps) {
  return (
    <Provider>
      <DebugAtoms />
      <PresentationInner slides={slides}>{children}</PresentationInner>
    </Provider>
  );
}

function PresentationInner({ children, slides }: PresentationProps) {
  const setSlides = useSetAtom(slidesAtom);
  useEffect(() => {
    setSlides(
      slides.map((slide) => ({
        ...slide,
        maxStepIndexAtom: atom(0),
        element: <Slide>{slide.element}</Slide>,
      }))
    );
  }, [setSlides, slides]);

  return <>{children}</>;
}

function DebugAtoms() {
  useAtomsDebugValue();
  return null;
}

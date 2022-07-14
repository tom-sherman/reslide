import { useSetAtom } from "jotai";
import { createContext, ReactNode, useContext, useMemo } from "react";
import { slidesAtom, useRegisterSlide } from "./state";

export interface SlideProps {
  element: ReactNode;
}

const SlideContext = createContext({ registerStep: (stepIndex: number) => {} });
export const useSlideContext = () => useContext(SlideContext);

export function Slide({ element }: SlideProps) {
  const elementWithContext = useMemo(
    () => (
      <SlideContext.Provider
        value={{ registerStep: (stepIndex: number) => registerStep(stepIndex) }}
      >
        {element}
      </SlideContext.Provider>
    ),
    [element]
  );
  const { registerStep } = useRegisterSlide(elementWithContext);

  return null;
}

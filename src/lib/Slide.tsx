import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";
import { useRegisterSlide } from "./state";

export interface SlideProps {
  element: ReactNode;
}

const SlideContext = createContext({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  registerStep: (_stepIndex: number) => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  unregisterStep: (_stepIndex: number) => {},
});
export const useSlideContext = () => useContext(SlideContext);

export function Slide({ element }: SlideProps) {
  const elementWithContext = useMemo(
    () => (
      <SlideContext.Provider
        value={{
          registerStep: (stepIndex: number) => registerStep(stepIndex),
          unregisterStep: (stepIndex: number) => unregisterStep(stepIndex),
        }}
      >
        {element}
      </SlideContext.Provider>
    ),
    [element]
  );
  const { registerStep, unregisterStep } = useRegisterSlide(elementWithContext);

  return null;
}

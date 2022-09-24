import { useSetAtom } from "jotai";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";
import { writeRegisterStepAtom, writeUnregisterStepAtom } from "./state";

export interface SlideProps {
  children: ReactNode;
}

const SlideContext = createContext({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  registerStep: (_stepIndex: number) => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  unregisterStep: (_stepIndex: number) => {},
});
export const useSlideContext = () => useContext(SlideContext);

export function Slide({ children }: SlideProps) {
  const registerStep = useSetAtom(writeRegisterStepAtom);
  const unregisterStep = useSetAtom(writeUnregisterStepAtom);
  const contextValue = useMemo(
    () => ({
      registerStep,
      unregisterStep,
    }),
    [registerStep, unregisterStep]
  );

  return (
    <SlideContext.Provider value={contextValue}>
      {children}
    </SlideContext.Provider>
  );
}

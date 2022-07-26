import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { useSlideContext } from "./Slide";
import { slideProgressAtom } from "./state";

interface StepProps {
  children: React.ReactNode;
  index: number;
}

export function Step({ children, index }: StepProps) {
  const { registerStep, unregisterStep } = useSlideContext();

  useEffect(() => {
    registerStep(index);

    return () => {
      unregisterStep(index);
    };
  }, [index, registerStep, unregisterStep]);

  const { stepIndex } = useAtomValue(slideProgressAtom);
  if (stepIndex < index) {
    return null;
  }

  return <>{children}</>;
}

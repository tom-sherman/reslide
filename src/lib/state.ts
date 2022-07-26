import type { PrimitiveAtom } from "jotai";
import { atom, useSetAtom } from "jotai";
import type { ReactNode } from "react";
import { useEffect, useId, useMemo, useState } from "react";
import invariant from "ts-invariant";

interface SlideModel {
  id: string;
  element: ReactNode;
  maxStepIndexAtom: PrimitiveAtom<number>;
  stepIndexAtom: PrimitiveAtom<number>;
}

export const slidesAtom = atom<SlideModel[]>([]);
const slideCountAtom = atom((get) => get(slidesAtom).length);

const activeSlideIndexAtom = atom(0);

export const slideProgressAtom = atom((get) => {
  const activeSlide = get(activeSlideAtom);
  const stepIndex = activeSlide ? get(activeSlide.stepIndexAtom) : 0;
  const slideIndex = get(activeSlideIndexAtom);
  return { stepIndex, slideIndex };
});

const writeGoBackAtom = atom(null, (get, set) => {
  const { slideIndex, stepIndex } = get(slideProgressAtom);
  console.log({ slideIndex, stepIndex });
  const activeSlide = get(slidesAtom)[slideIndex];
  if (!activeSlide) {
    return;
  }

  if (get(activeSlide.maxStepIndexAtom) === 0 || stepIndex === 0) {
    set(activeSlideIndexAtom, clamp(slideIndex - 1, 0));
    set(activeSlide.stepIndexAtom, get(activeSlide.maxStepIndexAtom));
    return;
  }

  set(activeSlide.stepIndexAtom, stepIndex - 1);
});
const writeGoForwardAtom = atom(null, (get, set) => {
  const { slideIndex, stepIndex } = get(slideProgressAtom);
  const slides = get(slidesAtom);
  const activeSlide = slides[slideIndex];
  if (!activeSlide) {
    return;
  }
  const lastSlideIndex = get(slideCountAtom) - 1;
  const activeSlideMaxStepIndex = get(activeSlide.maxStepIndexAtom);

  if (activeSlideMaxStepIndex === 0 || stepIndex === activeSlideMaxStepIndex) {
    set(activeSlideIndexAtom, Math.min(slideIndex + 1, lastSlideIndex));
    return;
  }

  set(activeSlide.stepIndexAtom, stepIndex + 1);
});

export const activeSlideAtom = atom(
  (get) => get(slidesAtom)[get(activeSlideIndexAtom)]
);
export const activeSlideElementAtom = atom(
  (get) => get(activeSlideAtom)?.element ?? null
);

export function useRegisterSlide(element: ReactNode) {
  const id = useId();
  const [maxStepIndexAtom] = useState(atom(0));
  const [stepIndexAtom] = useState(atom(0));
  const setSlides = useSetAtom(slidesAtom);

  interface RegistryAction {
    action: "register" | "unregister";
    stepIndex: number;
  }

  const dispatchStepRegistry = useSetAtom(
    useMemo(
      () =>
        atom(null, (get, set, { action, stepIndex }: RegistryAction) => {
          console.log(action, stepIndex);
          switch (action) {
            case "register": {
              set(maxStepIndexAtom, (maxStepIndex) => {
                return Math.max(maxStepIndex, stepIndex);
              });
              return;
            }

            case "unregister": {
              const currentMaxStepIndex = get(maxStepIndexAtom);
              if (stepIndex === currentMaxStepIndex) {
                const newMaxStepIndex = clamp(currentMaxStepIndex - 1, 0);
                set(maxStepIndexAtom, newMaxStepIndex);
                set(stepIndexAtom, newMaxStepIndex);
                return;
              }

              // 0 1 2 3
              //   ^

              //

              const newMaxStepIndex = Math.max(
                stepIndex,
                get(maxStepIndexAtom)
              );
              set(maxStepIndexAtom, newMaxStepIndex);

              if (stepIndex > newMaxStepIndex) {
                set(stepIndexAtom, newMaxStepIndex);
              }
              return;
            }

            default: {
              invariant(false, `Unknown action: ${action}`);
            }
          }
        }),
      [maxStepIndexAtom, stepIndexAtom]
    )
  );

  const registeredSlide = useMemo(
    () => ({ id, element, maxStepIndexAtom, stepIndexAtom }),
    [id, element, maxStepIndexAtom, stepIndexAtom]
  );

  useEffect(() => {
    setSlides((slides) => [...slides, registeredSlide]);

    return () => {
      setSlides((slides) => slides.filter((slide) => slide.id !== id));
    };
  }, [id, registeredSlide, setSlides]);

  return useMemo(
    () => ({
      id,
      registerStep: (stepIndex: number) => {
        dispatchStepRegistry({ action: "register", stepIndex });
      },
      unregisterStep: (stepIndex: number) => {
        dispatchStepRegistry({ action: "unregister", stepIndex });
      },
    }),
    [id, dispatchStepRegistry]
  );
}

export function usePresentationControls() {
  const goBack: () => void = useSetAtom(writeGoBackAtom);
  const goForward: () => void = useSetAtom(writeGoForwardAtom);

  return useMemo(() => ({ goBack, goForward }), [goBack, goForward]);
}

function clamp(number: number, lower?: number, upper?: number) {
  if (number === number) {
    if (upper !== undefined) {
      number = number <= upper ? number : upper;
    }
    if (lower !== undefined) {
      number = number >= lower ? number : lower;
    }
  }
  return number;
}

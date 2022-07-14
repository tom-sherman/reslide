import {
  PrimitiveAtom,
  atom,
  useAtomValue,
  useSetAtom,
  WritableAtom,
} from "jotai";
import { atomFamily } from "jotai/utils";
import {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import invariant from "ts-invariant";

interface SlideModel {
  id: string;
  element: ReactNode;
  steps: number;
}

interface PresentationModel {
  slides: SlideModel[];
}

export const slidesAtom = atom<SlideModel[]>([]);
const slideCountAtom = atom((get) => get(slidesAtom).length);

const activeSlideIndexAtom = atom(0);
export const slideStepIndexFamily = atomFamily((id: string) => {
  console.log({ id });
  const a = atom(0);
  a.debugLabel = `${id}-slideStepIndex`;
  return a;
});

export const slideProgressAtom = atom((get) => {
  const activeSlide = get(activeSlideAtom);
  console.log({
    activeSlide,
    step: activeSlide ? get(slideStepIndexFamily(activeSlide.id)) : null,
  });
  return {
    stepIndex: activeSlide ? get(slideStepIndexFamily(activeSlide.id)) : 0,
    slideIndex: get(activeSlideIndexAtom),
  };
});
const writeGoBackAtom = atom(null, (get, set) => {
  const { slideIndex, stepIndex } = get(slideProgressAtom);
  const activeSlide = get(slidesAtom)[slideIndex];
  if (!activeSlide) {
    return;
  }

  if (activeSlide.steps === 0 || stepIndex === 0) {
    set(activeSlideIndexAtom, clamp(slideIndex - 1, 0));
    return;
  }

  console.log("backStep");
  set(slideStepIndexFamily(activeSlide.id), stepIndex - 1);
});
const writeGoForwardAtom = atom(null, (get, set) => {
  const { slideIndex, stepIndex } = get(slideProgressAtom);
  const slides = get(slidesAtom);
  const activeSlide = slides[slideIndex];
  if (!activeSlide) {
    return;
  }
  const lastSlideIndex = get(slideCountAtom) - 1;

  if (activeSlide.steps === 0 || stepIndex === activeSlide.steps) {
    set(activeSlideIndexAtom, Math.min(slideIndex + 1, lastSlideIndex));
    return;
  }

  if (slideIndex === lastSlideIndex) {
    return;
  }

  console.log("here -1", activeSlide.id);
  set(slideStepIndexFamily(activeSlide.id), stepIndex + 1);
});

export const activeSlideAtom = atom(
  (get) => get(slidesAtom)[get(activeSlideIndexAtom)]
);
export const activeSlideElementAtom = atom(
  (get) => get(activeSlideAtom)?.element ?? null
);

export function useRegisterSlide(element: ReactNode) {
  const id = useId();
  const setSlides = useSetAtom(slidesAtom);
  const hasRegisteredRef = useRef<string | null>(null);

  useEffect(() => {
    if (id !== hasRegisteredRef.current) {
      hasRegisteredRef.current = id;
      console.log("registeringSlide");
      setSlides((slides) => [...slides, { id, element, steps: 0 }]);
    }
  }, [element, id]);

  return useMemo(
    () => ({
      id,
      registerStep: (stepIndex: number) => {
        setSlides((slides) =>
          slides.map((slide) =>
            slide.id === id
              ? { ...slide, steps: Math.max(slide.steps, stepIndex) }
              : slide
          )
        );
      },
    }),
    [id]
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

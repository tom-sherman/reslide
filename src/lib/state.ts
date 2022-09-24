import type { PrimitiveAtom } from "jotai";
import { atom, useSetAtom } from "jotai";
import type { ReactNode } from "react";
import { useMemo } from "react";

interface SlideModel {
  index: number;
  element: ReactNode;
  maxStepIndexAtom: PrimitiveAtom<number>;
}

export const slidesAtom = atom<SlideModel[]>([]);
const slideCountAtom = atom((get) => get(slidesAtom).length);

const activeSlideIndexAtom = atom(0);
const activeSlideStepIndexAtom = atom(0);

export const slideProgressAtom = atom((get) => {
  const slideIndex = get(activeSlideIndexAtom);
  const stepIndex = get(activeSlideStepIndexAtom);
  const slideCount = get(slideCountAtom);
  const maxStepIndexAtom = get(activeSlideMaxStepIndexAtomAtom);

  return {
    stepIndex,
    slideIndex,
    maxSlideIndex: slideCount - 1,
    maxStepIndex: maxStepIndexAtom ? get(maxStepIndexAtom) : 0,
  };
});

const writeNavigateAtom = atom(null, (get, set, update: number) => {
  const slideCount = get(slideCountAtom);
  const activeSlideIndex = get(activeSlideIndexAtom);
  const activeSlideStepIndex = get(activeSlideStepIndexAtom);
  const activeSlideMaxStepIndexAtom = get(activeSlideMaxStepIndexAtomAtom);

  const nextStep = activeSlideStepIndex + update;
  const clampedNextStep = clamp(
    nextStep,
    0,
    activeSlideMaxStepIndexAtom ? get(activeSlideMaxStepIndexAtom) : 0
  );

  if (nextStep === clampedNextStep) {
    set(activeSlideStepIndexAtom, nextStep);
  } else {
    const nextSlide = clamp(
      activeSlideIndex + Math.sign(update),
      0,
      slideCount - 1
    );
    set(activeSlideIndexAtom, nextSlide);
    if (nextSlide > activeSlideIndex) {
      set(activeSlideStepIndexAtom, 0);
    } else if (nextSlide < activeSlideIndex) {
      const nextSlideMaxStepIndexAtom = get(activeSlideMaxStepIndexAtomAtom);
      set(
        activeSlideStepIndexAtom,
        nextSlideMaxStepIndexAtom ? get(nextSlideMaxStepIndexAtom) : 0
      );
    }
  }
});

export const activeSlideAtom = atom(
  (get) => get(slidesAtom)[get(activeSlideIndexAtom)]
);

export const activeSlideElementAtom = atom(
  (get) => get(activeSlideAtom)?.element ?? null
);

export const writeRegisterStepAtom = atom(null, (get, set, index: number) => {
  const maxStepIndexAtom = get(activeSlideMaxStepIndexAtomAtom);
  if (!maxStepIndexAtom) {
    return;
  }
  set(maxStepIndexAtom, Math.max(get(maxStepIndexAtom), index));
});

export const writeUnregisterStepAtom = atom(null, (get, set) => {
  const maxStepIndexAtom = get(activeSlideMaxStepIndexAtomAtom);
  if (!maxStepIndexAtom) {
    return;
  }

  set(maxStepIndexAtom, (current) => Math.max(0, current - 1));
});

const activeSlideMaxStepIndexAtomAtom = atom((get) => {
  const activeSlide = get(activeSlideAtom);
  return activeSlide?.maxStepIndexAtom ?? null;
});

export function usePresentationControls() {
  const navigate = useSetAtom(writeNavigateAtom);

  return useMemo(
    () => ({ goBack: () => navigate(-1), goForward: () => navigate(+1) }),
    [navigate]
  );
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

import type { ReactNode } from "react";
import { useAtomsDebugValue } from "jotai/devtools";
import { Provider, useAtomValue } from "jotai";
import { activeSlideElementAtom } from "./state";

export interface PresentationProps {
  children: ReactNode;
}

export function Presentation(props: PresentationProps) {
  return (
    <Provider>
      <DebugAtoms />
      <>{props.children}</>
    </Provider>
  );
}

function DebugAtoms() {
  useAtomsDebugValue();
  return null;
}

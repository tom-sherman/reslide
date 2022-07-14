import { useAtomValue } from "jotai";
import { activeSlideElementAtom } from "./state";

export function Outlet() {
  const activeSlideElement = useAtomValue(activeSlideElementAtom);

  return <>{activeSlideElement}</>;
}

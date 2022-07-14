import { useAtomValue } from "jotai";
import "./App.css";
import { Outlet } from "./lib/Outlet";
import { Presentation } from "./lib/Presentation";
import { Slide } from "./lib/Slide";
import { slideProgressAtom, usePresentationControls } from "./lib/state";
import { Step } from "./lib/Step";

function App() {
  return (
    <Presentation>
      <Slide
        element={
          <ul>
            <li>Some</li>
            <Step index={1}>
              <li>Thing</li>
            </Step>
          </ul>
        }
      />
      <Slide element={<p>World!</p>} />

      <Outlet />
      <Controls />
    </Presentation>
  );
}

function Controls() {
  const { goForward, goBack } = usePresentationControls();
  return (
    <>
      <button onClick={goBack}>Back</button>
      <button onClick={goForward}>Forward</button>
    </>
  );
}

function Progress() {
  const progress = useAtomValue(slideProgressAtom);
  return (
    <>
      <p>Slide: {progress.slideIndex}</p>
      <p>Step: {progress.stepIndex}</p>
    </>
  );
}

export default App;

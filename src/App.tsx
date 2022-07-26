import { useAtomValue } from "jotai";
import { useState } from "react";
import "./App.css";
import { Outlet } from "./lib/Outlet";
import { Presentation } from "./lib/Presentation";
import { Slide } from "./lib/Slide";
import { slideProgressAtom, usePresentationControls } from "./lib/state";
import { Step } from "./lib/Step";

function Slide2() {
  const [steps, setSteps] = useState<number[]>([]);
  const { stepIndex } = useAtomValue(slideProgressAtom);

  return (
    <div id="2">
      <button onClick={() => setSteps(steps.concat(steps.length))}>
        Add step
      </button>
      <button onClick={() => setSteps(steps.filter((n) => n !== stepIndex))}>
        Remove this step
      </button>
      {steps.map((n) => (
        <Step key={n} index={n}>
          <p>Step: {n}</p>
        </Step>
      ))}
    </div>
  );
}

function App() {
  return (
    <Presentation>
      <Slide
        element={
          <>
            <Step index={1}>
              <p>foo</p>
            </Step>
            <Step index={2}>
              <p>bar</p>
            </Step>
          </>
        }
      />
      <Slide element={<Slide2 />} />

      <Controls />
      <Outlet />
    </Presentation>
  );
}

function Controls() {
  const { goForward, goBack } = usePresentationControls();
  return (
    <div style={{ position: "absolute", bottom: 0, right: 0 }}>
      <Progress />
      <button onClick={goBack}>Back</button>
      <button onClick={goForward}>Forward</button>
    </div>
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

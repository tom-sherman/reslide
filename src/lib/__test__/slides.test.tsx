import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Presentation } from "../Presentation";
import { slideProgressAtom, usePresentationControls } from "../state";
import { Outlet } from "../Outlet";
import { Step } from "../Step";
import { useState } from "react";
import { useAtomValue } from "jotai";

test("should show first slide initially", async () => {
  render(
    <Presentation
      slides={[
        {
          element: <p>Hello</p>,
          index: 0,
        },
        {
          element: <p>World</p>,
          index: 1,
        },
      ]}
    >
      <Outlet />
    </Presentation>
  );

  expect(screen.queryByText("Hello")).not.toBeNull();
  expect(screen.queryByText("World")).toBeNull();
});

function Controls() {
  const { goForward, goBack } = usePresentationControls();
  return (
    <>
      <button onClick={goBack}>Back</button>
      <button onClick={goForward}>Forward</button>
    </>
  );
}

test("should transition between two slides", async () => {
  render(
    <Presentation
      slides={[
        {
          element: <p>Hello</p>,
          index: 0,
        },
        {
          element: <p>World</p>,
          index: 1,
        },
      ]}
    >
      <Controls />
      <Outlet />
    </Presentation>
  );
  const user = userEvent.setup();

  expect(screen.queryByText("World")).toBeNull();
  await user.click(screen.getByText("Forward"));
  expect(screen.queryByText("World")).not.toBeNull();
  await user.click(screen.getByText("Back"));
  expect(screen.queryByText("World")).toBeNull();
  expect(screen.queryByText("Hello")).not.toBeNull();
});

test("should transition between steps", async () => {
  render(
    <Presentation
      slides={[
        {
          element: (
            <div id="1">
              <Step index={1}>
                <p>foo</p>
              </Step>
              <Step index={2}>
                <p>bar</p>
              </Step>
            </div>
          ),
          index: 0,
        },
        {
          element: (
            <div id="2">
              <Step index={1}>
                <p>baz</p>
              </Step>
              <Step index={2}>
                <p>buz</p>
              </Step>
            </div>
          ),
          index: 1,
        },
      ]}
    >
      <Controls />
      <Outlet />
    </Presentation>
  );

  expect(screen.queryByText("foo")).toBeNull();
  expect(screen.queryByText("bar")).toBeNull();
  expect(screen.queryByText("baz")).toBeNull();
  expect(screen.queryByText("buz")).toBeNull();

  await userEvent.click(screen.getByText("Forward"));
  expect(screen.queryByText("foo")).not.toBeNull();
  expect(screen.queryByText("bar")).toBeNull();
  expect(screen.queryByText("baz")).toBeNull();
  expect(screen.queryByText("buz")).toBeNull();

  await userEvent.click(screen.getByText("Forward"));
  expect(screen.queryByText("foo")).not.toBeNull();
  expect(screen.queryByText("bar")).not.toBeNull();
  expect(screen.queryByText("baz")).toBeNull();
  expect(screen.queryByText("buz")).toBeNull();

  await userEvent.click(screen.getByText("Forward"));
  expect(screen.queryByText("foo")).toBeNull();
  expect(screen.queryByText("bar")).toBeNull();
  expect(screen.queryByText("baz")).toBeNull();
  expect(screen.queryByText("buz")).toBeNull();

  await userEvent.click(screen.getByText("Forward"));
  expect(screen.queryByText("foo")).toBeNull();
  expect(screen.queryByText("bar")).toBeNull();
  expect(screen.queryByText("baz")).not.toBeNull();
  expect(screen.queryByText("buz")).toBeNull();

  await userEvent.click(screen.getByText("Forward"));
  expect(screen.queryByText("foo")).toBeNull();
  expect(screen.queryByText("bar")).toBeNull();
  expect(screen.queryByText("baz")).not.toBeNull();
  expect(screen.queryByText("buz")).not.toBeNull();
});

test("a step unmounting correctly shifts the active step index", async () => {
  function DynamicSteps() {
    const [steps, setSteps] = useState<number[]>([]);
    const { stepIndex } = useAtomValue(slideProgressAtom);

    return (
      <div>
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

  render(
    <Presentation
      slides={[
        {
          element: <DynamicSteps />,
          index: 0,
        },
      ]}
    >
      <Controls />
      <Outlet />
    </Presentation>
  );

  expect(screen.queryByText("Step: 0")).toBeNull();
  await userEvent.click(screen.getByText("Add step"));
  expect(screen.queryByText("Step: 0")).not.toBeNull();
  await userEvent.click(screen.getByText("Add step"));
  await userEvent.click(screen.getByText("Add step"));

  // We now have 3 steps
  expect(screen.queryByText("Step: 0")).not.toBeNull();
  expect(screen.queryByText("Step: 1")).toBeNull();
  expect(screen.queryByText("Step: 2")).toBeNull();
  await userEvent.click(screen.getByText("Forward"));
  await userEvent.click(screen.getByText("Forward"));
  expect(screen.queryByText("Step: 2")).not.toBeNull();

  await userEvent.click(screen.getByText("Remove this step"));

  // We should now have 2 steps and be on step 1
  expect(screen.queryByText("Step: 2")).toBeNull();
  expect(screen.queryByText("Step: 0")).not.toBeNull();
  expect(screen.queryByText("Step: 1")).not.toBeNull();

  await userEvent.click(screen.getByText("Back"));
  // We should now have 2 steps and be on step 0
  expect(screen.queryByText("Step: 0")).not.toBeNull();
  expect(screen.queryByText("Step: 1")).toBeNull();
});

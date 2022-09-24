import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Presentation } from "../Presentation";
import { usePresentationControls } from "../state";
import { Outlet } from "../Outlet";
import { Step } from "../Step";

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

test.skip("should transition between steps", async () => {
  const { debug } = render(
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
  await userEvent.click(screen.getByText("Forward"));
  await userEvent.click(screen.getByText("Forward"));
  await userEvent.click(screen.getByText("Forward"));
  await userEvent.click(screen.getByText("Forward"));
  debug();
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

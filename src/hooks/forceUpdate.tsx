import React from "react";

export default function useForceUpdate() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [value, setValue] = React.useState(0); // integer state
  return () => setValue((value) => value + 1); // update the state to force render
}

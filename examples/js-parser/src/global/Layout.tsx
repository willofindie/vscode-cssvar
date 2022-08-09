/* eslint-disable no-console */
import { styled } from "@linaria/react";

export default styled.div`
  :root {
    --h1: 44px;
    --h2: 32px;
    --h3: 24px;

    --color-red: red;
    --color-green: green;
    --color-blue: blue;
  }
`;

export const RandomComponent = () => {
  const classes = ["foo", "bar"];

  return (
    <div className={`${classes[0]}`}>
      <p className={`baz ${classes[1] === "bar" ? "bizz" : "fizz"}`}>
        Hell World
      </p>
    </div>
  );
};

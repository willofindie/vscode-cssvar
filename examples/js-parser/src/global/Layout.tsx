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

  // All the below console.logs causes issue, but for now let's neglect it unless someone raises any issue
  // This is because, I don't want to officially support JS/TS parsing, as it's a lot of overhead.
  console.log(`--random: error`);
  console.log(`-- foo: ${"foo"}`);
  console.log(`--fuzz: ${"fuzz"}`);
  console.log(`--flex: `, "flex");

  console.log(`>>> bob--flex: `, "flex");

  return (
    <div className={`${classes[0]}`}>
      <p className={`baz ${classes[1] === "bar" ? "bizz" : "fizz"}`}>
        Hell World
      </p>
    </div>
  );
};

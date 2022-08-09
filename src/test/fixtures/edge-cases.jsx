// ES6 imports
import styled from 'styled';
import { mod2 } from 'm2';

// CJS
const mod3 = require('m3');

import { styled } from "@linaria/react";

const StyledContainer = styled.div`
  :root {
    --h1: 44px;
    --h2: 32px;
    --h3: 24px;

    --color-red: red;
    --color-green: green;
    --color-blue: blue;
  }
`;

const baseClass = styled.css`
  --base-var-1: #333;

  .child {
    --child-var-1: #222;
  }
`;

export const RandomComponent = () => {
  const classes = [baseClass, "bar"];

  //#region Possible Edge cases for Template Literal Parsing
  /**
   * All the below console.logs causes issue, but for now let's neglect it unless someone raises any issue
   * This is because, I don't want to officially support JS/TS parsing, as it's a lot of overhead.
   */
  // If Ever it comes to fix the below template literal, one of the solution could be to:
  // To have a counter for colon and semi-colon, and there count should be at-least one at the
  // end of parsing a template literal, to make sure the template-literal is possibly a CSS string.
  console.log(`--random: error`);
  console.log(`-- foo: ${"foo"}`);
  console.log(`--fuzz: ${"fuzz"}`);
  console.log(`--flex: `, "flex");
  //#endregion

  console.log(`>>> bob--flex: `, "flex");

  return (
    <StyledContainer className={`${classes[0]}`}>
      <p className={`--baz ${classes[1] === "bar" ? "bizz" : "fizz"}`}>
        Hell World
      </p>
    </StyledContainer>
  );
};


export {
  StyledContainer
};

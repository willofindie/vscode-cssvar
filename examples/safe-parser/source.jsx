import { styled, css } from "styled-components";

export const Button = styled.a`
  :root {
    --color-js-1: #f30;
    --color-js-2: #f0aa44;
  }
  /* This renders the buttons above... Edit me! */
  display: inline-block;
  border-radius: 3px;
  padding: 0.5rem 0;
  margin: 0.5rem 1rem;
  width: 11rem;
  background: transparent;
  color: white;
  border: 2px solid white;

  /* The GitHub button is a primary button
   * edit this to target it specifically! */
  ${props =>
    props.primary &&
    css`
      background: white;
      color: black;
    `}
`;

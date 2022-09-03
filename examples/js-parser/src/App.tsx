import { css } from "@linaria/core";

const rootClass = css`
  color: var(--brand);
  background-color: var(--color-blue);

  .head {
    font-size: var(--h1);
    padding: var(--space-1);
  }
`;

export const App = () => {
  let x = 1;
  const y = --x;
  return (
    <div className={rootClass}>
      <h1 className="head">Hello World {y}</h1>
    </div>
  );
};

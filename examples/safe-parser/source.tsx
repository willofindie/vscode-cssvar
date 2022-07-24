// @ts-ignore
import { styled } from "styled-components";

// For now variables inside some rules are only getting parsed
export const Title = styled.h1`
  --color-tsx-1: #34aa12;
  .child {
    --color-tsx-2: #aa2399;
  }
  /* Text centering won't break if props.upsidedown is falsy */
  ${props => props.upsidedown && "transform: rotate(180deg);"}
  ${props => props.upsidedown && "--wont-work: #334;"}
  text-align: center;
`;

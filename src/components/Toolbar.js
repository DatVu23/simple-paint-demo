import React from "react";
import styled, { css } from "styled-components";
import {
  faMinus,
  faSquare,
  faPaintBrush
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Toolbar({ selectTool, toolMode }) {
  return (
    <ToolbarContainer>
      <ToolButton active={toolMode.lineMode} onClick={() => selectTool("line")}>
        <FontAwesomeIcon icon={faMinus} size="lg" color="#3914AF" />
      </ToolButton>
      <ToolButton
        active={toolMode.rectangleMode}
        onClick={() => selectTool("rectangle")}
      >
        <FontAwesomeIcon icon={faSquare} size="lg" color="#1240AB" />
      </ToolButton>
      <ToolButton
        active={toolMode.bucketFillMode}
        onClick={() => selectTool("bucketFill")}
      >
        <FontAwesomeIcon icon={faPaintBrush} size="lg" color="#A67600" />
      </ToolButton>
    </ToolbarContainer>
  );
}

const ToolbarContainer = styled.div`
  display: flex;
  max-width: 80px;
  justify-content: space-between;
  margin: 20px 0;
`;

const ToolButton = styled.button`
  cursor: pointer;
  outline: none;
  border: 0;
  background: #fff;
  transition: all easy-in-out 1s;

  &:active {
    transform: scale(1.3);
  }

  ${props =>
    props.active &&
    css`
      transform: scale(1.3);
    `}
`;

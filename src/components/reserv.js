import React from "react";
import { useSetState } from "../utils/customHooks";
import styled from "styled-components";

const deepCopy = input => {
  const output = Array.isArray(input) ? [] : {};

  for (const key in input) {
    const value = input[key];
    output[key] = typeof value === "object" ? deepCopy(value) : value;
  }

  return output;
};

export default function Canvas() {
  const [state, setState] = useSetState({
    size: 0,
    canvasWidth: 0,
    canvasHeight: 0,
    canvasMap: [],
    emptyCanvasMap: [],
    firstClickCell: null,
    secondClickCell: null,
    lineMode: true,
    rectangleMode: false,
    bucketFillMode: false
  });

  const {
    canvasWidth,
    canvasHeight,
    canvasMap,
    emptyCanvasMap,
    firstClickCell,
    secondClickCell,
    lineMode,
    rectangleMode,
    bucketFillMode
  } = state;
  const cellWidth = 40;
  const cellHeight = 40;

  const handleChange = e => {
    const { value, name } = e.target;
    console.log(name);
    setState({ [name]: +value });
  };

  const createCanvas = () => {
    if (canvasWidth && canvasHeight) {
      const size = canvasWidth * canvasHeight;
      const canvasMap = [];
      for (let i = 1; i <= size; i++) {
        const x = i > canvasWidth ? i % canvasWidth || canvasWidth : i;
        const y = Math.ceil(i / canvasWidth) || 1;
        canvasMap.push({ x, y, key: i - 1 });
      }
      setState({
        size,
        canvasMap,
        emptyCanvasMap: deepCopy(canvasMap),
        firstClickCell: null,
        secondClickCell: null
      });
    }
  };

  const resetCanvas = cell => {
    const canvasMap = deepCopy(emptyCanvasMap);
    canvasMap[cell.key].value = "X";
    setState({
      canvasMap: canvasMap,
      firstClickCell: cell,
      secondClickCell: null
    });
  };

  const drawLineX = difX => {
    if (difX > 0) {
      for (let i = 1; i <= difX; i++) {
        canvasMap[firstClickCell.key + i].value = "X";
      }
    } else if (difX < 0) {
      for (let i = 1; i <= Math.abs(difX); i++) {
        canvasMap[firstClickCell.key - i].value = "X";
      }
    }
  };

  const drawLineY = (difY, secondClickCell) => {
    if (difY > 0) {
      for (let i = 1; i < Math.abs(difY); i++) {
        canvasMap[secondClickCell.key - canvasWidth * i].value = "X";
      }
    } else if (difY < 0) {
      for (let i = 1; i < Math.abs(difY); i++) {
        canvasMap[secondClickCell.key + canvasWidth * i].value = "X";
      }
    }
  };

  const drawLine = (secondClickCell, difX, difY) => {
    console.log(canvasMap);
    console.log(difX);
    console.log(difY);

    drawLineX(difX);
    drawLineY(difY, secondClickCell);
  };

  const drawRectangle = cell => {
    console.log(cell);
    console.log(canvasMap);
  };

  const draw = cell => {
    if (secondClickCell) {
      resetCanvas(cell);
      return;
    }
    if (!firstClickCell) {
      console.log(cell);
      canvasMap[cell.key].value = "X";
      setState({ firstClickCell: cell });
    } else {
      const secondClickCell = canvasMap[cell.key];
      secondClickCell.value = "X";
      const difX = secondClickCell.x - firstClickCell.x;
      const difY = secondClickCell.y - firstClickCell.y;

      if (lineMode) drawLine(secondClickCell, difX, difY);
      if (rectangleMode) drawRectangle(cell, difX, difY);
      setState({ canvasMap, secondClickCell });
    }
  };

  return (
    <CanvasContainer>
      <FormGroup>
        <Input
          type="number"
          name="canvasWidth"
          onChange={handleChange}
          placeholder="Width"
          required={true}
        />
        <Label for="name">Canvas Width</Label>
      </FormGroup>
      <FormGroup>
        <Input
          type="number"
          onChange={handleChange}
          name="canvasHeight"
          placeholder="Height"
          required
        />
        <Label for="name">Canvas Height</Label>
      </FormGroup>
      <button onClick={createCanvas}>Create Canvas</button>
      {Boolean(canvasMap.length) && (
        <CanvasMapContainer
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          cellWidth={cellWidth}
        >
          {canvasMap.map(canvasCell => (
            <CanvasCell
              key={canvasCell.key}
              width={cellWidth}
              height={cellHeight}
              onClick={() => draw(canvasCell)}
            >
              {canvasCell.value}
            </CanvasCell>
          ))}
        </CanvasMapContainer>
      )}
    </CanvasContainer>
  );
}

const FormGroup = styled.div`
  position: relative;
  padding: 15px 0 0;
  margin-top: 10px;
  width: 50%;
  }
`;

const Input = styled.input`
  font-family: inherit;
  width: 100%;
  border: 0;
  border-bottom: 2px solid #9b9b9b;
  outline: 0;
  font-size: 1.3rem;
  padding: 7px 0;
  background: transparent;
  transition: border-color 0.2s;

  &:focus {
    ~ label {
      position: absolute;
      top: 0;
      display: block;
      transition: 0.2s;
      font-size: 1rem;
      color: rgb(25, 118, 210);
      font-weight: 700;
      placeholder: 0;
    }
    padding-bottom: 6px;
    font-weight: 700;
    border-width: 3px;
    border-image: linear-gradient(to right, rgb(25, 118, 210), #38ef7d);
    border-image-slice: 1;
  }

  ::placeholder {
    color: transparent;
  }

  :placeholder-shown ~ label {
    font-size: 1.3rem;
    cursor: text;
    top: 20px;
  }

  &:required,
  &:invalid {
    box-shadow: none;
  }
`;

const Label = styled.label`
  position: absolute;
  top: 0;
  display: block;
  transition: 0.2s;
  font-size: 1rem;
  color: #9b9b9b;
`;

const CanvasContainer = styled.div`
  padding: 20px;
`;

const CanvasMapContainer = styled.div(({ canvasWidth, cellWidth }) => ({
  display: "grid",
  border: "2px solid #808080",
  width: `${canvasWidth * cellWidth + 4}px`,
  gridTemplateColumns: `repeat(${canvasWidth}, 1fr)`
}));

const CanvasCell = styled.button(({ width, height }) => ({
  width: `${width}px`,
  height: `${height}px`,
  // border: 0,
  outline: "none",
  background: "#FFF"
}));

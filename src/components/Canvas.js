import React from "react";
import { useSetState } from "../utils/customHooks";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Toolbar from "./Toolbar";
import { Button, Input, Label } from "../utils";
import { deepCopy } from "../utils/functions";

export default function Canvas() {
  const [state, setState] = useSetState({
    prevCanvasWidth: 0,
    canvasWidth: 0,
    canvasHeight: 0,
    canvasMap: [],
    emptyCanvasMap: [],
    errorMessage: "",
    firstClickCell: null,
    secondClickCell: null,
    size: 0,
    toolMode: {
      lineMode: true,
      rectangleMode: false,
      bucketFillMode: false
    }
  });

  const {
    prevCanvasWidth,
    canvasWidth,
    canvasHeight,
    canvasMap,
    emptyCanvasMap,
    firstClickCell,
    toolMode
  } = state;
  const cellWidth = 40;
  const cellHeight = 40;

  const handleChange = e => {
    const { value, name } = e.target;
    setState({ [name]: +value });
  };

  const createCanvas = () => {
    if (prevCanvasWidth <= 30 && canvasHeight <= 30) {
      const canvasWidth = prevCanvasWidth;
      const size = canvasWidth * canvasHeight;
      const canvasMap = [];

      for (let i = 1; i <= size; i++) {
        const x = i > canvasWidth ? i % canvasWidth || canvasWidth : i;
        const y = Math.ceil(i / canvasWidth) || 1;
        canvasMap.push({ x, y, key: i - 1, group: 0 });
      }

      setState({
        size,
        canvasMap,
        canvasWidth,
        emptyCanvasMap: deepCopy(canvasMap),
        firstClickCell: null,
        secondClickCell: null
      });
    } else {
      toast.error("The max size of canvas should be 30x30", {
        containerId: "B"
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

  const drawLineX = (difX, cell) => {
    if (difX) {
      const operator = difX > 0 ? "+" : "-";

      for (let i = 1; i <= Math.abs(difX); i++) {
        canvasMap[eval(`${cell.key} ${operator} ${i}`)].value = "X";
      }
    }
  };

  const drawLineY = (
    difY,
    difX,
    firstClickCell,
    secondClickCell,
    compareX,
    compareY
  ) => {
    const groupId = uuidv4();
    const mixedGroupId = uuidv4();
    const operatorY = difY > 0 ? "-" : "+";
    const operatorX = difX > 0 ? "-" : "+";

    if (difY > 0) {
      for (let i = 1; i < Math.abs(difY); i++) {
        canvasMap[secondClickCell.key - canvasWidth * i].value = "X";
      }
    } else if (difY < 0) {
      for (let y = 1; y < Math.abs(difY); y++) {
        canvasMap[secondClickCell.key + canvasWidth * y].value = "X";
        if (toolMode.rectangleMode) {
          for (let x = 1; x < Math.abs(difX); x++) {
            canvasMap[
              secondClickCell.key + canvasWidth * y + x
            ].group = groupId;
          }
        }
      }
    }

    const isFirstClickCellAtTheBorder =
      firstClickCell.x === 1 || firstClickCell.x === canvasWidth;
    const isSecondClickCellAtTheBorder =
      secondClickCell.y === 1 || secondClickCell.y === canvasHeight;
    const isFirstClickCellClosed =
      canvasMap[eval(`${firstClickCell.key} ${compareX || operatorX} 1`)]
        ?.value === "X";
    const isSecondClickCellClosed =
      canvasMap[
        eval(`${secondClickCell.key} ${compareY || operatorY} ${canvasWidth}`)
      ]?.value === "X";

    if (
      toolMode.lineMode &&
      Math.abs(difX) &&
      Math.abs(difY) &&
      (isFirstClickCellAtTheBorder || isFirstClickCellClosed) &&
      (isSecondClickCellAtTheBorder || isSecondClickCellClosed)
    ) {
      for (let i = 0; i < Math.abs(difY); i++) {
        for (let j = 1; j <= Math.abs(difX); j++) {
          const currentCell =
            canvasMap[
              eval(
                `${secondClickCell.key} ${operatorY} ${canvasWidth} * ${i} ${operatorX} ${j}`
              )
            ];
          if (currentCell.group) currentCell.group = mixedGroupId;
          else currentCell.group = groupId;
        }
      }
    }
  };

  const drawLine = (firstClickCell, secondClickCell, compareX, compareY) => {
    const difX = secondClickCell.x - firstClickCell.x;
    const difY = secondClickCell.y - firstClickCell.y;

    if (difX) drawLineX(difX, firstClickCell);
    if (difY)
      drawLineY(
        difY,
        difX,
        firstClickCell,
        secondClickCell,
        compareX,
        compareY
      );
  };

  const drawRectangle = (firstClickCell, secondClickCell) => {
    const compareX = firstClickCell.x - secondClickCell.x > 0 ? "-" : "+";
    const compareY = firstClickCell.y - secondClickCell.y > 0 ? "-" : "+";

    drawLine(firstClickCell, secondClickCell, compareX, compareY);
    drawLine(secondClickCell, firstClickCell, compareX, compareY);
  };

  const fill = cell => {
    canvasMap.forEach(cellItem => {
      if (cellItem.group === cell.group && !cellItem.value) {
        cellItem.value = "O";
      }
    });
    setState({ canvasMap });
  };

  const draw = cell => {
    if (toolMode.bucketFillMode) {
      if (cell.value !== "X") fill(cell);
      else if (cell.value === "X")
        toast.warn("You can't fill the line", {
          containerId: "B"
        });
      return;
    }

    // if (secondClickCell && !toolMode.bucketFillMode) {
    //   resetCanvas(cell);
    //   return;
    // }

    if (!firstClickCell) {
      canvasMap[cell.key].value = "X";
      setState({ firstClickCell: cell });
    } else {
      const secondClickCell = canvasMap[cell.key];
      secondClickCell.value = "X";

      if (toolMode.lineMode) drawLine(firstClickCell, secondClickCell);
      if (toolMode.rectangleMode)
        drawRectangle(firstClickCell, secondClickCell);
      setState({
        canvasMap,
        firstClickCell: null,
        secondClickCell: null
      });
    }
  };

  const selectTool = tool => {
    const toolMode = {
      lineMode: false,
      rectangleMode: false,
      bucketFillMode: false
    };

    switch (tool) {
      case "line": {
        toolMode.lineMode = true;
        break;
      }
      case "rectangle": {
        toolMode.rectangleMode = true;
        break;
      }
      case "bucketFill": {
        toolMode.bucketFillMode = true;
        break;
      }
      default:
        toolMode.lineMode = true;
    }
    setState({ toolMode });
  };

  return (
    <CanvasContainer>
      <FormContainer>
        <FormGroup>
          <Input
            type="number"
            name="prevCanvasWidth"
            onChange={handleChange}
            placeholder="Width"
            required={true}
          />
          <Label>Canvas Width</Label>
        </FormGroup>
        <FormGroup>
          <Input
            type="number"
            onChange={handleChange}
            name="canvasHeight"
            placeholder="Height"
            required
          />
          <Label>Canvas Height</Label>
        </FormGroup>
      </FormContainer>
      <Button onClick={createCanvas} color="#2ee59d">
        Create Canvas
      </Button>
      {Boolean(canvasMap.length) && (
        <>
          <Toolbar selectTool={selectTool} toolMode={toolMode} />
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
        </>
      )}
      <ToastContainer
        enableMultiContainer
        containerId={"B"}
        position={toast.POSITION.TOP_RIGHT}
      />
    </CanvasContainer>
  );
}

const FormContainer = styled.div`
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  position: relative;
  padding: 15px 0 0;
  margin-top: 10px;
  width: 50%;
  }
`;

const CanvasContainer = styled.div`
  padding: 50px;
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
  outline: "none",
  border: 0,
  cursor: "pointer",
  background: "#FFF"
}));

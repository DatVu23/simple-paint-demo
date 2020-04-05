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
    firstClickPoint: null,
    secondClickPoint: null,
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
    firstClickPoint,
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
        firstClickPoint: null,
        secondClickPoint: null
      });
    } else {
      toast.error("The max size of canvas should be 30x30", {
        containerId: "B"
      });
    }
  };

  const resetCanvas = point => {
    const canvasMap = deepCopy(emptyCanvasMap);
    canvasMap[point.key].value = "X";
    setState({
      canvasMap: canvasMap,
      firstClickPoint: point,
      secondClickPoint: null
    });
  };

  const drawLineX = (difX, point, secondPoint) => {
    if (difX) {
      const groupId = uuidv4();
      const mixedGroupId = uuidv4();
      const operator = difX > 0 ? "+" : "-";

      for (let i = 1; i <= Math.abs(difX); i++) {
        canvasMap[eval(`${point.key} ${operator} ${i}`)].value = "X";
      }

      if (difX + 1 === canvasWidth) {
        const lastPoint =
          secondPoint.x - point.x > 0 ? secondPoint.key : point.key;
        for (let i = lastPoint; i < canvasMap.length; i++) {
          const currentPoint = canvasMap[i];
          if (currentPoint.group) currentPoint.group = mixedGroupId;
          else currentPoint.group = groupId;
        }
      }
    }
  };

  const drawLineY = (
    difY,
    difX,
    firstClickPoint,
    secondClickPoint,
    compareX,
    compareY
  ) => {
    const groupId = uuidv4();
    const mixedGroupId = uuidv4();
    const operatorY = difY > 0 ? "-" : "+";
    const operatorX = difX > 0 ? "-" : "+";

    if (difY > 0) {
      for (let i = 1; i < Math.abs(difY); i++) {
        canvasMap[secondClickPoint.key - canvasWidth * i].value = "X";
      }
    } else if (difY < 0) {
      for (let y = 1; y < Math.abs(difY); y++) {
        canvasMap[secondClickPoint.key + canvasWidth * y].value = "X";
        if (toolMode.rectangleMode) {
          for (let x = 1; x < Math.abs(difX); x++) {
            canvasMap[
              secondClickPoint.key + canvasWidth * y + x
            ].group = groupId;
          }
        }
      }
    }

    const isFirstClickPointAtTheBorder =
      firstClickPoint.x === 1 || firstClickPoint.x === canvasWidth;
    const isSecondClickPointAtTheBorder =
      secondClickPoint.y === 1 || secondClickPoint.y === canvasHeight;
    const isFirstClickPointClosed =
      canvasMap[eval(`${firstClickPoint.key} ${compareX || operatorX} 1`)]
        .value === "X";
    const isSecondClickPointClosed =
      canvasMap[
        eval(`${secondClickPoint.key} ${compareY || operatorY} ${canvasWidth}`)
      ].value === "X";

    if (toolMode.lineMode) {
      if (
        Math.abs(difX) &&
        Math.abs(difY) &&
        (isFirstClickPointAtTheBorder || isFirstClickPointClosed) &&
        (isSecondClickPointAtTheBorder || isSecondClickPointClosed)
      ) {
        for (let i = 0; i < Math.abs(difY); i++) {
          for (let j = 1; j <= Math.abs(difX); j++) {
            const currentPoint =
              canvasMap[
                eval(
                  `${secondClickPoint.key} ${operatorY} ${canvasWidth} * ${i} ${operatorX} ${j}`
                )
              ];
            if (currentPoint.group) currentPoint.group = mixedGroupId;
            else currentPoint.group = groupId;
          }
        }
      } else if (Math.abs(difY) + 1 === canvasHeight) {
        for (let i = 0; i <= Math.abs(difY); i++) {
          for (let j = 0; j <= canvasHeight - secondClickPoint.x; j++) {
            const currentPoint =
              canvasMap[
                eval(
                  `${secondClickPoint.key} ${operatorY} ${canvasWidth} * ${i} ${operatorX} ${j}`
                )
              ];
            if (currentPoint.group) currentPoint.group = mixedGroupId;
            else currentPoint.group = groupId;
          }
        }
      }
    }
  };

  const drawLine = (firstClickPoint, secondClickPoint, compareX, compareY) => {
    const difX = secondClickPoint.x - firstClickPoint.x;
    const difY = secondClickPoint.y - firstClickPoint.y;

    if (difX) drawLineX(difX, firstClickPoint, secondClickPoint);
    if (difY)
      drawLineY(
        difY,
        difX,
        firstClickPoint,
        secondClickPoint,
        compareX,
        compareY
      );
  };

  const drawRectangle = (firstClickPoint, secondClickPoint) => {
    const compareX = firstClickPoint.x - secondClickPoint.x > 0 ? "-" : "+";
    const compareY = firstClickPoint.y - secondClickPoint.y > 0 ? "-" : "+";

    drawLine(firstClickPoint, secondClickPoint, compareX, compareY);
    drawLine(secondClickPoint, firstClickPoint, compareX, compareY);
  };

  const fill = point => {
    canvasMap.forEach(cellItem => {
      if (cellItem.group === point.group && !cellItem.value) {
        cellItem.value = "O";
      }
    });
    setState({ canvasMap });
  };

  const draw = point => {
    if (toolMode.bucketFillMode) {
      if (point.value !== "X") fill(point);
      else if (point.value === "X")
        toast.warn("You can't fill the line", {
          containerId: "B"
        });
      return;
    }

    // if (secondClickPoint && !toolMode.bucketFillMode) {
    //   resetCanvas(point);
    //   return;
    // }

    if (!firstClickPoint) {
      canvasMap[point.key].value = "X";
      setState({ firstClickPoint: point });
    } else {
      const secondClickPoint = canvasMap[point.key];
      secondClickPoint.value = "X";

      if (toolMode.lineMode) drawLine(firstClickPoint, secondClickPoint);
      if (toolMode.rectangleMode)
        drawRectangle(firstClickPoint, secondClickPoint);
      setState({
        canvasMap,
        firstClickPoint: null,
        secondClickPoint: null
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

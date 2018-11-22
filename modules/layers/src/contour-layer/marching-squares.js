// All utility mehtods needed to implement Marching Squres algorithm
// Ref: https://en.wikipedia.org/wiki/Marching_squares
import assert from 'assert';

// Table to map code to the intersection offsets
// All offsets are relative to the center of marching cell (which is top right corner of grid-cell)
const OFFSET = {
  N: [0, 0.5],//
  E: [0.5, 0],
  S: [0, -0.5],
  W: [-0.5, 0]
};

// Note: above wiki page invertes white/black dots for generating the code, we don't
/**告诉你怎么看到对应的code时候  要找的等高线的值应该如何根据现有的点进行计算 */
/*const CODE_OFFSET_MAP = {
  0: [],
  1: [[OFFSET.W, OFFSET.S]],
  2: [[OFFSET.S, OFFSET.E]],
  3: [[OFFSET.W, OFFSET.E]],
  4: [[OFFSET.N, OFFSET.E]],
  5: [[OFFSET.W, OFFSET.N], [OFFSET.S, OFFSET.E]],
  6: [[OFFSET.N, OFFSET.S]],
  7: [[OFFSET.W, OFFSET.N]],
  8: [[OFFSET.W, OFFSET.N]],
  9: [[OFFSET.N, OFFSET.S]],
  10: [[OFFSET.W, OFFSET.S], [OFFSET.N, OFFSET.E]],
  11: [[OFFSET.N, OFFSET.E]],
  12: [[OFFSET.W, OFFSET.E]],
  13: [[OFFSET.S, OFFSET.E]],
  14: [[OFFSET.W, OFFSET.S]],
  15: []
};*/

const CODE_OFFSET_MAP = {
  0: [],
  1: [[OFFSET.S, OFFSET.W]],
  2: [[OFFSET.E, OFFSET.S]],
  3: [[OFFSET.E, OFFSET.W]],
  4: [[OFFSET.N, OFFSET.E]],
  5: [[OFFSET.N, OFFSET.W], [OFFSET.S, OFFSET.E]],
  6: [[OFFSET.N, OFFSET.S]],
  7: [[OFFSET.N, OFFSET.W]],//youwenti应该是 w n
  8: [[OFFSET.W, OFFSET.N]],
  9: [[OFFSET.S, OFFSET.N]],
  10: [[OFFSET.W, OFFSET.S], [OFFSET.E, OFFSET.N]],
  11: [[OFFSET.E, OFFSET.N]],
  12: [[OFFSET.W, OFFSET.E]],
  13: [[OFFSET.S, OFFSET.E]],
  14: [[OFFSET.W, OFFSET.S]],
  15: []
};

 /*另一种行进方块的操作方式 
 const CODE_OFFSET_MAP = [
  [],
  [[[1.0, 0.5], [0.5, 1.0]]],
  [[[1.5, 1.0], [1.0, 1.5]]],
  [[[1.5, 1.0], [0.5, 1.0]]],
  [[[1.0, 0.5], [1.5, 1.0]]],
  [[[1.0, 1.5], [0.5, 1.0]], [[1.0, 0.5], [1.5, 1.0]]],
  [[[1.0, 0.5], [1.0, 1.5]]],
  [[[1.0, 0.5], [0.5, 1.0]]],
  [[[0.5, 1.0], [1.0, 0.5]]],
  [[[1.0, 1.5], [1.0, 0.5]]],
  [[[0.5, 1.0], [1.0, 0.5]], [[1.5, 1.0], [1.0, 1.5]]],
  [[[1.5, 1.0], [1.0, 0.5]]],
  [[[0.5, 1.0], [1.5, 1.0]]],
  [[[1.0, 1.5], [1.5, 1.0]]],
  [[[0.5, 1.0], [1.0, 1.5]]],
  []
]; */


let flages=0;
// Returns marching square code for given cell
/* eslint-disable complexity */
export function getCode({cellWeights, thresholdValue, x, y, width, height}) {//所有的权值组成的数组  一个阀值  此小方格处的xy坐标
  // Assumptions
  // Origin is on bottom-left , and X increase to right, Y to top
  // When processing one cell, we process 4 cells, by extending row to top and on column to right
  // to create a 2X2 cell grid

  assert(x >= -1 && x <= width);
  assert(y >= -1 && y <= height);
  /*if(flages<5){
console.log(cellWeights);flages++;
}*/
  const isLeftBoundary = x < 0;
  const isRightBoundary = x >= width - 1;
  const isBottomBoundary = y < 0;
  const isTopBoundary = y >= height - 1;
/*console.log(" ");
  console.log("isLeftBoundary: "+isLeftBoundary+"  isLeftBoundary || isTopBoundary: "+isLeftBoundary || isTopBoundary);
  console.log("isRightBoundary: "+isRightBoundary+"  isRightBoundary || isTopBoundar:y  "+isRightBoundary || isTopBoundary);
  console.log("isBottomBoundary: "+isBottomBoundary+"  isRightBoundary: "+isRightBoundary);
  console.log("isTopBoundary: "+isTopBoundary+"  isLeftBoundary || isBottomBoundary:  "+isLeftBoundary || isBottomBoundary);
  console.log("x:"+x+",y:"+y);
console.log("(y + 1) * width + x: "+((y + 1) * width + x));
console.log("(y + 1) * width + x + 1: "+((y + 1) * width + x + 1));
console.log("y * width + x + 1: "+(y * width + x + 1));
console.log("y * width + x: "+(y * width + x));*/
  const top =
    isLeftBoundary || isTopBoundary
      ? 0
      : cellWeights[(y + 1) * width + x] - thresholdValue >= 0
        ? 1
        : 0;
  const topRight =
    isRightBoundary || isTopBoundary
      ? 0
      : cellWeights[(y + 1) * width + x + 1] - thresholdValue >= 0
        ? 1
        : 0;
  const right = isRightBoundary ? 0 : cellWeights[y * width + x + 1] - thresholdValue >= 0 ? 1 : 0;
  const current =
    isLeftBoundary || isBottomBoundary
      ? 0
      : cellWeights[y * width + x] - thresholdValue >= 0
        ? 1
        : 0;

  const code = (top << 3) | (topRight << 2) | (right << 1) | current;

  assert(code >= 0 && code < 16);
//console.log(code);
  return code;
}
/* eslint-enable complexity */

// Returns intersection vertices for given cellindex  ：返回给定cellindex的intersection顶点
// [x, y] refers current marchng cell, reference vertex is always top-right corner.[x，y]指的是当前的marchng单元，参考顶点总是右上角
export function getVertices({gridOrigin, cellSize, x, y, code}) {//方格的原始起点   小方格的大小  xy坐标  小方格的类型(用code标记过的)
  const offsets = CODE_OFFSET_MAP[code];

  // Reference vertex is at top-right move to top-right corner
  assert(x >= -1);
  assert(y >= -1);

  const rX = (x + 1) * cellSize[0];
  const rY = (y + 1) * cellSize[1];

  const refVertexX = gridOrigin[0] + rX;
  const refVertexY = gridOrigin[1] + rY;

  const vertices = [];
  offsets.forEach(xyOffsets => {
    xyOffsets.forEach(offset => {
      const vX = refVertexX + offset[0] * cellSize[0];
      const vY = refVertexY + offset[1] * cellSize[1];
      vertices.push([vX, vY]);
    });
  });

  return vertices;
}
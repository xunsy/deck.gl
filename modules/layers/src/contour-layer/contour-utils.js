import * as MarchingSquares from './marching-squares';
import assert from 'assert';
import {edgeJoint} from './xsydefind2.js';

// Given all the cell weights, generates contours for each threshold.
export function generateContours({
  thresholds,
  colors,
  cellWeights,
  gridSize,
  gridOrigin,
  cellSize
}) {
  let contourSegments = [];
  let contour=[];
  let contourbuffer;
  const width = gridSize[0];
  const height = gridSize[1];
/*console.log(width+" width and height"+height);//屏幕画布的长度和宽度
  console.log(" gridOrigin"+gridOrigin);//坐标原点的经纬度坐标
  console.log("cellSize:"+cellSize);//每一个小方格的大小  转化成了屏幕像素
  console.log("cellWeights:"+cellWeights); //所有的小方格的权重组成的数组  都是一维的
  */
//console.log("-----------------------------------------start");
thresholds.forEach((threshold, index) => {
   /**不能多循环一次 因为cellweight是一维模拟二维数组的  所以取值的时候会还x=1时 取到x=2的值 */
    for (let x = -1; x < width; x++) {
      for (let y = -1; y < height; y++) {
        // Get the MarchingSquares code based on neighbor cell weights.
        const code = MarchingSquares.getCode({
          cellWeights,
          thresholdValue: threshold,
          x,
          y,
          width,
          height
        });
        //console.log("----"+code);
        // Get the intersection vertices based on MarchingSquares code.
        const vertices = MarchingSquares.getVertices({
          gridOrigin,
          cellSize,
          x,
          y,
          width,
          height,
          code
        });
        // We should always get even number of vertices
        assert(vertices.length % 2 === 0);
        for (let i = 0; i < vertices.length; i += 2) {
          contourSegments.push({
            start: vertices[i],
            end: vertices[i + 1],
            threshold,
            falge:1,
            orderx:x,
            ordery:y
          });
        }
      }
    }
  
    //connect contourSegments  after a threshold has been finished
    contourbuffer=edgeJoint({contourSegments,
      gridSize });
      
      for(let i=0;i<contourbuffer.length;i++){
        contour.push(contourbuffer[i]);
      }
       
      contourbuffer=[];
      contourSegments=[];
  });  
  return contour;
  
}
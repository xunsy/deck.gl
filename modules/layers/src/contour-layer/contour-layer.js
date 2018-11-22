// Copyright (c) 2015 - 2018 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import {CompositeLayer} from '@deck.gl/core';
import {
  default as GPUGridAggregator
} from './gpu-grid-aggregation/gpu-grid-aggregator.js';
import {
  pointToDensityGridData
} from './gpu-grid-aggregation/grid-aggregation-utils.js';

import {PolygonLayer} from '@deck.gl/layers';

import {generateContours} from './contour-utils.js';


const DEFAULT_COLOR = [255, 255, 255];
const DEFAULT_STROKE_WIDTH = 1;
const DEFAULT_THRESHOLD = 1;
const DATA_BUFFER_URL = 'buffer.json'; 
const xsy_color=[[36,0,59],[36,0,59],[36,0,59],[83,0,186],[29,16,240],[8,90,248],[1,164,213],[0,216,234],[0,183,0],[0,183,0],[178,214,0],[178,214,1],[223,203,0],[255,128,0],[255,128,1],[255,34,0],[255,62,0],[139,4,0],[62,0,0]];
const defaultProps = { 
  cellSize: {type: 'number', min: 1, max: 1000, value: 1000},
  getPosition: x => x.position,
  contours: [{threshold: DEFAULT_THRESHOLD}],
  fp64: false
};

export default class ContourLayer extends CompositeLayer {
  initializeState() {
    const {gl} = this.context;
    const options = {
      id: `${this.id}-gpu-aggregator`,
      shaderCache: this.context.shaderCache
    };
    this.state = {
      contourData: [],
      gridAggregator: new GPUGridAggregator(gl, options),
      xsy_contour:[]
    };
  
  }

  updateState({oldProps, props, changeFlags}) {
    let contoursDirty = false;
    if (changeFlags.dataChanged || oldProps.cellSize !== props.cellSize) {
      contoursDirty = true;
      // Clear countsData cache
      this.setState({countsData: null});
      this.aggregateData();
      this.generateContours();
    }

 
  }

  getSubLayerClass() {
    return PolygonLayer;
  }

  getSubLayerProps() {
    const {fp64} = this.props;
   
    return super.getSubLayerProps({
      id: 'polygon-layer',
      data: this.state.xsy_contour,
      pickable: true,
        stroked: true,
        filled: true,
        wireframe: true,
        extruded:false, 
        lineWidthMinPixels: 2,
        getPolygon: d => d.counter,
        
        getFillColor:d=>{
          
          if(d.WEIGHT>150){
            return [70+(d.WEIGHT-150)*39/150,142+(d.WEIGHT-150)*61/150,119+(d.WEIGHT-150) /3,119+(d.WEIGHT-150) /3];
          }
          else{
            return [36+(d.WEIGHT )*34/150,81+(d.WEIGHT )*41/150,98+(d.WEIGHT ) *21/150,98+(d.WEIGHT ) *21/150]
          }
    }, 
        getLineColor: d=>{
          return xsy_color[parseInt(d.WEIGHT/20)]; },
        getLineWidth: 2, 
    });
  }

  

  renderLayers() {
    const SubLayerClass = this.getSubLayerClass();
    return new SubLayerClass(this.getSubLayerProps());
  }

  // Private

  aggregateData() {
    const {
      data,
      cellSize: cellSizeMeters,
      getPosition,
     
      gpuAggregation,
      fp64,
      coordinateSystem
    } = this.props;
   
  
    const {countsData, countsBuffer, gridSize, gridOrigin, cellSize} = pointToDensityGridData({
      data,
      cellSizeMeters,
      getPosition,
      gpuAggregation,
      gpuGridAggregator: this.state.gridAggregator,
      fp64,
      coordinateSystem,
      viewport: this.context.viewport,
     
    });
   
    this.setState({countsData, countsBuffer, gridSize, gridOrigin, cellSize});
  }

  generateContours() {
    const {gridSize, gridOrigin, cellSize} = this.state;
    let {countsData} = this.state;
    if (!countsData) {
      const {countsBuffer} = this.state;
      countsData = countsBuffer.getData();//获取权值的地方
      
        this.setState({countsData});
    }

    const {cellWeights} = GPUGridAggregator.getCellData({countsData});
    const thresholds = this.props.contours.map(x => x.threshold);
       let contourData = generateContours({
      thresholds,
      cellWeights,
      gridSize,
      gridOrigin,
      cellSize
    });
   
    
    let xsy_contour =contourData;
    



      this.setState({contourData,xsy_contour});
   
  }
  
  onGetSublayerColor(segment) {
    const {contours} = this.props;
    let color = DEFAULT_COLOR;
    contours.forEach(data => {
      if (data.threshold === segment.threshold) {
        color = data.color || DEFAULT_COLOR;
      }
    });
    return color;
  }

  onGetSublayerStrokeWidth(segment) {
    const {contours} = this.props;
    let strokeWidth = DEFAULT_STROKE_WIDTH;
    // Linearly searches the contours, but there should only be few contours
    contours.some(contour => {
      if (contour.threshold === segment.threshold) {
        strokeWidth = contour.strokeWidth || DEFAULT_STROKE_WIDTH;
        return true;
      }
      return false;
    });
    return strokeWidth;
  }

  rebuildContours({oldProps, props}) {
    if (oldProps.contours.length !== props.contours.length) {
      return true;
    }
    const oldThresholds = oldProps.contours.map(x => x.threshold);
    const thresholds = props.contours.map(x => x.threshold);

    return thresholds.some((_, i) => thresholds[i] !== oldThresholds[i]);
  }
}

ContourLayer.layerName = 'ContourLayer';
ContourLayer.defaultProps = defaultProps;
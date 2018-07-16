import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL, {LineLayer, ScatterplotLayer} from 'deck.gl';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  latitude: 37.785164,
  longitude: -122.41669,
  zoom: 16,
  bearing: -20,
  pitch: 60
};

const COLORS = [[255, 0, 0], [0, 0, 255]];

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      colorIndex: null,
      scatterplotData: [{position: [-122.41669, 37.79]}]
    };
  }

  componentDidMount() {
    this.onTick();
  }

  onTick() {
    let nextColorIndex = null;
    let nextColorName = null;
    switch (this.state.colorIndex) {
      case null:
        nextColorIndex = 0;
        nextColorName = 'RED';
        break;
      case 0:
        nextColorIndex = 1;
        nextColorName = 'BLUE';
        break;
      default:
        nextColorIndex = null;
        nextColorName = 'WHITE';
        break;
    }
    console.log(`setting color name=${nextColorName}, index=${nextColorIndex}`); // eslint-disable-line
    this.setState({colorIndex: nextColorIndex});
    setTimeout(() => this.onTick(), 2000); // eslint-disable-line no-undef
  }

  render() {
    return (
      <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} width="100%" height="100%">
        <StaticMap mapboxApiAccessToken={MAPBOX_TOKEN} />
        <LineLayer
          data={[{sourcePosition: [-122.41669, 37.7883], targetPosition: [-122.41669, 37.781]}]}
          strokeWidth={5}
        />
        <ScatterplotLayer
          data={this.state.scatterplotData}
          radiusScale={100}
          getColor={() =>
            this.state.colorIndex === null ? [255, 255, 255] : COLORS[this.state.colorIndex]
          }
          updateTriggers={{
            getColor: this.state.colorIndex
          }}
        />
      </DeckGL>
    );
  }
}

/* global document */
render(<Root />, document.body.appendChild(document.createElement('div')));

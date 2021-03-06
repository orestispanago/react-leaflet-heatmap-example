import React from 'react';
import { render } from 'react-dom';
import { Map, TileLayer } from 'react-leaflet';
import HeatmapLayer from '../src/HeatmapLayer';
import { addressPoints } from './realworld.10000.js';
import axios from 'axios';


class MapExample extends React.Component {

  state = {
    mapHidden: false,
    layerHidden: false,
    addressPoints,
    radius: 30,
    blur: 8,
    max: 9,
    limitAddressPoints: true,
    current : []
  };

  /**
   * Toggle limiting the address points to test behavior with refocusing/zooming when data points change
   */
  toggleLimitedAddressPoints() {
    if (this.state.limitAddressPoints) {
      this.setState({ addressPoints: addressPoints.slice(500, 1000), limitAddressPoints: false });
    } else {
      this.setState({ addressPoints, limitAddressPoints: true });
    }
  }
  componentDidMount() {
    axios.get(`http://localhost:8080/current`)
      .then(res => {
        const result = res.data;
        var current = [];
        result.forEach(element => current.push([element.lat,element.lon, element.pm1]))
        this.setState({ current });
      })
  }
  render() {
    if (this.state.mapHidden) {
      return (
        <div>
          <input
            type="button"
            value="Toggle Map"
            onClick={() => this.setState({ mapHidden: !this.state.mapHidden })}
          />
        </div>
      );
    }

    const gradient = {
      0.1: '#89BDE0', 0.2: '#96E3E6', 0.4: '#82CEB6',
      0.6: '#FAF3A5', 0.8: '#F5D98B', '1.0': '#DE9A96'
    };
    return (
      <div>
        <Map center={[0, 0]} zoom={13}>
          {!this.state.layerHidden &&
              <HeatmapLayer
                fitBoundsOnLoad
                fitBoundsOnUpdate
                points={this.state.current}
                latitudeExtractor={m => m[0]}
                longitudeExtractor={m => m[1]}
                gradient={gradient}
                intensityExtractor={m => parseFloat(m[2])}
                radius={Number(this.state.radius)}
                blur={Number(this.state.blur)}
                max={Number.parseFloat(this.state.max)}
              />
            }
          <TileLayer
            url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
        </Map>
        <input
          type="button"
          value="Toggle Map"
          onClick={() => this.setState({ mapHidden: !this.state.mapHidden })}
        />
        <input
          type="button"
          value="Toggle Layer"
          onClick={() => this.setState({ layerHidden: !this.state.layerHidden })}
        />
        <input
          type="button"
          value="Toggle Limited Data"
          onClick={this.toggleLimitedAddressPoints.bind(this)}
        />

        <div>
          Radius
          <input
            type="range"
            min={1}
            max={40}
            value={this.state.radius}
            onChange={(e) => this.setState({ radius: e.currentTarget.value })}
          /> {this.state.radius}
        </div>

        <div>
          Blur
          <input
            type="range"
            min={1}
            max={20}
            value={this.state.blur}
            onChange={(e) => this.setState({ blur: e.currentTarget.value })}
          /> {this.state.blur}
        </div>

        <div>
          Max
          <input
            type="range"
            min={0.1}
            max={25}
            step={0.1}
            value={this.state.max}
            onChange={(e) => this.setState({ max: e.currentTarget.value })}
          /> {this.state.max}
        </div>
      </div>
    );
  }
}

render(<MapExample />, document.getElementById('app'));

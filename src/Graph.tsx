import React, { Component } from 'react';
import {Table, TableData} from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = { //configures the Perspective table view of our graph
      price_abc: 'float', //needed to calculate ratio
      price_def: 'float', //needed to calculate ratio
      ratio: 'float', //added ratio field as this is what we want to show
      timestamp: 'date', //x-axis
      upper_bound: 'float', //track upper and lower bounds
      lower_bound: 'float', //track upper and lower bounds
      trigger_alert: 'float', //create an alert when lower and upperbound gets crossed
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute('view', 'y_line'); //type of graph we want
      elem.setAttribute('row-pivots', '["timestamp"]'); //maps datapoints to timestamps
      elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]'); //allows us to focus on a particular part of a datapoint's data along the y-axis
      elem.setAttribute('aggregates', JSON.stringify({ //hangles the duplicate data
        price_abc: 'avg',
        price_def: 'avg',
        ratio: 'avg',
        timestamp: 'distinct count',
        upper_bound: 'avg',
        lower_bound: 'avg',
        trigger_alert: 'avg',
      }));
    }
  }

  componentDidUpdate() { //component lifecycle method - executed whenever the component updates
    if (this.table) {
      this.table.update(
        [DataManipulator.generateRow(this.props.data),
      ] as unknown as TableData);
    }
  }
}

export default Graph;

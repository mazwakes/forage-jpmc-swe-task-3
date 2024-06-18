import { ServerRespond } from './DataStreamer';
//this file is responsible for processing the raw stock data we receive from the server before the Graph component renders it

export interface Row { //updated to match the new schema
  price_abc: number,
  price_def: number,
  ratio: number,
  timestamp: Date,
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined,
}


export class DataManipulator {
  static generateRow(serverRespond: ServerRespond[]) : Row {
    const priceABC = (serverRespond[0].top_ask.price + serverRespond[0].top_bid.price) / 2; //calculating priceABC
    const priceDEF = (serverRespond[1].top_ask.price + serverRespond[1].top_bid.price) / 2; //calculating priceDEF
    const ratio = priceABC / priceDEF; //calcualting ratio
    //+/-10% of 12 month average ratio
    const upperBound = 1 + 0.05;
    const lowerBound = 1 - 0.05;
    return{ //matching values calculated in generateRow to variable names in row interface and schema
      price_abc : priceABC,
      price_def : priceDEF,
      ratio,
      timestamp: serverRespond[0].timestamp > serverRespond[1].timestamp ?
          serverRespond[0].timestamp : serverRespond[1].timestamp,
      upper_bound: upperBound,
      lower_bound: lowerBound,
      trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined,
    };
  }
}

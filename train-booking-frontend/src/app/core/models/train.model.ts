export interface TrainStation {
  id: number;
  stationCode: string;
  stationName: string;
  city: string;
  state: string;
}

export interface Train {
  id: number;
  trainNumber: string;
  trainName: string;

  sourceStation: TrainStation;
  destinationStation: TrainStation;

  departureTime: string;
  arrivalTime: string;

  active: boolean;

  createdAt?: string;
  updatedAt?: string;
}
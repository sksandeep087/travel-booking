export interface Station {
  id: number;
  stationCode: string;
  stationName: string;
  city: string;
  state: string;
  createdAt?: string;
  updatedAt?: string | null;
}
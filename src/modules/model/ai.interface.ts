import { VehicleConditionEnum, QuoteResponseEnum } from './enum';

export interface IAIPriceEstimator {
  id: string;
  make: string;
  model: string;
  year: number;
  condition: VehicleConditionEnum;
  location?: string;
  metalMarketRate?: number;
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  confidenceScore: number; // 0-1
  createdAt: Date;
}

export interface ICreateAIPriceEstimatorRequest {
  make: string;
  model: string;
  year: number;
  condition: VehicleConditionEnum;
  location?: string;
  metalMarketRate?: number;
}

export interface IAIAutoQuote {
  id: string;
  customerId?: string;
  vehicleDetails: {
    make?: string;
    model?: string;
    year?: number;
    condition?: string;
    type?: string;
  };
  generatedPrice: number;
  respondedVia: QuoteResponseEnum;
  timestamp: Date;
  createdAt: Date;
}

export interface ICreateAIAutoQuoteRequest {
  customerId?: string;
  vehicleDetails: {
    make?: string;
    model?: string;
    year?: number;
    condition?: string;
    type?: string;
  };
  generatedPrice: number;
  respondedVia: QuoteResponseEnum;
}

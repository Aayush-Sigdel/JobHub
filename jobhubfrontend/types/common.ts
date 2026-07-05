export interface Location {
  city: string;
  state?: string;
  country: string;
}

export interface Salary {
  min: number;
  max: number;
  currency: string;
  frequency: "Hourly" | "Daily" | "Weekly" | "Monthly" | "Yearly";
  isEstimated?: boolean;
}

export interface AppliedFilters {
  steps: Array<AppliedStep>;
}

export interface AppliedStep {
  event: string;
  attributes: Array<AppliedAttribute>;
}

export interface AppliedAttribute {
  property: string;
  operator: string;
  value: string | number | { from: number; to: number };
}

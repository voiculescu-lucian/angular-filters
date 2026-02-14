export type CustomerEventPropertyType = 'string' | 'number';

export interface CustomerEventProperty {
    property: string;
    type: CustomerEventPropertyType;
}
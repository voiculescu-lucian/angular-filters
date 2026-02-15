import { CustomerEventProperty } from "./customer-event-property.interface";

export interface CustomerEvent {
    type: string;
    properties: Array<CustomerEventProperty>;
}
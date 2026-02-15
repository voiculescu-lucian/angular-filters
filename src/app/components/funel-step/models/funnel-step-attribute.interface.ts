import { InBetweenNumberValue } from "../../table-overview/models/step-attribute-form-group.interface";

export interface FunnelStepAttribute {
    property: string;
    operator: string;
    value: string | number | InBetweenNumberValue;
}
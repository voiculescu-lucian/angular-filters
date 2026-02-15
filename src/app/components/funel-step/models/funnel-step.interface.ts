import { FunnelStepAttribute } from "./funnel-step-attribute.interface";

export interface FunnelStep {
    step: number;
    event: string;
    attributes: Array<FunnelStepAttribute>;
}
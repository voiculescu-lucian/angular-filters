import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { StepAttributeFormGroup } from "./step-attribute-form-group.interface";

export interface StepFormGroup {
    step: FormControl<number>;
    event: FormControl<string>;
    attributes: FormArray<FormGroup<StepAttributeFormGroup>>;
}
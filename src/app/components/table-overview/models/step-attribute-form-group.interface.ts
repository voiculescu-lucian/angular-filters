import { FormControl } from "@angular/forms";

export interface StepAttributeFormGroup {
    property: FormControl<string>;
    operator: FormControl<string>;
    value: FormControl<string>;
}
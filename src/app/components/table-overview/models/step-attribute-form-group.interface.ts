import { Form, FormControl, FormGroup } from "@angular/forms";

export interface InBetweenNumberValue {
    from: number;
    to: number;
}

export interface StepAttributeFormGroup {
    property: FormControl<string>;
    operator: FormControl<string>;
    value: FormControl<any> | FormGroup<any>; // sorry for using 'any' bad practice, but for quick fix it's ok, we can refactor this later to be more strict
}
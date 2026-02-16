import { FormArray, FormGroup } from '@angular/forms';
import { StepFormGroup } from './models/step-form-group.interface';
import { AppliedFilters, AppliedStep, AppliedAttribute } from './models/applied-filter.interface';

export function mapFormToAppliedFilters(formArray: FormArray<FormGroup<StepFormGroup>>): AppliedFilters {
  const steps: AppliedStep[] = formArray.controls.map(step => ({
    event: step.controls.event.value,
    attributes: step.controls.attributes.controls.map(attr => {
      const operator = attr.controls.operator.value;
      const property = attr.controls.property.value;

      let value: any;

      if (operator === 'between') {
        value = {
          from: attr.get('value.from')?.value,
          to: attr.get('value.to')?.value
        };
      } else {
        value = attr.controls.value.value;
      }

      return {
        property,
        operator,
        value
      };
    })
  }));

  return { steps };
}

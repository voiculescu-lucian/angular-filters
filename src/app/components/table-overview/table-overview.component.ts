import { Component, inject } from '@angular/core';
import { CustomerEventsService } from '../../events/customer-events.service';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FunelStepComponent } from '../funel-step/funel-step.component';
import {  FormArray, FormControl, FormGroup } from '@angular/forms';
import { StepFormGroup } from './models/step-form-group.interface';
import { StepAttributeFormGroup } from './models/step-attribute-form-group.interface';
import { FunnelStepAttribute } from '../funel-step/models/funnel-step-attribute.interface';

@Component({
  selector: 'app-table-overview',
  templateUrl: './table-overview.component.html',
  styleUrls: ['./table-overview.component.scss'],
  standalone: true,
  imports: [CommonModule, UpperCasePipe, MatCardModule, MatIconModule, MatButtonModule, 
    FunelStepComponent]
})
export class TableOverviewComponent {
    public readonly eventsService = inject(CustomerEventsService);

    protected readonly title = 'Customer filter';

    public form: FormArray<FormGroup<StepFormGroup>> = new FormArray<FormGroup<StepFormGroup>>([
        new FormGroup<StepFormGroup>({
            step: new FormControl(1, { nonNullable: true }),
            event: new FormControl('', { nonNullable: true }),
            attributes: new FormArray<FormGroup<StepAttributeFormGroup>>([])
        })
    ]);

    public addStep() {
        this.form.push(this.createStep(this.form.length + 1));
    }

    private createStep(stepNumber: number): FormGroup<StepFormGroup> {
        return new FormGroup<StepFormGroup>({
            step: new FormControl(stepNumber, { nonNullable: true }),
            event: new FormControl('', { nonNullable: true }),
            attributes: new FormArray<FormGroup<StepAttributeFormGroup>>([])
        });
    }

    public applyFilters() {
        if (this.form.valid) {
            console.log('Filters Applied:', this.form.getRawValue());
        } else {
            this.form.markAllAsTouched();
        }
    }

    public removeStep(index: number): void {
        this.form.removeAt(index);
    }

    public duplicateStep(index: number): void {
        const sourceStep = this.form.at(index).getRawValue();

        const newStepGroup = new FormGroup<StepFormGroup>({
            step: new FormControl(this.form.length + 1, { nonNullable: true }), 
            event: new FormControl(sourceStep.event, { nonNullable: true }),
            attributes: new FormArray<FormGroup<StepAttributeFormGroup>>([])
        });

        if (sourceStep.attributes && sourceStep.attributes.length > 0) {
            sourceStep.attributes.forEach((attr: FunnelStepAttribute) => {
                const attrGroup = new FormGroup<StepAttributeFormGroup>({
                    property: new FormControl(attr.property, { nonNullable: true }),
                    operator: new FormControl(attr.operator, { nonNullable: true }),
                    value: new FormControl(attr.value, { nonNullable: true })
                });
                newStepGroup.controls.attributes.push(attrGroup);
            });
        }

        this.form.insert(index + 1, newStepGroup);
        
        this.recalculateStepNumbers();
    }

    private recalculateStepNumbers(): void {
        this.form.controls.forEach((control, idx) => {
            control.patchValue({ step: idx + 1 });
        });
    }

    public discardFilters() {
        this.form.clear();
        this.form.patchValue([]);
        this.addStep();
    }
}

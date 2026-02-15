import { Component, input, output, computed, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { startWith } from 'rxjs/operators';
import { StepAttributeFormGroup } from '../table-overview/models/step-attribute-form-group.interface';
import { CustomerEventProperty } from '../../events/models/customer-event-property.interface';
import { NumberOperator, StringOperator } from '../../operators.enum';

@Component({
  selector: 'app-attribute',
  templateUrl: './attribute.component.html',
  styleUrls: ['./attribute.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatAutocompleteTrigger,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
})
export class AttributeComponent implements OnInit {

  public group = input.required<FormGroup<StepAttributeFormGroup>>();
  public index = input.required<number>();
  public eventName = input<string | null>(null);
  public availableProperties = input.required<Array<CustomerEventProperty>>();
  public generalProperties: Array<CustomerEventProperty> = [
        {   
            property: 'timestamp',
            type: 'string'
        }, {
            property: 'index',
            type: 'number'
        }
    ];

  public remove = output<void>();

  public filterValue = signal<string>('');

  public filteredProperties = computed(() => {
    const search = this.filterValue().toLowerCase();
    const allProps: Array<CustomerEventProperty> = [
        ...this.availableProperties().sort((a: CustomerEventProperty, b: CustomerEventProperty) => a.property.localeCompare(b.property)), 
        ...this.generalProperties
    ];

    if (!search) {
        return allProps;
    }

    return allProps.filter((prop: CustomerEventProperty) => {
        return prop.property.toLowerCase().includes(search);
    });
  });

  public equalsStringOperators: Array<string> = [StringOperator.Equals, StringOperator.DoesNotEqual];
  public inBetweenNumberOperators: Array<string> = [NumberOperator.InBetween];
  public stringOperators = Object.values(StringOperator);
  public numberOperators = Object.values(NumberOperator);

  private readonly destroyRef = inject(DestroyRef);

  public ngOnInit(): void {
    const propertyControl = this.group().controls.property;

    if (propertyControl) {
        propertyControl.valueChanges.pipe(
            startWith(propertyControl.value || ''),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((value) => {
            this.filterValue.set(typeof value === 'string' ? value : '');
        });
    }

    this.group().controls.operator.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((op) => {
        this.updateValueControlStructure(op);
      });
  }

  public onOptionSelected(event: MatAutocompleteSelectedEvent): void {
        const value = event.option.value;

        const getSelectedProperty = this.availableProperties().find(prop => prop.property === value);

        if (!getSelectedProperty) {
            return;
        }

        if (getSelectedProperty.type === 'number' && !this.inBetweenNumberOperators.includes(this.group().controls.operator.value)) {
            this.group().controls.operator.setValue(NumberOperator.EqualTo);
            this.group().controls.value.setValue(0);
        } else if (getSelectedProperty.type === 'number' && this.inBetweenNumberOperators.includes(this.group().controls.operator.value)) {
            this.group().controls.operator.setValue(NumberOperator.EqualTo);
            this.group().get('value.from')?.setValue(0);
            this.group().get('value.to')?.setValue(0);
        } else {
            this.group().controls.operator.setValue(StringOperator.Equals);
            this.group().controls.value.setValue('');
        }
    }

    public onOperatorChange(event: MatSelectChange): void {
        const selectedOperator = event.value;

        if (selectedOperator === NumberOperator.InBetween) {
            this.group().get('value.from')?.setValue(0);
            this.group().get('value.to')?.setValue(0);
        } else if (this.numberOperators.includes(selectedOperator)) {
            this.group().controls.value.setValue(0);
        } else {
            this.group().controls.value.setValue('');
        }
    }

  public getPropertyType(propertyName: string | null | undefined): 'string' | 'number' {
    if (!propertyName) {
        return 'string';
    }
    const prop = this.availableProperties().find(prop => prop.property === propertyName);
    return (prop?.type as 'string' | 'number') || 'string';
  }

  public togglePanel(trigger: MatAutocompleteTrigger) {
        if (trigger.panelOpen) {
        trigger.closePanel();
    } else {
        trigger.openPanel();
    }
}

  public onRemove(): void {
    this.remove.emit();
  }

  public isRangeOperator(): boolean {
      return this.inBetweenNumberOperators.includes(this.group().controls.operator.value);
  }

  private updateValueControlStructure(operator: string): void {
    const isRange = this.inBetweenNumberOperators.includes(operator);
    const formGroup = this.group() as FormGroup; 
    
    const currentValueControl = formGroup.get('value');

    if (isRange && !(currentValueControl instanceof FormGroup)) {
        formGroup.removeControl('value');
        formGroup.addControl('value', new FormGroup({
            from: new FormControl('', { nonNullable: true }),
            to: new FormControl('', { nonNullable: true })
        }));
    } 
    else if (!isRange && (currentValueControl instanceof FormGroup)) {
        formGroup.removeControl('value');
        formGroup.addControl('value', new FormControl('', { nonNullable: true }));
    }
  }
}
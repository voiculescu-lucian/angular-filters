import { Component, computed, inject, input, OnDestroy, OnInit, output, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CustomerEvent } from '../../events/models/customer-event.interface';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { CustomerEventsService } from '../../events/customer-events.service';
import { of, startWith, Subject, takeUntil, tap } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { StepAttributeFormGroup } from '../table-overview/models/step-attribute-form-group.interface';
import { CustomerEventProperty } from '../../events/models/customer-event-property.interface';
import { MatSelectModule } from '@angular/material/select';
import { AttributeComponent } from '../attribute/attribute.component';
import { StepFormGroup } from '../table-overview/models/step-form-group.interface';

@Component({
  selector: 'app-funel-step',
  templateUrl: './funel-step.component.html',
  styleUrls: ['./funel-step.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatAutocompleteTrigger,
    AttributeComponent
  ],
})
export class FunelStepComponent implements OnInit, OnDestroy {
    public group = input.required<FormGroup<StepFormGroup>>();
    public stepNumber = input.required<number>();
    public copyStep = output<void>();
    public deleteStep = output<void>();

    public attributeControl = new FormControl('');
    public newValueSelected = signal<string | null>(null);
    public availableAttributes = signal<Array<any>>([]);

    public stringOperators = ['equals', 'does not equal', 'contains', 'does not contain'];
    public numberOperators = ['equal to', 'in between', 'less than', 'greater than'];

    public placeholderInput = 'Select an event';

    public readonly eventsService = inject(CustomerEventsService);
    public events: Signal<Array<CustomerEvent>> = toSignal(
        this.eventsService.getEvents(),
        { initialValue: [] }
    );

    public isEventSelected = computed(() => !!this.newValueSelected());

    public selectedEventObj = computed(() => 
        this.events().find(e => e.type === this.newValueSelected())
    );

    public availableProperties: Signal<CustomerEventProperty[]> = computed(() => 
        this.selectedEventObj()?.properties || []
    );

    public eventTypes: Signal<Array<string>> = computed(() =>
        this.events().map((event: CustomerEvent) => event.type)
    );

    public filteredEvents = computed(() => {
        return this.events().map((event: CustomerEvent) => event.type);
    });

    private readonly $destroy = new Subject<void>();

    public ngOnInit(): void {
        if (this.eventControl.value) {
            this.newValueSelected.set(this.eventControl.value);
        }

       this.eventControl.valueChanges.pipe(
            startWith(this.eventControl.value),
            debounceTime(300),
            distinctUntilChanged(),
            tap((value: string | null) => {
                if (!value) {
                    this.newValueSelected.set(null);
                    if (this.attributes.length > 0) {
                        this.attributes.clear();
                    }
                    return;
                }
                
                const isValidEvent = this.events().some((event: CustomerEvent) => event.type === value);
                
                if (isValidEvent) {
                    this.newValueSelected.set(value);
                } else {
                    this.newValueSelected.set(null);
                }

                if (this.attributes.length > 0 && !isValidEvent) {
                    this.attributes.clear();
                }
            }), 
            takeUntil(this.$destroy)
        ).subscribe();
    }

    public ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
        console.log('FunnelStepComponent destroyed');
    }

    public getPropertyType(propertyName: string | null | undefined): 'string' | 'number' {
        if (!propertyName) {
            return 'string';
        }
        
        const prop = this.availableProperties().find(p => p.property === propertyName);
        return (prop?.type as 'string' | 'number') || 'string';
    }

    public filteredAttributes() {
        const search = this.attributeControl.value?.toLowerCase() ?? '';

        return this.availableAttributes().filter(attr =>
            attr.property.toLowerCase().includes(search)
        );
    }

    public togglePanel(trigger: MatAutocompleteTrigger) {
         if (trigger.panelOpen) {
            trigger.closePanel();
            this.placeholderInput = 'Select an event';
        } else {
            trigger.openPanel();
            this.placeholderInput = 'Filter events...';
        }
    }

    public onAttributeSelected(event: MatAutocompleteSelectedEvent): void {
        const value = event.option.value;
        console.log('Selected attribute:', value);
    }   

    public onOptionSelected(event: MatAutocompleteSelectedEvent): void {
        const value = event.option.value;
        this.eventControl.setValue(value);
        this.newValueSelected.set(value);
        
        this.attributes.clear();
    }

    public get eventControl(): FormControl<string> {
        return this.group()?.get('event') as FormControl;
    }

    public get attributes(): FormArray<FormGroup<StepAttributeFormGroup>> {
        return this.group()?.get('attributes') as FormArray;
    }

    public onCopy(): void {
        this.copyStep.emit();
    }

    public onDelete(): void {
        this.deleteStep.emit();
    }

    public addAttribute(): void {
        this.attributes.push(
            new FormGroup<StepAttributeFormGroup>({
                property: new FormControl('', { nonNullable: true }),
                operator: new FormControl('equals', { nonNullable: true }),
                value: new FormControl('', { nonNullable: true })
            })
        );
    }

    public removeAttribute(index: number): void {
        this.attributes.removeAt(index);
    }
}

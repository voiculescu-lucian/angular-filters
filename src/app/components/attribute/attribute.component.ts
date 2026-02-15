import { Component, input, output, computed, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { startWith } from 'rxjs/operators'; // Import important
import { StepAttributeFormGroup } from '../table-overview/models/step-attribute-form-group.interface';
import { CustomerEventProperty } from '../../events/models/customer-event-property.interface';

@Component({
  selector: 'app-attribute',
  templateUrl: './attribute.component.html',
  styleUrls: ['./attribute.component.scss'], // Asigură-te că fișierul există
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
})
export class AttributeComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef); // Pentru dezabonare automată

  public group = input.required<FormGroup<StepAttributeFormGroup>>();
  public index = input.required<number>();
  public eventName = input<string | null>(null);
  public availableProperties = input.required<CustomerEventProperty[]>();
  public generalProperties = [
            {   
                property: 'timestamp',
                type: 'string'
            }, {
                property: 'index',
                type: 'number'
            }
        ];

  public remove = output<void>();

  // 1. Semnal pentru textul curent din input
  private filterValue = signal<string>('');

  // 2. Lista filtrată (Computed Signal)
  public filteredProperties = computed(() => {
    const search = this.filterValue().toLowerCase();
    const allProps = [...this.availableProperties().sort((a, b) => a.property.localeCompare(b.property)), ...this.generalProperties];

    // Dacă inputul e gol, returnăm tot
    if (!search) {
        return allProps;
    }

    return allProps.filter(p => 
        p.property.toLowerCase().includes(search)
    );
  });

  public stringOperators = ['equals', 'does not equal', 'contains', 'does not contain'];
  public numberOperators = ['equals', 'greater than', 'less than', 'greater than or equal', 'less than or equal'];

  public ngOnInit(): void {
    // 3. Ascultăm ce scrie utilizatorul în inputul 'property'
    const propertyControl = this.group().controls.property;

    propertyControl.valueChanges.pipe(
        startWith(propertyControl.value || ''), // Pornim cu valoarea curentă
        takeUntilDestroyed(this.destroyRef)     // Curățăm memoria automat
    ).subscribe((value) => {
        // Actualizăm semnalul care declanșează filtrarea
        this.filterValue.set(typeof value === 'string' ? value : '');
    });
  }

  public getPropertyType(propertyName: string | null | undefined): 'string' | 'number' {
    if (!propertyName) return 'string';
    const prop = this.availableProperties().find(p => p.property === propertyName);
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
}
# state_data/management/commands/force_populate_states.py

from django.core.management.base import BaseCommand
from state_data.models import StateData, VeteranBenefit

class Command(BaseCommand):
    help = 'Force populate all US states, overwriting existing data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear-first',
            action='store_true',
            help='Clear all existing state data before populating',
        )

    def handle(self, *args, **options):
        if options['clear_first']:
            self.stdout.write('Clearing existing state data...')
            StateData.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Cleared all existing data'))

        # State data with realistic cost of living indices (100 = national average)
        states_data = [
            # State, Cost of Living, Housing, Utilities, Grocery, Transport, Income Tax Min, Income Tax Max, Sales Tax, Property Tax
            ('AL', 'Alabama', 87.9, 73.0, 96.4, 91.2, 88.7, 2.0, 5.0, 4.0, 0.41),
            ('AK', 'Alaska', 125.8, 134.3, 157.6, 125.7, 106.9, 0.0, 0.0, 0.0, 1.19),
            ('AZ', 'Arizona', 102.2, 107.3, 102.8, 96.9, 94.4, 2.59, 4.5, 5.6, 0.62),
            ('AR', 'Arkansas', 86.9, 69.9, 95.7, 92.8, 94.1, 0.9, 5.9, 6.5, 0.61),
            ('CA', 'California', 151.7, 239.1, 106.9, 109.0, 107.1, 1.0, 13.3, 7.25, 0.75),
            ('CO', 'Colorado', 104.1, 128.0, 92.1, 100.8, 95.0, 4.4, 4.4, 2.9, 0.51),
            ('CT', 'Connecticut', 110.8, 112.8, 108.2, 109.4, 111.2, 3.0, 6.99, 6.35, 2.14),
            ('DE', 'Delaware', 102.7, 101.7, 110.2, 103.1, 105.3, 0.0, 6.6, 0.0, 0.57),
            ('FL', 'Florida', 99.0, 108.4, 101.9, 95.4, 99.6, 0.0, 0.0, 6.0, 0.83),
            ('GA', 'Georgia', 89.2, 80.7, 92.9, 93.4, 92.9, 1.0, 5.75, 4.0, 0.83),
            ('HI', 'Hawaii', 184.3, 336.0, 132.4, 141.8, 167.7, 1.4, 11.0, 4.0, 0.31),
            ('ID', 'Idaho', 92.3, 95.6, 92.7, 94.3, 88.5, 1.125, 6.925, 6.0, 0.69),
            ('IL', 'Illinois', 95.5, 91.9, 95.8, 106.2, 94.3, 4.95, 4.95, 6.25, 2.16),
            ('IN', 'Indiana', 87.0, 77.7, 97.4, 91.8, 89.6, 3.23, 3.23, 7.0, 0.81),
            ('IA', 'Iowa', 88.9, 75.4, 98.9, 94.3, 91.9, 0.33, 8.53, 6.0, 1.53),
            ('KS', 'Kansas', 86.5, 74.1, 98.2, 91.6, 89.0, 3.1, 5.7, 6.5, 1.41),
            ('KY', 'Kentucky', 87.5, 74.6, 94.2, 91.4, 93.2, 2.0, 5.0, 6.0, 0.85),
            ('LA', 'Louisiana', 94.4, 88.0, 87.3, 96.7, 106.1, 2.0, 6.0, 4.45, 0.55),
            ('ME', 'Maine', 98.0, 89.0, 108.0, 102.0, 95.0, 5.8, 7.15, 5.5, 1.35),
            ('MD', 'Maryland', 115.1, 124.0, 107.8, 109.6, 113.0, 2.0, 5.75, 6.0, 1.09),
            ('MA', 'Massachusetts', 149.7, 203.1, 107.7, 108.9, 108.9, 5.0, 5.0, 6.25, 1.17),
            ('MI', 'Michigan', 89.6, 73.6, 100.3, 91.2, 94.9, 4.25, 4.25, 6.0, 1.54),
            ('MN', 'Minnesota', 97.2, 93.7, 102.0, 99.1, 98.4, 5.35, 9.85, 6.875, 1.05),
            ('MS', 'Mississippi', 83.3, 68.6, 95.6, 88.4, 91.6, 0.0, 5.0, 7.0, 0.81),
            ('MO', 'Missouri', 87.1, 75.8, 97.6, 87.8, 95.7, 1.5, 5.4, 4.225, 0.97),
            ('MT', 'Montana', 96.0, 100.7, 93.6, 99.1, 87.9, 1.0, 6.9, 0.0, 0.84),
            ('NE', 'Nebraska', 89.1, 81.1, 91.8, 91.0, 93.5, 2.46, 6.84, 5.5, 1.76),
            ('NV', 'Nevada', 104.5, 127.5, 101.4, 103.8, 97.6, 0.0, 0.0, 4.6, 0.53),
            ('NH', 'New Hampshire', 108.0, 118.6, 107.7, 102.8, 106.4, 0.0, 0.0, 0.0, 2.18),
            ('NJ', 'New Jersey', 120.4, 132.1, 102.8, 109.7, 115.2, 1.4, 10.75, 6.625, 2.49),
            ('NM', 'New Mexico', 93.4, 88.0, 93.3, 96.9, 95.0, 1.7, 5.9, 5.125, 0.80),
            ('NY', 'New York', 139.1, 201.8, 103.8, 108.5, 115.3, 4.0, 8.82, 4.0, 1.69),
            ('NC', 'North Carolina', 94.2, 89.8, 103.1, 96.7, 95.2, 5.25, 5.25, 4.75, 0.84),
            ('ND', 'North Dakota', 89.9, 88.5, 95.9, 95.1, 84.3, 1.1, 2.9, 5.0, 0.98),
            ('OH', 'Ohio', 89.8, 78.7, 96.2, 94.6, 94.3, 0.0, 4.797, 5.75, 1.68),
            ('OK', 'Oklahoma', 85.8, 73.1, 94.9, 90.4, 91.4, 0.25, 5.0, 4.5, 0.90),
            ('OR', 'Oregon', 113.1, 148.9, 104.6, 108.1, 107.0, 4.75, 9.9, 0.0, 0.87),
            ('PA', 'Pennsylvania', 96.1, 88.6, 110.1, 100.3, 99.0, 3.07, 3.07, 6.0, 1.58),
            ('RI', 'Rhode Island', 119.4, 142.5, 120.2, 108.7, 110.6, 3.75, 5.99, 7.0, 1.53),
            ('SC', 'South Carolina', 95.9, 95.0, 103.9, 94.6, 96.0, 0.0, 7.0, 6.0, 0.57),
            ('SD', 'South Dakota', 89.0, 85.9, 97.6, 89.5, 87.4, 0.0, 0.0, 4.5, 1.31),
            ('TN', 'Tennessee', 89.0, 83.8, 95.2, 90.7, 92.9, 0.0, 0.0, 7.0, 0.64),
            ('TX', 'Texas', 91.5, 84.3, 99.1, 90.7, 96.7, 0.0, 0.0, 6.25, 1.86),
            ('UT', 'Utah', 102.9, 116.6, 91.4, 99.8, 96.8, 5.0, 5.0, 6.1, 0.58),
            ('VT', 'Vermont', 113.3, 129.5, 114.9, 109.1, 109.9, 3.35, 8.75, 6.0, 1.90),
            ('VA', 'Virginia', 103.7, 111.8, 103.2, 100.2, 103.0, 2.0, 5.75, 5.65, 0.81),
            ('WA', 'Washington', 118.7, 164.9, 93.6, 101.5, 106.6, 0.0, 0.0, 6.5, 0.92),
            ('WV', 'West Virginia', 90.5, 73.5, 103.7, 96.3, 93.3, 3.0, 6.5, 6.5, 0.59),
            ('WI', 'Wisconsin', 96.9, 89.1, 99.7, 102.1, 99.1, 3.54, 7.65, 5.0, 1.85),
            ('WY', 'Wyoming', 91.6, 89.4, 95.5, 100.4, 84.9, 0.0, 0.0, 4.0, 0.62),
        ]

        created_count = 0
        updated_count = 0

        for state_code, state_name, col_index, housing_index, utilities_index, grocery_index, transport_index, tax_min, tax_max, sales_tax, property_tax in states_data:
            state_data, created = StateData.objects.update_or_create(
                state_code=state_code,
                defaults={
                    'state_name': state_name,
                    'cost_of_living_index': col_index,
                    'housing_index': housing_index,
                    'utilities_index': utilities_index,
                    'grocery_index': grocery_index,
                    'transportation_index': transport_index,
                    'state_income_tax_min': tax_min,
                    'state_income_tax_max': tax_max,
                    'sales_tax_rate': sales_tax,
                    'property_tax_rate': property_tax,
                    'data_source': 'Management Command - All 50 States'
                }
            )

            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created {state_name} ({state_code})')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated {state_name} ({state_code})')
                )

        self.stdout.write(
            self.style.SUCCESS(f'\nCompleted! Created {created_count} states, updated {updated_count} states.')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Total states in database: {StateData.objects.count()}')
        )
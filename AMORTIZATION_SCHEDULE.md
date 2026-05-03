# Amortization Schedule Feature

## Overview

The amortization schedule feature allows users to view a detailed month-by-month payment breakdown for any selected financing offer on their solar quote. This provides transparency into how their loan payments will be distributed between principal and interest over time.

## Features

- **Interactive Offer Selection**: Click "View Amortization Schedule" on any financing offer to expand the detailed payment breakdown
- **Flexible Display**: Switch between viewing the first 12 months (summary) or the complete payment schedule for the entire loan term (5, 10, or 15 years)
- **Detailed Breakdown**: Each month shows:
  - Month number (1-60, 1-120, or 1-180)
  - Payment date (automatically calculated from start date)
  - Principal payment (amount reducing the loan balance)
  - Interest payment (cost of borrowing)
  - Total monthly payment (constant across all months)
  - Remaining balance (declining to zero at loan end)
- **Summary Statistics**: Quick view of:
  - Total interest cost
  - Total amount paid
  - Interest savings comparison (for longer terms)

## Technical Implementation

### Files Created

#### 1. `src/utils/amortization.ts`
Core utility functions for amortization calculations:
- `calculateAmortizationSchedule()`: Generates detailed month-by-month breakdown
- `formatCurrency()`: Formats numbers as USD currency
- `formatDate()`: Formats dates for display

**Key Types:**
```typescript
export interface AmortizationMonth {
  month: number;
  paymentDate: string;
  principalPayment: number;
  interestPayment: number;
  totalPayment: number;
  remainingBalance: number;
}

export interface AmortizationSchedule {
  principal: number;
  apr: number;
  termYears: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  months: AmortizationMonth[];
}
```

#### 2. `src/components/AmortizationSchedule.tsx`
React component for displaying the amortization schedule:
- Client-side component using React hooks
- Uses `useMemo` for efficient recalculation
- Responsive design with alternating row colors
- Scrollable table for mobile devices
- Shows first 12 months by default, expands to full schedule on demand

#### 3. `src/components/QuoteDetails.tsx`
Updated to include amortization schedule integration:
- Added state management for offer selection (`selectedOfferIndex`, `showFullSchedule`)
- Interactive buttons to toggle schedule display
- Conditional rendering of AmortizationSchedule component

#### 4. `tests/unit/amortization.test.ts`
Comprehensive test suite with 6 test cases:
- Correct schedule calculation for standard terms
- Zero interest rate handling
- Different APR values and terms
- Consistent monthly payments
- Decreasing interest/increasing principal pattern

### Calculation Method

The amortization schedule uses the standard loan amortization formula:

For each month:
1. **Interest Payment** = Remaining Balance × Monthly Interest Rate
2. **Principal Payment** = Monthly Payment - Interest Payment
3. **New Remaining Balance** = Previous Balance - Principal Payment

Where:
- Monthly Interest Rate = Annual APR ÷ 100 ÷ 12
- Monthly Payment is pre-calculated using the standard amortization formula

## User Experience

### On Quote Details Page

1. User views their solar quote with three financing options (5, 10, 15-year terms)
2. Each offer card displays:
   - Term length
   - APR
   - Monthly payment
   - Number of payments
   - "View Amortization Schedule" button
3. Clicking the button:
   - Expands the offer card
   - Shows 12-month preview of the schedule
   - Displays "Show All Payments" link to view complete schedule
4. Clicking "Show All Payments":
   - Expands table to show all months (60, 120, or 180 depending on term)
5. Clicking button again collapses the schedule

### Data Visualization

The table uses:
- Clear column headers (Month, Payment Date, Principal, Interest, Total Payment, Balance)
- Alternating row colors for readability
- Right-aligned numbers for easy scanning
- Responsive overflow-x for mobile devices
- Color-coded header (green background) to match brand

## Integration Points

The amortization schedule is integrated into the existing quote details flow:

```
Quote Details Page
├── Quote Summary
├── Pricing Information
├── Financing Options (with View Schedule buttons)
├── Total Cost by Term
└── Amortization Schedule (when offer selected)
```

## Testing

Run unit tests:
```bash
npm run test -- tests/unit/amortization.test.ts
```

All tests should pass with 100% coverage of calculation logic.

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

- Uses `useMemo` hook to prevent unnecessary recalculations
- Efficient array slicing for displaying first 12 months
- No external dependencies (calculations performed client-side)
- Suitable for loans up to 30+ years (common use case: 5-15 years)

## Future Enhancements

1. **PDF Export**: Download amortization schedule as PDF
2. **Schedule Visualization**: Chart showing principal vs. interest over time
3. **Scenario Comparison**: Compare schedules for multiple terms side-by-side
4. **Early Payoff Calculation**: Show impact of extra payments
5. **Monthly Payment Adjustment**: Recalculate schedule for different down payments
6. **Email Schedule**: Send schedule via email

## Validation & Edge Cases

The implementation handles:
- ✅ Zero interest rates (0% APR)
- ✅ Very small principals (< $100)
- ✅ Very large principals (> $1M)
- ✅ All standard loan terms (1-30 years)
- ✅ Rounding errors (ensures balance reaches exactly $0)
- ✅ Floating-point precision issues

## Accessibility

- Semantic HTML table structure
- Proper heading hierarchy
- Clear, descriptive column labels
- High contrast text colors
- Responsive design for all screen sizes
- Keyboard navigable (buttons and links)

## Security

- All calculations performed client-side (no sensitive data sent to server)
- No external API calls
- Input validation on Offer data type
- XSS-safe with React's built-in escaping

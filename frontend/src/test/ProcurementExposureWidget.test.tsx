import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProcurementExposureWidget } from '../components/exposure/ProcurementExposureWidget';
import { ExposureSummary } from '../types/api';

describe('ProcurementExposureWidget Component', () => {
  it('renders exposure energy metrics and compliance disclaimer', () => {
    const mockExposure: ExposureSummary = {
      overforecast_energy_mwh: 1250.5,
      underforecast_energy_mwh: 450.0,
      net_energy_variance_mwh: 800.5,
      max_single_period_overforecast_mw: 320.0,
      max_single_period_underforecast_mw: 95.0,
      dominant_risk_category: 'NET_SHORT_EXPOSURE',
      risk_explanation: 'Portfolio was left net short of power requiring balancing purchases.',
      disclaimer: 'Illustrative wind forecast exposure only. Does not claim to know utility actual customer demand.'
    };

    render(<ProcurementExposureWidget exposure={mockExposure} />);

    expect(screen.getByText('Day-Ahead Procurement Exposure Analysis')).toBeInTheDocument();
    expect(screen.getByText('+1,250.5')).toBeInTheDocument();
    expect(screen.getByText('-450')).toBeInTheDocument();
    expect(screen.getByText('+800.5')).toBeInTheDocument();
    expect(screen.getByText(/Net Short Position/i)).toBeInTheDocument();
    expect(screen.getByText(/Illustrative wind forecast exposure only/i)).toBeInTheDocument();
  });
});

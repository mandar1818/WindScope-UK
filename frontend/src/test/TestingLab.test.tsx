import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TestingLabPage } from '../pages/TestingLabPage';

describe('TestingLabPage Component', () => {
  it('renders testing lab heading and all 6 verification test scenarios', () => {
    render(<TestingLabPage />);

    expect(screen.getByText('Interactive Analytical Verification & Testing Lab')).toBeInTheDocument();
    expect(screen.getByText('Run All 6 Tests')).toBeInTheDocument();

    expect(screen.getByText(/TEST 1: Forecast Accuracy & Metric Verification/i)).toBeInTheDocument();
    expect(screen.getByText(/TEST 2: Overforecast & Physical Short Risk Detection/i)).toBeInTheDocument();
    expect(screen.getByText(/TEST 3: Underforecast & Physical Long Risk Detection/i)).toBeInTheDocument();
    expect(screen.getByText(/TEST 4: Publication Cutoff & Look-Ahead Bias Prevention/i)).toBeInTheDocument();
    expect(screen.getByText(/TEST 5: Missing Data & Zero-Generation Integrity/i)).toBeInTheDocument();
    expect(screen.getByText(/TEST 6: Data Explorer Contract & CSV Export Validation/i)).toBeInTheDocument();
  });
});

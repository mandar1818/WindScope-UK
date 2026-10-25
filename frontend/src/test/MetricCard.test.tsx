import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MetricCard } from '../components/common/MetricCard';

describe('MetricCard Component', () => {
  it('renders numeric values formatted with unit', () => {
    render(
      <MetricCard
        title="Mean Absolute Error"
        value={1250.45}
        unit="MW"
        precision={1}
      />
    );

    expect(screen.getByText('Mean Absolute Error')).toBeInTheDocument();
    expect(screen.getByText('1,250.5')).toBeInTheDocument();
    expect(screen.getByText('MW')).toBeInTheDocument();
  });

  it('renders + sign prefix when signPrefix is true and value > 0', () => {
    render(
      <MetricCard
        title="Forecast Bias"
        value={120.0}
        unit="MW"
        signPrefix={true}
      />
    );

    expect(screen.getByText('+120.0')).toBeInTheDocument();
  });

  it('handles null and undefined values safely without crashing', () => {
    render(
      <MetricCard
        title="WAPE Volume Error"
        value={null}
        unit="%"
      />
    );

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});


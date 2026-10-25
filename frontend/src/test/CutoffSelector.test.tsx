import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CutoffSelector } from '../components/common/CutoffSelector';

describe('CutoffSelector Component', () => {
  it('renders standard cutoffs and triggers onChange on selection', () => {
    const handleChange = vi.fn();
    render(
      <CutoffSelector
        selectedCutoff="day_ahead_1100"
        onChange={handleChange}
      />
    );

    expect(screen.getByText('DA 11:00')).toBeInTheDocument();
    expect(screen.getByText('DA 12:00')).toBeInTheDocument();
    expect(screen.getByText('Gate Closure (-1h)')).toBeInTheDocument();

    const da12Btn = screen.getByText('DA 12:00');
    fireEvent.click(da12Btn);

    expect(handleChange).toHaveBeenCalledWith('day_ahead_1200');
  });
});


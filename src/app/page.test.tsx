import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import HomePage from '@/app/page';

describe('HomePage', () => {
  it('renders the hero and festival search', async () => {
    const element = await HomePage({ searchParams: Promise.resolve({}) });
    render(element);
    expect(
      screen.getByRole('heading', { name: /Aotearoa's festivals, one season at a time/ })
    ).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search festivals' })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const element = await HomePage({ searchParams: Promise.resolve({}) });
    const { container } = render(element);
    expect(await axe(container)).toHaveNoViolations();
  });
});

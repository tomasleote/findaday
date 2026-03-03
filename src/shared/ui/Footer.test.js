import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Footer } from './Footer';

describe('Footer', () => {
    it('renders the FAD logo correctly', () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );
        expect(screen.getByText((content, element) => element.tagName === 'H3' && element.textContent === 'FindADate')).toBeInTheDocument();
    });

    it('renders all resource links', () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );
        // Links
        expect(screen.getByText('Documentation')).toBeInTheDocument();
        expect(screen.getByText('GitHub Repository')).toBeInTheDocument();
    });

    it('renders all contact links', () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );
        // Mail
        expect(screen.getByText('hello@findadate.app')).toBeInTheDocument();
    });

    it('renders legal links', () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );
        expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
        expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    });

    it('renders the current year in copyright', () => {
        const currentYear = new Date().getFullYear();
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );
        expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
    });

    it('still renders anchors correctly without callbacks', () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );
        expect(screen.getByText('Documentation').closest('a')).toHaveAttribute('href', '/docs');
        expect(screen.getByText('Privacy Policy').closest('a')).toHaveAttribute('href', '/privacy');
        expect(screen.getByText('Terms of Service').closest('a')).toHaveAttribute('href', '/terms');
    });
});

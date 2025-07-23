import { render, screen } from '@testing-library/react';
import App from './App';

test('renders fitness tracker app', () => {
  render(<App />);
  const titleElement = screen.getByText(/Fitness Tracker/i);
  expect(titleElement).toBeInTheDocument();
});

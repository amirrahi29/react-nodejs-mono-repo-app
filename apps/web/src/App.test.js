import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

test('renders health payload from the API', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      status: 'ok',
      env: 'uat',
      version: 'build-123',
    }),
  });

  render(<App />);

  expect(screen.getByText('API Health')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText(/"env": "uat"/)).toBeInTheDocument();
  });
});

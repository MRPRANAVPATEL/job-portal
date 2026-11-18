import {render,screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import Main from './components/Main';
test('home links to the public jobs list and employer registration', () => {
  render(<MemoryRouter><Main /></MemoryRouter>);
  expect(screen.getByRole('link',{name:/explore open jobs/i})).toHaveAttribute('href','/jobs');
  expect(screen.getByRole('link',{name:/register your company/i})).toHaveAttribute('href','/companyregister');
});

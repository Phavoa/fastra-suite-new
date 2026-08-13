import { render, screen } from '@testing-library/react';
import PlantEquipmentRequestPage from '../plant-equipment-request/page';
import { useGetPlantEquipmentRequestsQuery } from '@/api/requests/plantEquipmentRequestApi';
import { useGetProjectCostingProjectsQuery } from '@/api/projectCostingApi';
import { usePermission } from '@/hooks/usePermission';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn().mockReturnValue('/project-request/plant-equipment-request'),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/components/shared/TopBar/reusableTopBar', () => ({
  NavBar: () => <div data-testid="navbar">NavBar</div>,
}));

jest.mock('@/api/requests/plantEquipmentRequestApi', () => ({
  useGetPlantEquipmentRequestsQuery: jest.fn(),
}));

jest.mock('@/api/projectCostingApi', () => ({
  useGetProjectCostingProjectsQuery: jest.fn(),
}));

jest.mock('@/hooks/usePermission', () => ({
  usePermission: jest.fn(),
}));

describe('PlantEquipmentRequestPage Integration', () => {
  const mockRouter = { push: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useGetProjectCostingProjectsQuery as jest.Mock).mockReturnValue({
      data: [{ id: 1, name: 'Project Epsilon' }],
    });
    (useGetPlantEquipmentRequestsQuery as jest.Mock).mockReturnValue({
      data: [
        {
          id: 1,
          reference_id: 'PE001',
          project_details: { name: 'Project Epsilon' },
          project_request: { status: 'draft' },
          equipment_name: 'Excavator',
          quantity: 2,
        },
      ],
      isLoading: false,
    });
  });

  it('renders the dashboard with New Request button if user has create entitlement', () => {
    (usePermission as jest.Mock).mockReturnValue({
      can: jest.fn().mockImplementation((params) => {
        return params.module === 'project_request' && params.entitlement === 'create';
      }),
      isAdmin: false,
      isLoading: false,
    });

    render(<PlantEquipmentRequestPage />);

    expect(screen.getByText('Plant & Equipment Request')).toBeInTheDocument();
    expect(screen.getByText('Project Epsilon')).toBeInTheDocument();
    expect(screen.getByText('Excavator')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /New Plant & Equipment Request/i })).toBeInTheDocument();
  });

  it('hides the New Request button if user lacks create entitlement', () => {
    (usePermission as jest.Mock).mockReturnValue({
      can: jest.fn().mockReturnValue(false),
      isAdmin: false,
      isLoading: false,
    });

    render(<PlantEquipmentRequestPage />);

    expect(screen.getByText('Plant & Equipment Request')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /New Plant & Equipment Request/i })).not.toBeInTheDocument();
  });
});

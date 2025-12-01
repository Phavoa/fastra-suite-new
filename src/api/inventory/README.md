# Location API Usage Guide

This guide demonstrates how to use the `locationApi` Redux slice for managing location data in your inventory system.

## Overview

The `locationApi` provides a complete set of RTK Query endpoints for CRUD operations and specialized queries on location data. It follows the same patterns as other API slices in the project.

## Available Hooks

### Query Hooks (GET requests)

```typescript
// Get all locations with optional search/filter parameters
const { data: locations, isLoading, error } = useGetLocationsQuery({
  search: 'warehouse',
  location_type: 'internal',
  location_manager__user_id: 123
});

// Get a specific location by ID
const { data: location, isLoading } = useGetLocationQuery('location-id-123');

// Get stock levels for a specific location
const { data: stockLevels } = useGetLocationStockLevelsQuery('location-id-123');

// Get all active locations
const { data: activeLocations } = useGetActiveLocationsQuery();

// Get locations assigned to the current user
const { data: userLocations } = useGetAllUserLocationsQuery();

// Get locations the current user doesn't have access to
const { data: otherLocations } = useGetOtherLocationsForUserQuery();

// Get locations managed by the current user
const { data: managedLocations } = useGetUserManagedLocationsQuery();

// Get locations where current user is store keeper
const { data: storeLocations } = useGetUserStoreLocationsQuery();

// Get filtered active locations
const { data: filteredActiveLocations } = useGetActiveLocationsFilteredQuery();

// Get hidden locations
const { data: hiddenLocations } = useGetHiddenLocationsQuery();
```

### Mutation Hooks (POST/PUT/PATCH/DELETE requests)

```typescript
const [
  createLocation,
  { isLoading: isCreating, data: newLocation }
] = useCreateLocationMutation();

const [
  updateLocation,
  { isLoading: isUpdating }
] = useUpdateLocationMutation();

const [
  patchLocation,
  { isLoading: isPatching }
] = usePatchLocationMutation();

const [
  deleteLocation,
  { isLoading: isDeleting }
] = useDeleteLocationMutation();

const [
  toggleHiddenStatus,
  { isLoading: isToggling }
] = useToggleLocationHiddenStatusMutation();
```

## Usage Examples

### Creating a New Location

```typescript
import { useCreateLocationMutation } from '../../api/inventory/locationApi';
import type { CreateLocationRequest } from '../../types/location';

function CreateLocationForm() {
  const [createLocation, { isLoading }] = useCreateLocationMutation();

  const handleSubmit = async (formData: CreateLocationRequest) => {
    try {
      const result = await createLocation(formData).unwrap();
      console.log('Location created:', result);
      // Handle success (redirect, show notification, etc.)
    } catch (error) {
      console.error('Failed to create location:', error);
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Searching and Filtering Locations

```typescript
import { useGetLocationsQuery } from '../../api/inventory/locationApi';

function LocationsList() {
  const [searchParams, setSearchParams] = useState({
    search: '',
    location_type: undefined as 'internal' | 'partner' | undefined
  });

  const { data: locations, isLoading, error } = useGetLocationsQuery(searchParams);

  return (
    <div>
      <SearchBar 
        onSearchChange={(search) => setSearchParams(prev => ({ ...prev, search }))}
        onTypeChange={(type) => setSearchParams(prev => ({ ...prev, location_type: type }))}
      />
      
      {isLoading && <div>Loading locations...</div>}
      {error && <div>Error loading locations</div>}
      
      <ul>
        {locations?.map(location => (
          <li key={location.id}>
            {location.location_name} - {location.location_type}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Updating a Location

```typescript
import { useUpdateLocationMutation } from '../../api/inventory/locationApi';
import type { UpdateLocationRequest } from '../../types/location';

function EditLocationForm({ locationId, initialData }: { locationId: string, initialData: UpdateLocationRequest }) {
  const [updateLocation, { isLoading }] = useUpdateLocationMutation();

  const handleUpdate = async (updatedData: UpdateLocationRequest) => {
    try {
      await updateLocation({ 
        id: locationId, 
        data: updatedData 
      }).unwrap();
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleUpdate}>
      {/* Form fields */}
    </form>
  );
}
```

### Partial Updates with PATCH

```typescript
import { usePatchLocationMutation } from '../../api/inventory/locationApi';
import type { PatchLocationRequest } from '../../types/location';

function ToggleLocationVisibility({ locationId, isHidden }: { locationId: string, isHidden: boolean }) {
  const [patchLocation, { isLoading }] = usePatchLocationMutation();

  const handleToggleVisibility = async () => {
    try {
      await patchLocation({
        id: locationId,
        data: { is_hidden: !isHidden }
      }).unwrap();
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <button 
      onClick={handleToggleVisibility} 
      disabled={isLoading}
    >
      {isHidden ? 'Show' : 'Hide'} Location
    </button>
  );
}
```

### Deleting a Location

```typescript
import { useDeleteLocationMutation } from '../../api/inventory/locationApi';

function LocationCard({ location }: { location: Location }) {
  const [deleteLocation, { isLoading }] = useDeleteLocationMutation();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this location?')) {
      try {
        await deleteLocation(location.id).unwrap();
        // Handle success (remove from local state, show notification, etc.)
      } catch (error) {
        // Handle error
      }
    }
  };

  return (
    <div>
      <h3>{location.location_name}</h3>
      <button onClick={handleDelete} disabled={isLoading}>
        Delete
      </button>
    </div>
  );
}
```

### User-Specific Location Queries

```typescript
import { 
  useGetUserManagedLocationsQuery,
  useGetUserStoreLocationsQuery,
  useGetAllUserLocationsQuery 
} from '../../api/inventory/locationApi';

function UserLocationDashboard() {
  const { data: managedLocations } = useGetUserManagedLocationsQuery();
  const { data: storeLocations } = useGetUserStoreLocationsQuery();
  const { data: allUserLocations } = useGetAllUserLocationsQuery();

  return (
    <div>
      <h2>My Managed Locations ({managedLocations?.length || 0})</h2>
      <ul>
        {managedLocations?.map(location => (
          <li key={location.id}>{location.location_name}</li>
        ))}
      </ul>

      <h2>Store Locations ({storeLocations?.length || 0})</h2>
      <ul>
        {storeLocations?.map(location => (
          <li key={location.id}>{location.location_name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Type Safety

All hooks are fully typed with TypeScript. The API expects and returns properly typed objects:

```typescript
import type { 
  Location, 
  CreateLocationRequest, 
  UpdateLocationRequest,
  PatchLocationRequest,
  LocationType 
} from '../../types/location';

// These will be properly typed in your IDE
const locationData: Location = {
  id: "123",
  location_code: "WH001",
  location_name: "Main Warehouse",
  location_type: "internal",
  address: "123 Warehouse St",
  location_manager: 1,
  location_manager_details: { /* ... */ },
  store_keeper: 2,
  store_keeper_details: { /* ... */ },
  contact_information: "warehouse@example.com",
  is_hidden: false
};

const createData: CreateLocationRequest = {
  location_code: "WH002",
  location_name: "Secondary Warehouse",
  location_type: "internal",
  address: "456 Backup Ave",
  location_manager: 1,
  store_keeper: 2,
  contact_information: "backup@example.com",
  is_hidden: false
};
```

## Error Handling

RTK Query provides built-in error handling. You can access error information from the query state:

```typescript
const { data, error, isError } = useGetLocationsQuery(params);

if (isError) {
  console.error('API Error:', error);
  // error.status contains the HTTP status code
  // error.data contains the response data
}
```

## Loading States

Each hook provides loading states that you can use in your UI:

```typescript
const { 
  data, 
  isLoading,        // Initial loading
  isFetching,       // Background refetching
  isError,          // Error state
  isSuccess,        // Success state
  error 
} = useGetLocationsQuery(params);
```

## Integration with Redux Store

The locationApi is automatically integrated into your Redux store and provides:

1. **Automatic caching** - Query results are cached and reused
2. **Background refetching** - Data is refreshed in the background when conditions change
3. **Optimistic updates** - Mutations can be optimistic for better UX
4. **Polling** - Automatic data refreshing at intervals
5. **Invalidation** - Automatic cache invalidation when data changes

The locationApi is available throughout your React application via the generated hooks.
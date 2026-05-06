import { db, SyncQueueItem, SyncOperation, generateLocalId, LocalLabourRequest } from './labourRequestDb';
import {
  labourRequestApi,
  CreateLabourRequestRequest,
  UpdateLabourRequestRequest,
  LabourRequest
} from '../../api/requests/labourRequestApi';

class SyncService {
  private isOnline = false;
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.checkNetworkStatus();
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.startBackgroundSync();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.stopBackgroundSync();
    });
  }

  private checkNetworkStatus() {
    this.isOnline = navigator.onLine;
  }

  private startBackgroundSync() {
    if (this.syncInterval) return;

    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.performSync();
      }
    }, 30000);

    // Also sync immediately
    this.performSync();
  }

  private stopBackgroundSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async performSync(): Promise<void> {
    if (this.isSyncing || !this.isOnline) return;

    this.isSyncing = true;
    console.log('Starting offline sync...');

    try {
      const queueItems = await db.getUnsyncedQueueItems();

      for (const item of queueItems) {
        try {
          await this.processQueueItem(item);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          await db.updateQueueItemStatus(item.id!, 'failed', (error as Error).message);
        }
      }

      // Clean up completed items
      await db.cleanupCompletedQueueItems();

      console.log('Offline sync completed');
    } catch (error) {
      console.error('Sync process failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async processQueueItem(item: SyncQueueItem): Promise<void> {
    await db.updateQueueItemStatus(item.id!, 'processing');

    switch (item.operation) {
      case 'create':
        await this.syncCreateRequest(item);
        break;
      case 'update':
        await this.syncUpdateRequest(item);
        break;
      case 'delete':
        await this.syncDeleteRequest(item);
        break;
      case 'submit':
        await this.syncSubmitRequest(item);
        break;
      case 'approve':
        await this.syncApproveRequest(item);
        break;
      case 'reject':
        await this.syncRejectRequest(item);
        break;
      case 'cancel':
        await this.syncCancelRequest(item);
        break;
      default:
        throw new Error(`Unknown operation: ${item.operation}`);
    }

    await db.updateQueueItemStatus(item.id!, 'completed');
  }

  private async syncCreateRequest(item: SyncQueueItem): Promise<void> {
    const createData = item.data as CreateLabourRequestRequest;

    // Make API call to create the request
    const response = await fetch(this.buildApiUrl('/project-requests/labour-requests/'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(createData),
    });

    if (!response.ok) {
      throw new Error(`Create failed: ${response.statusText}`);
    }

    const serverData: LabourRequest = await response.json();

    // Update local data with server response
    if (item.labourRequestId) {
      const localRequest = await db.labourRequests.get(item.labourRequestId.toString());
      if (localRequest) {
        await db.updateRequestFromServer(localRequest.localId, serverData);
      }
    }
  }

  private async syncUpdateRequest(item: SyncQueueItem): Promise<void> {
    if (!item.labourRequestId) return;

    const updateData = item.data as UpdateLabourRequestRequest;

    const response = await fetch(this.buildApiUrl(`/project-requests/labour-requests/${item.labourRequestId}/`), {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`Update failed: ${response.statusText}`);
    }

    const serverData: LabourRequest = await response.json();

    // Update local data
    const localRequest = await db.labourRequests.where('id').equals(item.labourRequestId).first();
    if (localRequest) {
      await db.updateRequestFromServer(localRequest.localId, serverData);
    }
  }

  private async syncDeleteRequest(item: SyncQueueItem): Promise<void> {
    if (!item.labourRequestId) return;

    const response = await fetch(this.buildApiUrl(`/project-requests/labour-requests/${item.labourRequestId}/`), {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok && response.status !== 404) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }

    // Remove from local database
    await db.labourRequests.where('id').equals(item.labourRequestId).delete();
  }

  private async syncCancelRequest(item: SyncQueueItem): Promise<void> {
    if (!item.labourRequestId) return;

    const response = await fetch(this.buildApiUrl(`/project-requests/project-requests/${item.labourRequestId}/cancel/`), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(item.data || {}),
    });

    if (!response.ok) {
      throw new Error(`Cancel failed: ${response.statusText}`);
    }

    const serverData: LabourRequest = await response.json();

    // Update local data
    const localRequest = await db.labourRequests.where('id').equals(item.labourRequestId).first();
    if (localRequest) {
      await db.updateRequestFromServer(localRequest.localId, serverData);
    }
  }

  private async syncApproveRequest(item: SyncQueueItem): Promise<void> {
    if (!item.labourRequestId) return;

    const response = await fetch(this.buildApiUrl(`/project-requests/project-requests/${item.labourRequestId}/approve/`), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(item.data || {}),
    });

    if (!response.ok) {
      throw new Error(`Approve failed: ${response.statusText}`);
    }

    const serverData: LabourRequest = await response.json();

    // Update local data
    const localRequest = await db.labourRequests.where('id').equals(item.labourRequestId).first();
    if (localRequest) {
      await db.updateRequestFromServer(localRequest.localId, serverData);
    }
  }

  private async syncRejectRequest(item: SyncQueueItem): Promise<void> {
    if (!item.labourRequestId) return;

    const response = await fetch(this.buildApiUrl(`/project-requests/project-requests/${item.labourRequestId}/reject/`), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(item.data || {}),
    });

    if (!response.ok) {
      throw new Error(`Reject failed: ${response.statusText}`);
    }

    const serverData: LabourRequest = await response.json();

    // Update local data
    const localRequest = await db.labourRequests.where('id').equals(item.labourRequestId).first();
    if (localRequest) {
      await db.updateRequestFromServer(localRequest.localId, serverData);
    }
  }

  private async syncSubmitRequest(item: SyncQueueItem): Promise<void> {
    if (!item.labourRequestId) return;

    const response = await fetch(this.buildApiUrl(`/project-requests/project-requests/${item.labourRequestId}/submit/`), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(item.data || {}),
    });

    if (!response.ok) {
      throw new Error(`Submit failed: ${response.statusText}`);
    }

    const serverData: LabourRequest = await response.json();

    // Update local data
    const localRequest = await db.labourRequests.where('id').equals(item.labourRequestId).first();
    if (localRequest) {
      await db.updateRequestFromServer(localRequest.localId, serverData);
    }
  }

  private buildApiUrl(endpoint: string): string {
    // Get tenant from localStorage or Redux store
    const tenant = localStorage.getItem('tenant_schema_name') || 'default';
    const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN || "fastrasuiteapi.com.ng";
    return `https://${tenant}.${apiDomain}${endpoint}`;
  }

  private getHeaders(): Headers {
    const headers = new Headers();
    headers.set('content-type', 'application/json');

    // Get token from localStorage
    const token = localStorage.getItem('access_token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // Public methods for manual operations
  async createRequestOffline(data: CreateLabourRequestRequest): Promise<LocalLabourRequest> {
    const localId = generateLocalId();
    const localRequest: LocalLabourRequest = {
      localId,
      id: 0, // Will be set when synced
      reference_id: `LOCAL-${localId.slice(-8)}`,
      request_type: 'labour',
      module_destination: 'labour',
      status: 'draft',
      created_by: 0, // Will be set from auth
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      detail: {
        id: 0,
        date_required: data.date_required,
        number_of_workers: data.number_of_workers,
        role_type: data.role_type,
        duration: data.duration,
        duration_unit: data.duration_unit,
        estimated_daily_rate: data.estimated_daily_rate,
        projected_cost: (data.number_of_workers * parseFloat(data.estimated_daily_rate)).toString(),
        justification_notes: data.justification_notes || '',
      },
      project_request: {
        id: 0,
        reference_id: `LOCAL-${localId.slice(-8)}`,
        request_type: 'labour',
        status: 'draft',
        module_destination: 'labour',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        project: data.project,
        created_by: 0,
      },
      isSynced: false,
      needsSync: true,
    };

    await db.labourRequests.add(localRequest);
    await db.addToSyncQueue('create', data, undefined);

    return localRequest;
  }

  async updateRequestOffline(id: number, data: UpdateLabourRequestRequest): Promise<void> {
    // Update local data
    const existing = await db.labourRequests.where('id').equals(id).first();
    if (existing) {
      await db.labourRequests.update(existing.localId, {
        ...data,
        needsSync: true,
        updated_at: new Date().toISOString(),
      });
    }

    await db.addToSyncQueue('update', data, id);
  }

  async deleteRequestOffline(id: number): Promise<void> {
    // Mark for deletion locally
    const existing = await db.labourRequests.where('id').equals(id).first();
    if (existing) {
      await db.labourRequests.update(existing.localId, {
        needsSync: true,
        // Could add a deleted flag
      });
    }

    await db.addToSyncQueue('delete', {}, id);
  }

  async submitRequestOffline(id: number): Promise<void> {
    const existing = await db.labourRequests.where('id').equals(id).first();
    if (existing) {
      await db.labourRequests.update(existing.localId, {
        project_request: {
          ...existing.project_request,
          status: 'pending',
        },
        needsSync: true,
        updated_at: new Date().toISOString(),
      });
    }

    await db.addToSyncQueue('submit', {}, id);
  }

  async approveRequestOffline(id: number, data: any): Promise<void> {
    const existing = await db.labourRequests.where('id').equals(id).first();
    if (existing) {
      await db.labourRequests.update(existing.localId, {
        project_request: {
          ...existing.project_request,
          status: 'approved',
        },
        needsSync: true,
        updated_at: new Date().toISOString(),
      });
    }

    await db.addToSyncQueue('approve', data, id);
  }

  async rejectRequestOffline(id: number, data: any): Promise<void> {
    const existing = await db.labourRequests.where('id').equals(id).first();
    if (existing) {
      await db.labourRequests.update(existing.localId, {
        project_request: {
          ...existing.project_request,
          status: 'rejected',
        },
        needsSync: true,
        updated_at: new Date().toISOString(),
      });
    }

    await db.addToSyncQueue('reject', data, id);
  }

  async cancelRequestOffline(id: number, data: any): Promise<void> {
    const existing = await db.labourRequests.where('id').equals(id).first();
    if (existing) {
      await db.labourRequests.update(existing.localId, {
        project_request: {
          ...existing.project_request,
          status: 'cancelled',
        },
        needsSync: true,
        updated_at: new Date().toISOString(),
      });
    }

    await db.addToSyncQueue('cancel', data, id);
  }

  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
    };
  }
}

// Export singleton instance
export const syncService = new SyncService();
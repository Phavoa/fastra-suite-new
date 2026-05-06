import Dexie, { Table } from "dexie";
import {
  LabourRequest,
  CreateLabourRequestRequest,
  UpdateLabourRequestRequest,
} from "../api/requests/labourRequestApi";

// Sync operation types
export type SyncOperation =
  | "create"
  | "update"
  | "delete"
  | "submit"
  | "approve"
  | "reject"
  | "cancel";

export interface SyncQueueItem {
  id?: number;
  operation: SyncOperation;
  labourRequestId?: number; // For updates, deletes, etc.
  data?: CreateLabourRequestRequest | UpdateLabourRequestRequest | any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  status: "pending" | "processing" | "failed" | "completed";
  error?: string;
}

// Local labour request with additional metadata
export interface LocalLabourRequest extends Omit<
  LabourRequest,
  "project_request"
> {
  localId: string;
  isSynced: boolean;
  lastSyncedAt?: Date;
  needsSync: boolean;
  project_request: {
    id: number;
    reference_id: string;
    request_type: string;
    status: "draft" | "pending" | "approved" | "rejected";
    module_destination: string;
    created_at: string;
    updated_at: string;
    project: number;
    created_by: number;
  };
}
interface Modification {
  updated_at: string;
}

export class LabourRequestDatabase extends Dexie {
  labourRequests!: Table<LocalLabourRequest>;
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super("LabourRequestDatabase");

    this.version(1).stores({
      labourRequests:
        "&localId, id, *project_request.status, created_at, updated_at, needsSync, isSynced",
      syncQueue:
        "++id, operation, labourRequestId, timestamp, retryCount, status, &localId",
    });

    // Add hooks for automatic timestamp updates
    this.labourRequests.hook("creating", (primKey, obj, trans) => {
      obj.created_at = obj.created_at || new Date().toISOString();
      obj.updated_at = obj.updated_at || new Date().toISOString();
    });

    this.labourRequests.hook(
      "updating",
      (modifications: Modification, primKey, obj, trans) => {
        modifications.updated_at = new Date().toISOString();
      },
    );
  }

  // Helper methods for labour requests
  async getPendingSyncRequests(): Promise<LocalLabourRequest[]> {
    return this.labourRequests.where("needsSync").equals(true).toArray();
  }

  async getUnsyncedQueueItems(): Promise<SyncQueueItem[]> {
    return this.syncQueue.where("status").anyOf("pending", "failed").toArray();
  }

  async markRequestAsSynced(localId: string, serverId: number): Promise<void> {
    await this.labourRequests.update(localId, {
      id: serverId,
      isSynced: true,
      needsSync: false,
      lastSyncedAt: new Date(),
    });
  }

  async updateRequestFromServer(
    localId: string,
    serverData: LabourRequest,
  ): Promise<void> {
    await this.labourRequests.update(localId, {
      ...serverData,
      localId,
      isSynced: true,
      needsSync: false,
      lastSyncedAt: new Date(),
    });
  }

  async addToSyncQueue(
    operation: SyncOperation,
    data: any,
    labourRequestId?: number,
  ): Promise<number> {
    const queueItem: Omit<SyncQueueItem, "id"> = {
      operation,
      labourRequestId,
      data,
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: 3,
      status: "pending",
    };

    return this.syncQueue.add(queueItem as SyncQueueItem);
  }

  async updateQueueItemStatus(
    queueId: number,
    status: SyncQueueItem["status"],
    error?: string,
  ): Promise<void> {
    const update: Partial<SyncQueueItem> = { status };
    if (error) update.error = error;
    if (status === "failed") {
      update.retryCount = (await this.syncQueue.get(queueId))!.retryCount + 1;
    }

    await this.syncQueue.update(queueId, update);
  }

  async cleanupCompletedQueueItems(): Promise<void> {
    await this.syncQueue.where("status").equals("completed").delete();
  }

  async getFailedQueueItems(): Promise<SyncQueueItem[]> {
    return this.syncQueue
      .where("status")
      .equals("failed")
      .and((item) => item.retryCount >= item.maxRetries)
      .toArray();
  }
}

// Create and export a singleton instance
export const db = new LabourRequestDatabase();

// Initialize the database
export const initDatabase = async (): Promise<void> => {
  try {
    await db.open();
    console.log("Labour Request Database initialized");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
};

// Helper function to generate local IDs
export const generateLocalId = (): string => {
  return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

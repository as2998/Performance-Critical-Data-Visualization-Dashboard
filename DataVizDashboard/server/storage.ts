// Storage interface for the performance dashboard
// Since this is a data visualization demo, we don't need persistent storage
// Data is generated on-demand and streamed to the frontend

export interface IStorage {
  // No persistent storage needed for this demo
}

export class MemStorage implements IStorage {
  constructor() {
    // No state needed
  }
}

export const storage = new MemStorage();

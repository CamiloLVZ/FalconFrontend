export type FlightGenerationStatus = "RUNNING" | "COMPLETED" | "FAILED";
export type FlightGenerationType = "GLOBAL" | "ROUTE" | "DAILY";

export interface FlightGeneration {
  generationId: number;
  status: FlightGenerationStatus;
  type: FlightGenerationType;
  routeId: number | null;
  totalGenerated: number | null;
  startedAt: string; // Instant → ISO string
  finishedAt: string | null;
  durationSeconds: number | null;
  statusUrl: string;
}

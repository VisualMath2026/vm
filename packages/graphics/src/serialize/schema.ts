export interface SceneSnapshotV1 {
  schemaVersion: 1;
  camera: {
    origin: { x: number; y: number };
    scale: number;
  };
  objects: unknown[];
}

export type AnySceneSnapshot = SceneSnapshotV1;

export function assertSnapshot(obj: unknown): asserts obj is AnySceneSnapshot {
  if (!obj || typeof obj !== "object") {
    throw new Error("snapshot: not an object");
  }

  if (!("schemaVersion" in obj) || (obj as { schemaVersion?: number }).schemaVersion !== 1) {
    throw new Error("snapshot: unsupported schemaVersion");
  }

  if (
    !("camera" in obj) ||
    typeof (obj as { camera?: { scale?: unknown } }).camera?.scale !== "number"
  ) {
    throw new Error("snapshot: invalid camera");
  }

  if (
    !("objects" in obj) ||
    !Array.isArray((obj as { objects?: unknown[] }).objects)
  ) {
    throw new Error("snapshot: objects must be array");
  }
}

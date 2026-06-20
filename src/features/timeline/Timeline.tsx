import type { CameraShot, UploadedImage } from "../../lib/projectTypes";

type TimelineProps = {
  image: UploadedImage | null;
  shots: CameraShot[];
  selectedShotId: string | null;
  onSelectShot: (shotId: string) => void;
  onMoveShot: (shotId: string, direction: "up" | "down") => void;
};

export function Timeline({
  image,
  shots,
  selectedShotId,
  onSelectShot,
  onMoveShot,
}: TimelineProps) {
  return (
    <section className="panel timeline-panel">
      <div className="panel-heading">
        <span className="panel-kicker">Sequence</span>
        <h2>Timeline</h2>
      </div>

      {!image ? (
        <div className="timeline-empty">
          <p>No timeline yet.</p>
          <span>Upload an image to create the first shot.</span>
        </div>
      ) : (
        <ol className="timeline-list" aria-label="Camera shot timeline">
          {shots.map((shot, index) => {
            const label = shot.label.trim() || `Shot ${index + 1}`;
            const isSelected = shot.id === selectedShotId;
            const canMoveUp = index > 0;
            const canMoveDown = index < shots.length - 1;

            return (
              <li key={shot.id}>
                <div
                  className={
                    isSelected ? "timeline-row is-selected" : "timeline-row"
                  }
                >
                  <button
                    className="timeline-item"
                    type="button"
                    aria-current={isSelected ? "true" : undefined}
                    onClick={() => onSelectShot(shot.id)}
                  >
                    <span className="timeline-index">{index + 1}</span>
                    <span className="timeline-main">
                      <strong>{label}</strong>
                      <small>{shot.id}</small>
                    </span>
                    <span className="timeline-duration">{shot.durationMs}ms</span>
                  </button>

                  <div className="timeline-reorder-controls">
                    <button
                      className="timeline-move-button"
                      type="button"
                      disabled={!canMoveUp}
                      aria-label={`Move ${label} up`}
                      onClick={() => onMoveShot(shot.id, "up")}
                    >
                      Up
                    </button>
                    <button
                      className="timeline-move-button"
                      type="button"
                      disabled={!canMoveDown}
                      aria-label={`Move ${label} down`}
                      onClick={() => onMoveShot(shot.id, "down")}
                    >
                      Down
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

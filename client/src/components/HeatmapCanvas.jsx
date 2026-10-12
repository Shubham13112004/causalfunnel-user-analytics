import React, { useState, useRef, useEffect } from 'react';
import { MousePointerClick } from 'lucide-react';
import { formatTimestamp } from '../utils/formatters';

/**
 * HeatmapCanvas renders click positions as colored dots on a scaled canvas.
 *
 * Coordinate system:
 * - Dots are placed using page-relative coordinates (page_x, page_y) when available,
 *   falling back to viewport coordinates (x, y).
 * - Positions are normalized against the maximum page dimensions recorded in the click data,
 *   then scaled to the canvas display size.
 * - This means a click at 50% of the page width always appears at 50% of the canvas width,
 *   regardless of screen size.
 *
 * Dot appearance:
 * - Size grows with the number of clicks at the same approximate position.
 * - Opacity reflects relative click frequency.
 */
export default function HeatmapCanvas({ clicks }) {
  const [tooltip, setTooltip] = useState(null);
  const containerRef = useRef(null);

  if (!clicks || clicks.length === 0) {
    return (
      <div className="empty-state" style={{ minHeight: 300 }}>
        <div className="empty-state-icon">
          <MousePointerClick size={24} />
        </div>
        <div className="empty-state-title">No clicks recorded</div>
        <div className="empty-state-desc">
          Interact with the demo page to generate click data for this URL.
        </div>
      </div>
    );
  }

  // Determine canvas dimensions from recorded page dimensions
  // Use the median to avoid single outliers skewing the scale
  const pageWidths = clicks.map((c) => c.page_width).filter(Boolean);
  const pageHeights = clicks.map((c) => c.page_height).filter(Boolean);

  const maxPageWidth = pageWidths.length > 0 ? Math.max(...pageWidths) : 1366;
  const maxPageHeight = pageHeights.length > 0 ? Math.max(...pageHeights) : 1800;

  // Group clicks by approximate position to show density
  const BUCKET_SIZE = 20; // pixels
  const bucketMap = {};
  clicks.forEach((click, idx) => {
    const cx = click.page_x !== undefined ? click.page_x : click.x;
    const cy = click.page_y !== undefined ? click.page_y : click.y;
    const bx = Math.floor(cx / BUCKET_SIZE);
    const by = Math.floor(cy / BUCKET_SIZE);
    const key = `${bx},${by}`;
    if (!bucketMap[key]) {
      bucketMap[key] = { count: 0, x: cx, y: cy, clicks: [] };
    }
    bucketMap[key].count += 1;
    bucketMap[key].clicks.push({ ...click, _idx: idx });
  });

  const buckets = Object.values(bucketMap);
  const maxCount = Math.max(...buckets.map((b) => b.count));

  // Canvas aspect ratio: scale to a reasonable display height
  const CANVAS_WIDTH = 100; // percentage
  const CANVAS_HEIGHT_PX = 480;

  // Color palette for the heatmap dots
  const getColor = (count, max) => {
    const ratio = count / max;
    if (ratio >= 0.8) return { fill: 'rgba(239,68,68,0.85)', border: '#dc2626' };
    if (ratio >= 0.5) return { fill: 'rgba(249,115,22,0.8)', border: '#ea580c' };
    if (ratio >= 0.2) return { fill: 'rgba(234,179,8,0.75)', border: '#ca8a04' };
    return { fill: 'rgba(79,70,229,0.7)', border: '#4f46e5' };
  };

  return (
    <div
      ref={containerRef}
      className="heatmap-canvas-wrapper"
      style={{ height: CANVAS_HEIGHT_PX }}
      onClick={() => setTooltip(null)}
    >
      {/* Grid lines for reference */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((pct) => (
          <React.Fragment key={pct}>
            <line x1={`${pct}%`} y1="0" x2={`${pct}%`} y2="100%" stroke="#64748b" strokeWidth="1" strokeDasharray="4 6" />
            <line x1="0" y1={`${pct}%`} x2="100%" y2={`${pct}%`} stroke="#64748b" strokeWidth="1" strokeDasharray="4 6" />
          </React.Fragment>
        ))}
      </svg>

      {/* Axis labels */}
      <div style={{ position: 'absolute', bottom: 6, right: 10, fontSize: '.65rem', color: '#94a3b8' }}>
        Page: {maxPageWidth}×{maxPageHeight}px
      </div>

      {/* Dots */}
      {buckets.map((bucket, i) => {
        const xPct = (bucket.x / maxPageWidth) * 100;
        const yPct = (bucket.y / maxPageHeight) * 100;
        const { fill, border } = getColor(bucket.count, maxCount);
        const size = 12 + Math.min(bucket.count * 4, 24);
        const opacity = 0.6 + (bucket.count / maxCount) * 0.4;
        const first = bucket.clicks[0];

        return (
          <div
            key={i}
            className="heatmap-dot"
            style={{
              left: `${xPct}%`,
              top: `${yPct}%`,
              width: size,
              height: size,
              background: fill,
              border: `2px solid ${border}`,
              opacity,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setTooltip({
                x: e.clientX,
                y: e.clientY,
                bucket,
                first,
              });
            }}
          />
        );
      })}

      {/* Tooltip */}
      {tooltip && (
        <div
          className="heatmap-tooltip"
          style={{
            top: tooltip.y - (containerRef.current?.getBoundingClientRect().top || 0) - 10,
            left: tooltip.x - (containerRef.current?.getBoundingClientRect().left || 0) + 14,
          }}
        >
          <div>Clicks: <strong>{tooltip.bucket.count}</strong></div>
          {tooltip.first.page_x !== undefined ? (
            <div>Page: ({tooltip.first.page_x}, {tooltip.first.page_y})</div>
          ) : (
            <div>Viewport: ({tooltip.first.x}, {tooltip.first.y})</div>
          )}
          <div>Latest: {formatTimestamp(tooltip.bucket.clicks.at(-1)?.timestamp)}</div>
        </div>
      )}

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: 8,
        left: 10,
        display: 'flex',
        gap: 12,
        fontSize: '.68rem',
        alignItems: 'center',
        background: 'rgba(255,255,255,.85)',
        padding: '4px 10px',
        borderRadius: 6,
        backdropFilter: 'blur(4px)',
      }}>
        {[
          { color: 'rgba(79,70,229,0.7)', label: 'Low' },
          { color: 'rgba(234,179,8,0.75)', label: 'Medium' },
          { color: 'rgba(249,115,22,0.8)', label: 'High' },
          { color: 'rgba(239,68,68,0.85)', label: 'Very high' },
        ].map(({ color, label }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

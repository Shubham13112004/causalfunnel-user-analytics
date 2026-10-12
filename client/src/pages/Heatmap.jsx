import React, { useEffect } from 'react';
import { ChevronDown, MousePointerClick, Info } from 'lucide-react';
import Header from '../components/Header';
import HeatmapCanvas from '../components/HeatmapCanvas';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { useHeatmap } from '../hooks/useAnalytics';
import { truncateUrl } from '../utils/formatters';

export default function Heatmap() {
  const {
    pages,
    selectedPage,
    setSelectedPage,
    heatmapData,
    pagesLoading,
    dataLoading,
    pagesError,
    dataError,
    fetchPages,
    fetchHeatmapData,
  } = useHeatmap();

  // Load available pages on mount
  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // Fetch click data whenever selected page changes
  useEffect(() => {
    if (selectedPage) {
      fetchHeatmapData(selectedPage);
    }
  }, [selectedPage, fetchHeatmapData]);

  return (
    <>
      <Header title="Heatmap" />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Click Heatmap</h1>
          <p className="page-subtitle">
            Visualize where users click on each page. Dots represent page-relative click positions.
          </p>
        </div>

        {/* Page selector */}
        <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <label
              htmlFor="page-select"
              style={{ fontWeight: 600, fontSize: '.875rem', whiteSpace: 'nowrap' }}
            >
              Select Page:
            </label>

            {pagesLoading ? (
              <div className="skeleton" style={{ height: 36, width: 320, borderRadius: 6 }} />
            ) : pagesError ? (
              <ErrorState message={pagesError} onRetry={fetchPages} />
            ) : pages.length === 0 ? (
              <div style={{ fontSize: '.8125rem', color: 'var(--color-text-muted)' }}>
                No pages tracked yet. Open the demo page to generate data.
              </div>
            ) : (
              <div className="select-wrapper" style={{ minWidth: 320 }}>
                <select
                  id="page-select"
                  className="select-input"
                  value={selectedPage}
                  onChange={(e) => setSelectedPage(e.target.value)}
                >
                  {pages.map((page) => (
                    <option key={page} value={page}>
                      {truncateUrl(page, 70)}
                    </option>
                  ))}
                </select>
                <span className="select-arrow">
                  <ChevronDown size={14} />
                </span>
              </div>
            )}

            {heatmapData && !dataLoading && (
              <div
                style={{
                  marginLeft: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'var(--color-accent-light)',
                  color: 'var(--color-accent)',
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: '.78rem',
                  fontWeight: 600,
                }}
              >
                <MousePointerClick size={13} />
                {heatmapData.total_clicks} click{heatmapData.total_clicks !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Info notice */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 16,
            fontSize: '.78rem',
            color: '#92400e',
          }}
        >
          <Info size={14} style={{ marginTop: 2, flexShrink: 0 }} />
          <span>
            Dots are placed using <strong>page-relative coordinates</strong> (pageX/pageY), normalized to the maximum
            recorded page dimensions. Positions reflect where on the full document each click occurred —
            not just the visible viewport.
          </span>
        </div>

        {/* Heatmap canvas */}
        <div className="heatmap-container">
          <div
            className="card-header"
            style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)' }}
          >
            <div className="card-title" style={{ fontSize: '.875rem' }}>
              {selectedPage ? truncateUrl(selectedPage, 70) : 'No page selected'}
            </div>
          </div>

          {dataLoading ? (
            <LoadingState message="Loading click data…" />
          ) : dataError ? (
            <ErrorState message={dataError} onRetry={() => fetchHeatmapData(selectedPage)} />
          ) : (
            <HeatmapCanvas clicks={heatmapData?.clicks || []} />
          )}
        </div>
      </div>
    </>
  );
}

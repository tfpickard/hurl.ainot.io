'use client';

import { useEffect, useState } from 'react';

export default function StatsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stats');
      const data = await res.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading statistics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container">
        <div className="error">Failed to load statistics</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Statistics
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#666' }}>
          Aggregate metrics about our story collection
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: '700', color: '#667eea', marginBottom: '0.5rem' }}>
            {stats.totalStories}
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#333' }}>
            Total Stories
          </div>
          <p style={{ marginTop: '0.5rem', color: '#999', fontSize: '0.9rem' }}>
            All stories ever created
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: '700', color: '#00796b', marginBottom: '0.5rem' }}>
            {stats.activeStories}
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#333' }}>
            Active Stories
          </div>
          <p style={{ marginTop: '0.5rem', color: '#999', fontSize: '0.9rem' }}>
            Stories currently in progress
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: '700', color: '#7b1fa2', marginBottom: '0.5rem' }}>
            {stats.completedStories}
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#333' }}>
            Completed Stories
          </div>
          <p style={{ marginTop: '0.5rem', color: '#999', fontSize: '0.9rem' }}>
            Stories that reached their finale
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: '700', color: '#f57c00', marginBottom: '0.5rem' }}>
            {stats.totalChapters}
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#333' }}>
            Total Chapters
          </div>
          <p style={{ marginTop: '0.5rem', color: '#999', fontSize: '0.9rem' }}>
            Chapters across all stories
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
          Additional Metrics
        </h2>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f5f7fa', borderRadius: '8px' }}>
            <span style={{ fontWeight: '600' }}>Average Chapters per Story</span>
            <span style={{ color: '#667eea', fontWeight: '600' }}>
              {stats.totalStories > 0 ? (stats.totalChapters / stats.totalStories).toFixed(1) : '0'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f5f7fa', borderRadius: '8px' }}>
            <span style={{ fontWeight: '600' }}>Active Story Percentage</span>
            <span style={{ color: '#00796b', fontWeight: '600' }}>
              {stats.totalStories > 0 ? ((stats.activeStories / stats.totalStories) * 100).toFixed(1) : '0'}%
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f5f7fa', borderRadius: '8px' }}>
            <span style={{ fontWeight: '600' }}>Completion Rate</span>
            <span style={{ color: '#7b1fa2', fontWeight: '600' }}>
              {stats.totalStories > 0 ? ((stats.completedStories / stats.totalStories) * 100).toFixed(1) : '0'}%
            </span>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#666' }}>
          Statistics are updated in real-time as new stories and chapters are added to the collection.
        </p>
      </div>
    </div>
  );
}

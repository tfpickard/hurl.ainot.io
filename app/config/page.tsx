'use client';

import { useState } from 'react';

export default function ConfigPage() {
  const [settings, setSettings] = useState({
    displayMode: 'grid',
    sortPreference: 'latest',
    showTags: true,
    showGenres: true,
  });

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('hurlSettings', JSON.stringify(settings));
    alert('Settings saved!');
  };

  return (
    <div className="container">
      <div style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Configuration
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#666' }}>
          Customize your reading experience
        </p>
      </div>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>
          Display Settings
        </h2>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
            Display Mode
          </label>
          <select
            className="sort-select"
            value={settings.displayMode}
            onChange={(e) => setSettings({ ...settings, displayMode: e.target.value })}
          >
            <option value="grid">Grid View</option>
            <option value="list">List View</option>
          </select>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
            Choose how stories are displayed on the browse page
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
            Default Sort Order
          </label>
          <select
            className="sort-select"
            value={settings.sortPreference}
            onChange={(e) => setSettings({ ...settings, sortPreference: e.target.value })}
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
            <option value="chapters">Most Chapters</option>
          </select>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
            Your preferred sorting method for stories
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.showTags}
              onChange={(e) => setSettings({ ...settings, showTags: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontWeight: '600' }}>Show Tags</span>
          </label>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666', marginLeft: '1.625rem' }}>
            Display thematic tags on story cards
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.showGenres}
              onChange={(e) => setSettings({ ...settings, showGenres: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontWeight: '600' }}>Show Genres</span>
          </label>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666', marginLeft: '1.625rem' }}>
            Display genre information on story pages
          </p>
        </div>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '2px solid #e1e8ed' }}>
          <button onClick={handleSave} className="btn" style={{ width: 'auto', padding: '0.75rem 2rem' }}>
            Save Settings
          </button>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '800px', margin: '2rem auto 0' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
          About Hurl
        </h2>
        <p style={{ color: '#666', lineHeight: '1.8', marginBottom: '1rem' }}>
          Hurl (Hyperdimensional Utopian Relay Launch Laboratory Overmind Loom) is a platform for
          exploring autonomous science fiction tales that evolve in real time. Each story is AI-generated
          and features unique themes, genres, and narrative structures.
        </p>
        <p style={{ color: '#666', lineHeight: '1.8' }}>
          Stories are organized by status (active or completed) and can contain multiple chapters.
          Browse the collection, discover new tales, and watch as active stories continue to unfold.
        </p>

        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid #e1e8ed' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>
            System Information
          </h3>
          <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Platform:</span>
              <span style={{ fontWeight: '600' }}>Hurl v1.0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Database:</span>
              <span style={{ fontWeight: '600' }}>Neo4j</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Framework:</span>
              <span style={{ fontWeight: '600' }}>Next.js 14</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

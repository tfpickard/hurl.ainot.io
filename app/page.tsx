'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { GraphData, StoryNode } from '@/lib/types';

// Import ForceGraph2D dynamically to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph').then(mod => mod.ForceGraph2D), {
  ssr: false,
  loading: () => <div className="loading">Loading graph visualization...</div>
});

type Tab = 'create-story' | 'create-relationship';

export default function Home() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [stories, setStories] = useState<StoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('create-story');

  // Create story form
  const [newStory, setNewStory] = useState({ title: '', content: '' });

  // Create relationship form
  const [relationship, setRelationship] = useState({
    fromId: '',
    toId: '',
    type: 'LEADS_TO' as const,
    label: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [graphRes, storiesRes] = await Promise.all([
        fetch('/api/graph'),
        fetch('/api/stories'),
      ]);

      const graphData = await graphRes.json();
      const storiesData = await storiesRes.json();

      if (graphData.success) {
        setGraphData(graphData.data);
      }

      if (storiesData.success) {
        setStories(storiesData.data);
      }
    } catch (err: any) {
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStory),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('Story created successfully!');
        setNewStory({ title: '', content: '' });
        await loadData();
      } else {
        setError(data.error || 'Failed to create story');
      }
    } catch (err: any) {
      setError('Failed to create story: ' + err.message);
    }
  };

  const handleCreateRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...relationship,
          weight: 1,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('Relationship created successfully!');
        setRelationship({
          fromId: '',
          toId: '',
          type: 'LEADS_TO',
          label: '',
        });
        await loadData();
      } else {
        setError(data.error || 'Failed to create relationship');
      }
    } catch (err: any) {
      setError('Failed to create relationship: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading story graph...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Hurl</h1>
        <p>Create and explore interconnected stories</p>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="main-content">
        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>Story Graph</h2>
          <div className="graph-container">
            {graphData.nodes.length > 0 ? (
              <ForceGraph2D
                graphData={graphData}
                nodeLabel="label"
                nodeAutoColorBy="id"
                linkLabel="label"
                linkDirectionalArrowLength={6}
                linkDirectionalArrowRelPos={1}
                linkCurvature={0.25}
                nodeCanvasObject={(node: any, ctx: any, globalScale: any) => {
                  const label = node.label;
                  const fontSize = 12 / globalScale;
                  ctx.font = `${fontSize}px Sans-Serif`;
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillStyle = node.color;
                  ctx.fillText(label, node.x, node.y);
                }}
              />
            ) : (
              <div className="loading">
                No stories yet. Create your first story to get started!
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'create-story' ? 'active' : ''}`}
              onClick={() => setActiveTab('create-story')}
            >
              Create Story
            </button>
            <button
              className={`tab ${activeTab === 'create-relationship' ? 'active' : ''}`}
              onClick={() => setActiveTab('create-relationship')}
            >
              Link Stories
            </button>
          </div>

          {activeTab === 'create-story' && (
            <form onSubmit={handleCreateStory}>
              <div className="form-group">
                <label htmlFor="title">Story Title</label>
                <input
                  id="title"
                  type="text"
                  value={newStory.title}
                  onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                  required
                  placeholder="Enter a compelling title..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="content">Story Content</label>
                <textarea
                  id="content"
                  value={newStory.content}
                  onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
                  required
                  placeholder="Write your story here..."
                />
              </div>

              <button type="submit" className="btn">
                Create Story
              </button>
            </form>
          )}

          {activeTab === 'create-relationship' && (
            <form onSubmit={handleCreateRelationship}>
              <div className="form-group">
                <label htmlFor="fromId">From Story</label>
                <select
                  id="fromId"
                  value={relationship.fromId}
                  onChange={(e) => setRelationship({ ...relationship, fromId: e.target.value })}
                  required
                >
                  <option value="">Select a story...</option>
                  {stories.map((story) => (
                    <option key={story.id} value={story.id}>
                      {story.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="toId">To Story</label>
                <select
                  id="toId"
                  value={relationship.toId}
                  onChange={(e) => setRelationship({ ...relationship, toId: e.target.value })}
                  required
                >
                  <option value="">Select a story...</option>
                  {stories.map((story) => (
                    <option key={story.id} value={story.id}>
                      {story.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="type">Relationship Type</label>
                <select
                  id="type"
                  value={relationship.type}
                  onChange={(e) => setRelationship({ ...relationship, type: e.target.value as any })}
                  required
                >
                  <option value="LEADS_TO">Leads To</option>
                  <option value="REFERENCES">References</option>
                  <option value="BRANCHES_FROM">Branches From</option>
                  <option value="MERGES_WITH">Merges With</option>
                  <option value="INSPIRED_BY">Inspired By</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="label">Label (optional)</label>
                <input
                  id="label"
                  type="text"
                  value={relationship.label}
                  onChange={(e) => setRelationship({ ...relationship, label: e.target.value })}
                  placeholder="Describe the connection..."
                />
              </div>

              <button type="submit" className="btn">
                Create Link
              </button>
            </form>
          )}

          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>All Stories ({stories.length})</h3>
            <div className="story-list">
              {stories.map((story) => (
                <div key={story.id} className="story-item">
                  <h4>{story.title}</h4>
                  <p>{story.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

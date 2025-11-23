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
  const [selectedStory, setSelectedStory] = useState<StoryNode | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [stats, setStats] = useState<any>(null);

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
    loadStats();
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

  const loadStats = async () => {
    try {
      const res = await fetch('/api/statistics?type=today');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
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

  const handleGenerateImage = async (storyId: string) => {
    setError('');
    setSuccess('');
    setGeneratingImage(true);

    try {
      const res = await fetch(`/api/stories/${storyId}/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(`Cover art generated! Cost: $${data.data.costUsd.toFixed(4)}`);
        await loadData();
        await loadStats();

        // Update selected story if it's the one we generated for
        if (selectedStory?.id === storyId) {
          const updatedStory = stories.find(s => s.id === storyId);
          if (updatedStory) {
            setSelectedStory({ ...updatedStory, coverImageUrl: data.data.coverImageUrl });
          }
        }
      } else {
        setError(data.error || 'Failed to generate image');
      }
    } catch (err: any) {
      setError('Failed to generate image: ' + err.message);
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleNodeClick = (node: any) => {
    const story = stories.find(s => s.id === node.id);
    if (story) {
      setSelectedStory(story);
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
        <p>Create and explore interconnected stories with AI-generated cover art</p>
        {stats && (
          <div style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.9 }}>
            Today: {stats.imagesGenerated} images • ${stats.costUsd.toFixed(4)} • {stats.storageUsedMb.toFixed(2)} MB
          </div>
        )}
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
                onNodeClick={handleNodeClick}
                nodeCanvasObjectMode={() => 'after'}
                nodeCanvasObject={(node: any, ctx: any, globalScale: any) => {
                  // Draw cover image if available
                  if (node.coverImageUrl) {
                    const img = new Image();
                    img.src = node.coverImageUrl;
                    const size = 16 / globalScale;
                    ctx.drawImage(img, node.x - size / 2, node.y - size / 2, size, size);
                  }

                  // Draw label
                  const label = node.label;
                  const fontSize = 10 / globalScale;
                  ctx.font = `${fontSize}px Sans-Serif`;
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillStyle = node.coverImageUrl ? '#fff' : node.color;

                  // Add background for label
                  const textWidth = ctx.measureText(label).width;
                  const padding = 2 / globalScale;
                  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                  ctx.fillRect(
                    node.x - textWidth / 2 - padding,
                    node.y + (node.coverImageUrl ? 10 : 0) / globalScale - fontSize / 2 - padding,
                    textWidth + padding * 2,
                    fontSize + padding * 2
                  );

                  ctx.fillStyle = '#fff';
                  ctx.fillText(label, node.x, node.y + (node.coverImageUrl ? 10 : 0) / globalScale);
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
                <div
                  key={story.id}
                  className={`story-item ${selectedStory?.id === story.id ? 'selected' : ''}`}
                  onClick={() => setSelectedStory(story)}
                >
                  {story.coverImageUrl && (
                    <img
                      src={story.coverImageUrl}
                      alt={story.title}
                      style={{
                        width: '100%',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        marginBottom: '0.5rem'
                      }}
                    />
                  )}
                  <h4>{story.title}</h4>
                  <p>{story.content.substring(0, 100)}{story.content.length > 100 ? '...' : ''}</p>
                  {selectedStory?.id === story.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateImage(story.id);
                      }}
                      disabled={generatingImage}
                      className="btn"
                      style={{ marginTop: '0.5rem', fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                    >
                      {generatingImage ? 'Generating...' : story.coverImageUrl ? 'Regenerate Cover Art' : 'Generate Cover Art'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

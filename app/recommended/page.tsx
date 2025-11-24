'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StoryNode } from '@/lib/types';

export default function RecommendedPage() {
  const [stories, setStories] = useState<StoryNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stories?recommended=true');
      const data = await res.json();

      if (data.success) {
        setStories(data.data);
      }
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Recommended Stories
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#666' }}>
          Our curated selection of the best tales
        </p>
      </div>

      {loading ? (
        <div className="loading">Loading stories...</div>
      ) : stories.length === 0 ? (
        <div className="card">
          <p style={{ color: '#666', textAlign: 'center' }}>
            No recommended stories yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="story-grid">
          {stories.map((story) => (
            <Link key={story.id} href={`/stories/${story.id}`} style={{ textDecoration: 'none' }}>
              <div className="story-card">
                {story.coverImageUrl ? (
                  <img
                    src={story.coverImageUrl}
                    alt={story.title}
                    className="story-card-image"
                  />
                ) : (
                  <div className="story-card-image" />
                )}
                <div className="story-card-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <h3 className="story-card-title">{story.title}</h3>
                    <span className={`story-status ${story.status}`}>
                      {story.status}
                    </span>
                  </div>
                  <p className="story-card-excerpt">
                    {story.content.substring(0, 150)}
                    {story.content.length > 150 ? '...' : ''}
                  </p>
                  <div className="story-card-meta">
                    <span>{story.chapterCount || 0} chapters</span>
                    <span>•</span>
                    <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                  </div>
                  {story.tags && story.tags.length > 0 && (
                    <div className="story-tags">
                      {story.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="story-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StoryNode } from '@/lib/types';

export default function HomePage() {
  const [featuredStories, setFeaturedStories] = useState<StoryNode[]>([]);
  const [recentStories, setRecentStories] = useState<StoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [featuredRes, recentRes, statsRes] = await Promise.all([
        fetch('/api/stories?limit=6&sortBy=chapters'),
        fetch('/api/stories?limit=8&sortBy=latest'),
        fetch('/api/stats'),
      ]);

      const featuredData = await featuredRes.json();
      const recentData = await recentRes.json();
      const statsData = await statsRes.json();

      if (featuredData.success) {
        setFeaturedStories(featuredData.data);
      }

      if (recentData.success) {
        setRecentStories(recentData.data);
      }

      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: 'calc(100vh - 80px)' }}>
      {/* Hero Section */}
      <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '700', marginBottom: '1rem' }}>
          HURL
        </h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem', opacity: 0.95 }}>
          Hyperdimensional Utopian Relay Launch Laboratory Overmind Loom
        </p>
        <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '700px', margin: '0 auto' }}>
          Autonomous science fiction tales evolving in real time
        </p>

        {stats && (
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{stats.activeStories}</div>
              <div style={{ opacity: 0.9 }}>Active Stories</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{stats.completedStories}</div>
              <div style={{ opacity: 0.9 }}>Completed Stories</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{stats.totalChapters}</div>
              <div style={{ opacity: 0.9 }}>Total Chapters</div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '2rem' }}>
          <Link
            href="/stories"
            style={{
              display: 'inline-block',
              padding: '1rem 3rem',
              background: 'white',
              color: '#667eea',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '1.1rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Browse All Stories →
          </Link>
        </div>
      </div>

      {/* Featured Stories */}
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem', color: 'white', textAlign: 'center' }}>
          Featured Stories
        </h2>

        {loading ? (
          <div className="loading" style={{ color: 'white' }}>Loading stories...</div>
        ) : (
          <div className="story-grid">
            {featuredStories.map((story) => (
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
                      {story.content.substring(0, 120)}
                      {story.content.length > 120 ? '...' : ''}
                    </p>
                    <div className="story-card-meta">
                      <span>{story.chapterCount || 0} chapters</span>
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

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link
            href="/stories"
            style={{
              display: 'inline-block',
              padding: '0.75rem 2rem',
              background: 'white',
              color: '#667eea',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
            }}
          >
            View All Stories
          </Link>
        </div>
      </div>
    </div>
  );
}

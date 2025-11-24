'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StoryNode } from '@/lib/types';

export default function StoriesPage() {
  const [stories, setStories] = useState<StoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'chapters'>('latest');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 12;

  useEffect(() => {
    loadStories(true);
  }, [searchTerm, sortBy, statusFilter]);

  const loadStories = async (reset: boolean = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 0 : page;

      const params = new URLSearchParams({
        sortBy,
        limit: String(PAGE_SIZE),
        skip: String(currentPage * PAGE_SIZE),
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const res = await fetch(`/api/stories?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        if (reset) {
          setStories(data.data);
          setPage(0);
        } else {
          setStories([...stories, ...data.data]);
        }
        setHasMore(data.data.length === PAGE_SIZE);
      }
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setPage(page + 1);
    loadStories(false);
  };

  return (
    <div className="container">
      <div style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Stories
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#666' }}>
          Browse all AI-generated science fiction tales
        </p>
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="controls-row">
          <input
            type="text"
            className="search-input"
            placeholder="Search stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="latest">Latest first</option>
            <option value="oldest">Oldest first</option>
            <option value="chapters">Most chapters</option>
          </select>

          <button
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
            onClick={() => setStatusFilter('active')}
          >
            Active
          </button>
          <button
            className={`filter-btn ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Story Grid */}
      {loading && stories.length === 0 ? (
        <div className="loading">Loading stories...</div>
      ) : stories.length === 0 ? (
        <div className="loading">No stories found.</div>
      ) : (
        <>
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

          {hasMore && !loading && (
            <button className="load-more" onClick={loadMore}>
              Load More Stories
            </button>
          )}

          {loading && stories.length > 0 && (
            <div className="loading">Loading more...</div>
          )}
        </>
      )}
    </div>
  );
}

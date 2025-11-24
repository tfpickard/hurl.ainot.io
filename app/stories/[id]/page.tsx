'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { StoryNode, Chapter } from '@/lib/types';

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [story, setStory] = useState<StoryNode | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      loadStoryAndChapters();
    }
  }, [params.id]);

  const loadStoryAndChapters = async () => {
    try {
      setLoading(true);
      const [storyRes, chaptersRes] = await Promise.all([
        fetch(`/api/stories/${params.id}`),
        fetch(`/api/stories/${params.id}/chapters`),
      ]);

      const storyData = await storyRes.json();
      const chaptersData = await chaptersRes.json();

      if (storyData.success) {
        setStory(storyData.data);
      } else {
        setError('Story not found');
      }

      if (chaptersData.success) {
        setChapters(chaptersData.data);
      }
    } catch (err: any) {
      setError('Failed to load story');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading story...</div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="container">
        <div className="error">{error || 'Story not found'}</div>
        <Link href="/stories" className="btn">
          Back to Stories
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      {/* Back button */}
      <div style={{ paddingTop: '2rem' }}>
        <Link href="/stories" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>
          ← Back to Stories
        </Link>
      </div>

      {/* Story header */}
      <div style={{ marginTop: '2rem' }}>
        {story.coverImageUrl && (
          <div style={{ marginBottom: '2rem' }}>
            <img
              src={story.coverImageUrl}
              alt={story.title}
              style={{
                width: '100%',
                maxHeight: '400px',
                objectFit: 'cover',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', margin: 0 }}>{story.title}</h1>
          <span className={`story-status ${story.status}`} style={{ fontSize: '0.875rem' }}>
            {story.status}
          </span>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '1.1rem', color: '#666', lineHeight: '1.8' }}>
            {story.content}
          </p>
        </div>

        {/* Story metadata */}
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', color: '#999', marginBottom: '1rem' }}>
          <span>{chapters.length} chapters</span>
          <span>•</span>
          <span>Created {new Date(story.createdAt).toLocaleDateString()}</span>
          {story.updatedAt !== story.createdAt && (
            <>
              <span>•</span>
              <span>Updated {new Date(story.updatedAt).toLocaleDateString()}</span>
            </>
          )}
        </div>

        {/* Tags */}
        {story.tags && story.tags.length > 0 && (
          <div className="story-tags" style={{ marginBottom: '2rem' }}>
            {story.tags.map((tag) => (
              <span key={tag} className="story-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Genres */}
        {story.genres && story.genres.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <strong style={{ color: '#666' }}>Genres:</strong>{' '}
            {story.genres.join(', ')}
          </div>
        )}
      </div>

      {/* Chapters */}
      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1.5rem' }}>
          Chapters
        </h2>

        {chapters.length === 0 ? (
          <div className="card">
            <p style={{ color: '#666', textAlign: 'center' }}>
              No chapters yet. This story is just getting started!
            </p>
          </div>
        ) : (
          <div className="chapter-list">
            {chapters.map((chapter, index) => (
              <div key={chapter.id} className="chapter-item">
                <div style={{ fontSize: '0.875rem', color: '#999', marginBottom: '0.5rem' }}>
                  Chapter {index + 1}
                </div>
                <h3 className="chapter-title">{chapter.title}</h3>
                <div className="chapter-content" style={{ whiteSpace: 'pre-wrap' }}>
                  {chapter.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

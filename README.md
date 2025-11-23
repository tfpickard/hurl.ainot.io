# Hurl - Interactive Story Graph

A Next.js application for creating and exploring interconnected stories using Neo4j graph database technology. Built for deployment on Vercel with a focus on creative narrative exploration through graph traversal.

## Features

- **Graph Database**: Neo4j Aura for powerful story relationship traversal
- **Interactive Visualization**: Real-time force-directed graph visualization
- **Story Creation**: Create stories and link them with meaningful relationships
- **Relationship Types**:
  - `LEADS_TO` - Sequential narrative flow
  - `REFERENCES` - Cross-references between stories
  - `BRANCHES_FROM` - Alternative story paths
  - `MERGES_WITH` - Convergent narratives
  - `INSPIRED_BY` - Creative influences
- **Vercel Deployment**: Optimized for serverless deployment
- **Full TypeScript**: End-to-end type safety

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Database**: Neo4j Aura (Free Tier available)
- **Visualization**: react-force-graph
- **Validation**: Zod
- **Deployment**: Vercel

## Why Neo4j Graph Database?

Neo4j is perfect for this use case because:

1. **Natural Story Relationships**: Stories are inherently connected through references, inspirations, and narrative flow
2. **Flexible Traversal**: Query stories by exploring relationships in any direction
3. **Pattern Matching**: Find narrative patterns like "all stories that branch from X and lead to Y"
4. **Performance**: Graph queries are optimized for relationship traversal
5. **Low Cost**: Neo4j Aura Free tier includes:
   - 200,000 nodes
   - 400,000 relationships
   - 50 MB storage
   - Perfect for personal projects and prototyping

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd hurl.ainot.io
npm install
```

### 2. Set Up Neo4j Aura (Free)

1. Go to [Neo4j Aura](https://neo4j.com/cloud/aura/)
2. Sign up for a free account
3. Click "Create a Free Database"
4. Choose the free tier (AuraDB Free)
5. Download your credentials (you'll need them for the next step)
6. Wait for the database to be provisioned (1-2 minutes)

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Neo4j Aura credentials:

```env
NEO4J_URI=neo4j+s://your-instance-id.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-password-from-download
```

### 4. Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

### 5. Test the Health Endpoint

```bash
curl http://localhost:3000/api/health
```

You should see:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected"
  }
}
```

## Deploy to Vercel

### Option 1: Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts and add your environment variables when asked.

### Option 2: Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables:
   - `NEO4J_URI`
   - `NEO4J_USERNAME`
   - `NEO4J_PASSWORD`
6. Click "Deploy"

## API Endpoints

### Stories

- `GET /api/stories` - Get all stories
- `POST /api/stories` - Create a new story
- `GET /api/stories/[id]` - Get a specific story
- `PATCH /api/stories/[id]` - Update a story
- `DELETE /api/stories/[id]` - Delete a story
- `GET /api/stories/[id]/connections?depth=2` - Get connected stories

### Relationships

- `POST /api/relationships` - Create a relationship between stories

### Graph

- `GET /api/graph` - Get the entire story graph

### Health

- `GET /api/health` - Check database connectivity

## Example Usage

### Create a Story

```bash
curl -X POST http://localhost:3000/api/stories \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Beginning",
    "content": "Once upon a time in a digital realm..."
  }'
```

### Create a Relationship

```bash
curl -X POST http://localhost:3000/api/relationships \
  -H "Content-Type: application/json" \
  -d '{
    "fromId": "story-id-1",
    "toId": "story-id-2",
    "type": "LEADS_TO",
    "label": "The journey continues"
  }'
```

### Query the Graph

```bash
curl http://localhost:3000/api/graph
```

## Graph Database Queries

The application uses Cypher queries to interact with Neo4j. Here are some examples:

### Create a Story Node

```cypher
CREATE (s:Story {
  id: randomUUID(),
  title: 'My Story',
  content: 'Story content here',
  createdAt: datetime()
})
RETURN s
```

### Create a Relationship

```cypher
MATCH (from:Story {id: 'story-1'})
MATCH (to:Story {id: 'story-2'})
CREATE (from)-[r:LEADS_TO {label: 'Next chapter'}]->(to)
```

### Find All Connected Stories

```cypher
MATCH (start:Story {id: 'story-1'})-[r*1..3]-(connected:Story)
RETURN start, connected, r
```

### Find Shortest Path Between Stories

```cypher
MATCH path = shortestPath(
  (from:Story {id: 'story-1'})-[*]-(to:Story {id: 'story-2'})
)
RETURN path
```

## Cost Breakdown

### Free Tier (Perfect for Starting)

- **Vercel**:
  - Hobby plan: Free
  - 100GB bandwidth/month
  - Unlimited sites

- **Neo4j Aura Free**:
  - 200,000 nodes
  - 400,000 relationships
  - 50 MB storage
  - Perfect for development and small projects

### If You Need to Scale

- **Vercel Pro**: $20/month (if you need more bandwidth)
- **Neo4j Aura Professional**: Starts at $65/month
  - 2GB RAM
  - Unlimited storage
  - Automated backups

## Project Structure

```
hurl.ainot.io/
├── app/
│   ├── api/
│   │   ├── health/         # Health check endpoint
│   │   ├── stories/        # Story CRUD operations
│   │   ├── relationships/  # Create story relationships
│   │   └── graph/          # Get full graph data
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page with graph viz
│   └── globals.css         # Global styles
├── lib/
│   ├── neo4j.ts           # Database connection
│   ├── types.ts           # TypeScript types & schemas
│   └── models/
│       └── story.ts       # Story model & queries
├── .env.example           # Environment variables template
├── vercel.json            # Vercel configuration
└── package.json           # Dependencies
```

## Development

### Adding New Relationship Types

Edit `lib/types.ts`:

```typescript
export const StoryRelationshipSchema = z.object({
  // ...
  type: z.enum([
    'LEADS_TO',
    'REFERENCES',
    'YOUR_NEW_TYPE',  // Add here
  ]),
});
```

### Custom Graph Queries

Add new methods to `lib/models/story.ts`:

```typescript
static async customQuery(): Promise<any> {
  const session = await getSession();
  try {
    const result = await session.run(`
      MATCH (s:Story)-[r]->(t:Story)
      WHERE s.title CONTAINS 'keyword'
      RETURN s, r, t
    `);
    // Process results...
  } finally {
    await session.close();
  }
}
```

## Troubleshooting

### Database Connection Issues

1. Check your `.env.local` file has the correct credentials
2. Ensure your Neo4j Aura instance is running
3. Check the connection URI format: `neo4j+s://` (with the `+s` for SSL)

### Graph Not Displaying

1. Check browser console for errors
2. Ensure you have created at least one story
3. Verify API endpoints are returning data: `curl http://localhost:3000/api/graph`

### Deployment Issues

1. Verify environment variables are set in Vercel dashboard
2. Check Vercel function logs for errors
3. Ensure Neo4j Aura allows connections from Vercel IPs (usually automatic)

## Future Enhancements

- [ ] User authentication
- [ ] Story versioning
- [ ] Collaborative editing
- [ ] Advanced graph algorithms (PageRank, community detection)
- [ ] Export/import story graphs
- [ ] Rich text editor for story content
- [ ] Search and filter stories
- [ ] Story recommendations based on graph patterns

## License

MIT

## Contributing

Contributions welcome! Please open an issue or submit a pull request.

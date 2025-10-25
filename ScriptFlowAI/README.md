# YouTube Research & Scriptwriting AI

An AI-powered assistant for YouTube content creators, built with Next.js 14, Claude Sonnet 4.5, and Exa.

## Features

- **AI-Powered Research**: Automatically find and analyze the most relevant sources for any YouTube topic using Exa's neural search
- **Real-time Streaming**: Get instant responses from Claude with streaming text
- **YouTube-Focused**: Specialized prompts for script writing, research, and SEO
- **Source Citations**: Every research result includes titles, URLs, summaries, highlights, and full text
- **Modern UI**: Clean, responsive interface built with Tailwind CSS and shadcn/ui
- **Dual Mode Interface**: Switch between research mode and chat mode seamlessly
- **Edge Runtime**: Fast, globally distributed API routes

## Getting Started

### Prerequisites

- Node.js 18+ installed
- An Anthropic API key ([Get one here](https://console.anthropic.com/))
- An Exa API key ([Get one here](https://exa.ai/))

### Installation

1. Clone or navigate to this repository:
```bash
cd ScriptFlowAI
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
   - Open `.env.local`
   - Add your API keys:
```
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
EXA_API_KEY=your-exa-api-key-here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage Examples

### Research Mode

Enter any YouTube topic to research:

- "AI automation for small businesses"
- "Quantum computing applications in cryptography"
- "Latest developments in renewable energy"
- "Effective time management techniques"
- "Best practices for mobile app development"

The system will return 5-10 high-quality sources with:
- Title and URL (clickable)
- Published date and author
- AI-generated summary
- Key highlights
- Full article text (expandable)
- Relevance score

### Chat Mode

Ask Claude anything:

- "Write a YouTube script intro about AI trends in 2025"
- "Suggest 10 viral video ideas about productivity"
- "Create an engaging hook for a video about climate change"
- "Write SEO-optimized title and description for a cooking tutorial"
- "Help me structure a 10-minute video about personal finance"

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **AI Model**: Anthropic Claude Sonnet 4.5
- **Research**: Exa neural search API
- **Runtime**: Edge Runtime for API routes

## Project Structure

```
ScriptFlowAI/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts      # Claude streaming API endpoint
│   │   └── research/
│   │       └── route.ts      # Exa research API endpoint
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main interface (research + chat)
├── components/
│   └── ui/                   # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       └── textarea.tsx
├── lib/
│   ├── agents/
│   │   └── research-agent.ts # Exa integration logic
│   ├── types.ts              # TypeScript interfaces
│   └── utils.ts              # Utility functions
├── .env.local                # Environment variables (API keys)
└── package.json
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Yes |
| `EXA_API_KEY` | Your Exa API key for research | Yes |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Customization

### Research Parameters

Edit research parameters in [`lib/agents/research-agent.ts`](lib/agents/research-agent.ts):
- `numResults`: Number of sources to fetch (default: 10)
- `useAutoprompt`: Let Exa optimize your query (default: true)
- `type`: Search type ('auto', 'keyword', 'neural')

### System Prompt

Edit the system prompt in [`app/api/chat/route.ts:29`](app/api/chat/route.ts#L29) to customize Claude's behavior.

### UI Components

All UI components are in [`components/ui/`](components/ui/) and can be customized via Tailwind classes.

## Troubleshooting

### "Failed to fetch" Error (Chat)

- Make sure your `ANTHROPIC_API_KEY` is correctly set in `.env.local`
- Restart the development server after adding the API key
- Check that your API key is valid and has credits

### Research API Errors

**"EXA_API_KEY is not configured"**
- Add your Exa API key to `.env.local`
- Get a free API key at [exa.ai](https://exa.ai/)

**"Rate limit exceeded"**
- Exa free tier has rate limits
- Wait a few moments and try again
- Consider upgrading your Exa plan

**"No sources found"**
- Try rephrasing your topic
- Use more specific or more general terms
- Check that the topic is research-friendly

### Port Already in Use

If port 3000 is already in use:
```bash
npm run dev -- -p 3001
```

## License

MIT

## Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ using Claude Sonnet 4.5 & Exa**

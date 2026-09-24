/**
 * Quotes for the desktop / home-screen quote widget.
 * Keep them short: the widget is sized for one or two lines.
 */
export interface Quote {
  text: string
  author: string
  category: string
}

export const quotes: Quote[] = [
  { text: 'I love innovating new products that change how people live', author: 'Product Visionary', category: 'Innovation' },
  { text: 'Every line of code is a step towards building the future', author: 'Tech Alchemist', category: 'Development' },
  { text: 'Great products solve problems people didn\'t know they had', author: 'Product Strategist', category: 'Strategy' },
  { text: 'Turning coffee into scalable solutions, one startup at a time', author: 'Serial Entrepreneur', category: 'Startup' },
  { text: 'User experience is not just design, it\'s digital empathy', author: 'UX Philosopher', category: 'Design' },
  { text: 'Building products that users love is the ultimate validation', author: 'Product Manager', category: 'Product' },
  { text: 'Data-driven decisions create products that actually matter', author: 'Analytics Guru', category: 'Analytics' },
  { text: 'Scaling from zero to millions starts with one perfect feature', author: 'Growth Hacker', category: 'Growth' },
  { text: 'The best products are born from obsessing over user pain points', author: 'Customer Advocate', category: 'Research' },
  { text: 'Iterate fast, fail cheap, learn everything', author: 'Lean Startup Guru', category: 'Methodology' },
  { text: 'Product-market fit is not a destination, it\'s a journey', author: 'Market Researcher', category: 'Market Fit' },
  { text: 'Every feature should tell a story that users want to be part of', author: 'Storytelling Expert', category: 'Narrative' },
  { text: 'The magic happens when technology meets human emotion', author: 'Emotional Designer', category: 'Psychology' },
  { text: 'Simplicity is the ultimate sophistication in product design', author: 'Minimalist Architect', category: 'Simplicity' },
  { text: 'Build products so good that users become your evangelists', author: 'Community Builder', category: 'Advocacy' },
  { text: 'The future belongs to products that anticipate user needs', author: 'Predictive Analyst', category: 'AI/ML' },
  { text: 'Revenue follows value, not the other way around', author: 'Value Creator', category: 'Business' },
  { text: 'Great products don\'t just solve problems, they create possibilities', author: 'Possibility Engineer', category: 'Vision' },
]

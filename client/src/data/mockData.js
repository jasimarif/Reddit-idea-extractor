export const mockIdeas = [
  {
    id: '1',
    title: 'Need an app that tracks my daily water intake and reminds me to drink water',
    summary:
      'Many people struggle with staying hydrated throughout the day. An app that sends smart reminders based on activity level, weather, and personal goals could be really helpful.',
    category: 'Health',
    upvotes: 2847,
    date: '2024-01-15',
    tags: ['Health', 'Mobile App', 'Wellness', 'Productivity'],
    fullContent:
      "I constantly forget to drink water during the day, especially when I'm busy at work. I've tried setting random alarms but they're either too frequent or not frequent enough. Would love an app that learns my patterns and sends personalized reminders. Maybe it could integrate with fitness trackers or weather apps to adjust recommendations?",
    comments: 156,
    redditUrl: 'https://reddit.com/r/productivity/comments/example1',
  },
  {
    id: '2',
    title: 'Wish there was a service to automatically invest my spare change from purchases',
    summary:
      'A fintech solution that rounds up purchases and invests the difference into diversified portfolios. Could help people start investing without thinking about it.',
    category: 'Wealth',
    upvotes: 4231,
    date: '2024-01-14',
    tags: ['FinTech', 'Investing', 'SaaS', 'Mobile App'],
    fullContent:
      'Every time I buy coffee for $4.50, I wish the extra $0.50 could automatically go into investments. I know there are some apps like this but they charge high fees or have limited investment options. Would be great to have more competition in this space.',
    comments: 203,
    redditUrl: 'https://reddit.com/r/personalfinance/comments/example2',
  },
  {
    id: '3',
    title: 'Looking for a platform to find hiking partners with similar skill levels',
    summary:
      'Social platform connecting outdoor enthusiasts based on experience level, preferred difficulty, and location. Could include safety features and trail recommendations.',
    category: 'Relationships',
    upvotes: 1892,
    date: '2024-01-13',
    tags: ['Social Media', 'Outdoor', 'Mobile App', 'Community'],
    fullContent:
      'I love hiking but most of my friends are either complete beginners or way more experienced than me. Would be awesome to have a platform where I can find people at my skill level who want to explore similar trails. Safety features like check-ins and emergency contacts would be essential.',
    comments: 89,
    redditUrl: 'https://reddit.com/r/hiking/comments/example3',
  },
  {
    id: '4',
    title: 'Need a meal planning app that considers my dietary restrictions and budget',
    summary:
      'AI-powered meal planning that generates recipes and shopping lists based on dietary needs, budget constraints, and family size.',
    category: 'Health',
    upvotes: 3156,
    date: '2024-01-12',
    tags: ['Health', 'AI', 'Food', 'Budgeting'],
    fullContent:
      'Planning meals is such a chore, especially with dietary restrictions (gluten-free) and trying to stay within budget. I spend hours every week planning meals and making shopping lists. An app that could do this automatically while considering my constraints would be a game-changer.',
    comments: 127,
    redditUrl: 'https://reddit.com/r/mealprep/comments/example4',
  },
  {
    id: '5',
    title: 'Want a service that helps me negotiate my bills automatically',
    summary:
      'Service that analyzes your recurring bills and automatically negotiates with providers to reduce costs, taking a percentage of savings as fee.',
    category: 'Wealth',
    upvotes: 5642,
    date: '2024-01-11',
    tags: ['FinTech', 'SaaS', 'Automation', 'Savings'],
    fullContent:
      "I hate calling to negotiate bills but I know I'm probably overpaying for internet, phone, insurance, etc. Would pay someone to do this for me if they could prove they're saving me money. Could be a great business model - they only make money if they save me money.",
    comments: 278,
    redditUrl: 'https://reddit.com/r/frugal/comments/example5',
  },
  {
    id: '6',
    title: 'Looking for a way to practice conversations before important meetings',
    summary:
      'AI-powered conversation simulator that helps users practice difficult conversations, presentations, or interviews with realistic scenarios.',
    category: 'Relationships',
    upvotes: 2134,
    date: '2024-01-10',
    tags: ['AI', 'Professional', 'Communication', 'Training'],
    fullContent:
      'I get really nervous before important conversations with my boss or difficult client calls. Would love a way to practice these scenarios beforehand with realistic AI that can help me prepare for different responses and outcomes.',
    comments: 94,
    redditUrl: 'https://reddit.com/r/careeradvice/comments/example6',
  },
];

export const mockPainPoints = [
  {
    id: '1',
    quote:
      "Why do all productivity apps cost $15/month? I just need basic task management, not a full enterprise solution.",
    category: 'Pricing',
    source: 'Reddit',
    timestamp: '2024-01-15 14:30',
    upvotes: 234,
  },
  {
    id: '2',
    quote:
      'The onboarding for this app is so confusing. Took me 20 minutes just to figure out how to create my first project.',
    category: 'UX',
    source: 'Twitter',
    timestamp: '2024-01-15 12:15',
  },
  {
    id: '3',
    quote:
      'Love the concept but missing dark mode and keyboard shortcuts. These should be basic features in 2024.',
    category: 'Features',
    source: 'Reddit',
    timestamp: '2024-01-15 09:45',
    upvotes: 89,
  },
  {
    id: '4',
    quote:
      'Been waiting 3 days for customer support to respond to my email. This is unacceptable for a paid service.',
    category: 'Support',
    source: 'Twitter',
    timestamp: '2024-01-14 16:20',
  },
  {
    id: '5',
    quote:
      "The free tier is basically useless - only 3 tasks? That's not enough to even try the product properly.",
    category: 'Pricing',
    source: 'Reddit',
    timestamp: '2024-01-14 11:30',
    upvotes: 156,
  },
  {
    id: '6',
    quote:
      "App crashes every time I try to upload a file larger than 10MB. Super frustrating when you're trying to work.",
    category: 'UX',
    source: 'Twitter',
    timestamp: '2024-01-14 08:15',
  },
];

export const mockBusinessIdeas = [
  {
    id: '1',
    title: 'Affordable Task Management for Freelancers',
    summary:
      'Simple, focused task management app specifically designed for freelancers and solo entrepreneurs, priced at $5/month with essential features only.',
    businessModel: 'SaaS Subscription',
    marketSegment: 'Freelancers & Solo Entrepreneurs',
    differentiator: 'Simplified & Affordable',
  },
  {
    id: '2',
    title: 'One-Click App Onboarding Service',
    summary:
      'Service that creates personalized onboarding flows for SaaS apps, reducing time-to-value and improving user retention.',
    businessModel: 'B2B Service',
    marketSegment: 'SaaS Companies',
    differentiator: 'Specialization in Onboarding',
  },
  {
    id: '3',
    title: 'AI-Powered Customer Support Triage',
    summary:
      'AI system that automatically categorizes and prioritizes customer support tickets, ensuring urgent issues get immediate attention.',
    businessModel: 'SaaS + AI',
    marketSegment: 'Customer Support Teams',
    differentiator: 'AI-First Approach',
  },
  {
    id: '4',
    title: 'Freemium Plan Optimizer',
    summary:
      'Analytics tool that helps SaaS companies optimize their freemium plans to maximize conversion to paid tiers.',
    businessModel: 'Analytics SaaS',
    marketSegment: 'SaaS Product Teams',
    differentiator: 'Freemium Focus',
  },
];

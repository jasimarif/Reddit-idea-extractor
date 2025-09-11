// Landing Page Templates
const landingPageTemplates = {
  // Template 1: SaaS/Tech Template
  saas: {
    id: 'saas',
    name: 'SaaS & Tech',
    description: 'Perfect for software products, apps, and tech solutions',
    preview: '/templates/saas-preview.png',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}} - {{TAGLINE}}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <h1 class="text-xl font-bold text-blue-600">{{TITLE}}</h1>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="#features" class="text-gray-500 hover:text-gray-900">Features</a>
                    <a href="#pricing" class="text-gray-500 hover:text-gray-900">Pricing</a>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        {{CTA_TEXT}}
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div class="text-center">
                <h1 class="text-4xl md:text-6xl font-bold mb-6">
                    {{HEADLINE}}
                </h1>
                <p class="text-xl md:text-2xl mb-8 text-blue-100">
                    {{SUBHEADLINE}}
                </p>
                <button class="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition duration-300">
                    {{CTA_TEXT}}
                </button>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
                <p class="text-lg text-gray-600">Everything you need to succeed</p>
            </div>
            <div class="grid md:grid-cols-3 gap-8">
                {{#each KEY_FEATURES}}
                <div class="text-center p-6 bg-white rounded-lg shadow-sm border">
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-rocket text-blue-600"></i>
                    </div>
                    <h3 class="text-lg font-semibold mb-2">{{this}}</h3>
                    <p class="text-gray-600">{{../FEATURE_DESCRIPTIONS.[{{@index}}]}}</p>
                </div>
                {{/each}}
            </div>
        </div>
    </section>

    <!-- Problem/Solution Section -->
    <section class="bg-gray-100 py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 class="text-3xl font-bold text-gray-900 mb-6">The Problem</h2>
                    <div class="space-y-4">
                        {{#each PAIN_POINTS}}
                        <div class="flex items-start">
                            <div class="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></div>
                            <p class="text-gray-700">{{this}}</p>
                        </div>
                        {{/each}}
                    </div>
                </div>
                <div>
                    <h2 class="text-3xl font-bold text-gray-900 mb-6">Our Solution</h2>
                    <div class="space-y-4">
                        {{#each OUTCOMES}}
                        <div class="flex items-start">
                            <div class="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                            <p class="text-gray-700">{{this}}</p>
                        </div>
                        {{/each}}
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Founder Message -->
    <section class="py-20">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div class="bg-white p-8 rounded-xl shadow-lg">
                <img src="https://via.placeholder.com/100x100" alt="Founder" class="w-20 h-20 rounded-full mx-auto mb-4">
                <blockquote class="text-lg text-gray-700 italic mb-4">
                    "{{FOUNDER_MESSAGE}}"
                </blockquote>
                <p class="text-gray-600">- Founder, {{TITLE}}</p>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-blue-600 text-white py-20">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p class="text-xl mb-8 text-blue-100">Join thousands of satisfied customers</p>
            <button class="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition duration-300">
                {{CTA_TEXT}}
            </button>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; 2024 {{TITLE}}. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`,
    placeholders: [
      'TITLE', 'TAGLINE', 'HEADLINE', 'SUBHEADLINE', 'CTA_TEXT', 
      'KEY_FEATURES', 'FEATURE_DESCRIPTIONS', 'PAIN_POINTS', 'OUTCOMES', 'FOUNDER_MESSAGE'
    ]
  },

  // Template 2: Business/Corporate Template
  corporate: {
    id: 'corporate',
    name: 'Business & Corporate',
    description: 'Professional template for businesses and services',
    preview: '/templates/corporate-preview.png',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}} - {{TAGLINE}}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-white">
    <!-- Navigation -->
    <nav class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-20">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <h1 class="text-2xl font-bold text-gray-900">{{TITLE}}</h1>
                    </div>
                </div>
                <div class="flex items-center space-x-8">
                    <a href="#about" class="text-gray-700 hover:text-gray-900 font-medium">About</a>
                    <a href="#services" class="text-gray-700 hover:text-gray-900 font-medium">Services</a>
                    <a href="#contact" class="text-gray-700 hover:text-gray-900 font-medium">Contact</a>
                    <button class="bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 font-medium">
                        {{CTA_TEXT}}
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div class="grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        {{HEADLINE}}
                    </h1>
                    <p class="text-xl text-gray-600 mb-8">
                        {{SUBHEADLINE}}
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4">
                        <button class="bg-gray-900 text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-gray-800">
                            {{CTA_TEXT}}
                        </button>
                        <button class="border border-gray-300 text-gray-700 px-8 py-4 rounded-md text-lg font-medium hover:bg-gray-50">
                            Learn More
                        </button>
                    </div>
                </div>
                <div class="bg-gray-200 h-96 rounded-lg flex items-center justify-center">
                    <i class="fas fa-chart-line text-6xl text-gray-400"></i>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section id="services" class="py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
                <p class="text-lg text-gray-600">Professional solutions for your business needs</p>
            </div>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {{#each KEY_FEATURES}}
                <div class="p-8 bg-white rounded-lg shadow-md border hover:shadow-lg transition duration-300">
                    <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                        <i class="fas fa-briefcase text-2xl text-gray-600"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-3">{{this}}</h3>
                    <p class="text-gray-600">{{../FEATURE_DESCRIPTIONS.[{{@index}}]}}</p>
                </div>
                {{/each}}
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section id="about" class="bg-gray-50 py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid md:grid-cols-2 gap-12 items-center">
                <div class="bg-gray-200 h-80 rounded-lg flex items-center justify-center">
                    <i class="fas fa-users text-6xl text-gray-400"></i>
                </div>
                <div>
                    <h2 class="text-3xl font-bold text-gray-900 mb-6">Why Choose Us?</h2>
                    <div class="space-y-6">
                        {{#each OUTCOMES}}
                        <div class="flex items-start">
                            <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                                <i class="fas fa-check text-green-600 text-sm"></i>
                            </div>
                            <p class="text-gray-700 text-lg">{{this}}</p>
                        </div>
                        {{/each}}
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Testimonial -->
    <section class="py-20">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <blockquote class="text-2xl text-gray-700 mb-8">
                "{{FOUNDER_MESSAGE}}"
            </blockquote>
            <p class="text-gray-600 text-lg">CEO & Founder</p>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-gray-900 text-white py-20">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
            <p class="text-xl mb-8 text-gray-300">Get started with a free consultation today</p>
            <button class="bg-white text-gray-900 px-8 py-4 rounded-md text-lg font-medium hover:bg-gray-100">
                {{CTA_TEXT}}
            </button>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; 2024 {{TITLE}}. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`,
    placeholders: [
      'TITLE', 'TAGLINE', 'HEADLINE', 'SUBHEADLINE', 'CTA_TEXT', 
      'KEY_FEATURES', 'FEATURE_DESCRIPTIONS', 'PAIN_POINTS', 'OUTCOMES', 'FOUNDER_MESSAGE'
    ]
  },

  // Template 3: E-commerce/Product Template
  ecommerce: {
    id: 'ecommerce',
    name: 'E-commerce & Product',
    description: 'Ideal for products, stores, and marketplace solutions',
    preview: '/templates/ecommerce-preview.png',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}} - {{TAGLINE}}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-white">
    <!-- Navigation -->
    <nav class="bg-white shadow-md border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <h1 class="text-xl font-bold text-orange-600">{{TITLE}}</h1>
                    </div>
                </div>
                <div class="flex items-center space-x-6">
                    <a href="#products" class="text-gray-600 hover:text-gray-900">Products</a>
                    <a href="#features" class="text-gray-600 hover:text-gray-900">Features</a>
                    <a href="#reviews" class="text-gray-600 hover:text-gray-900">Reviews</a>
                    <button class="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600">
                        {{CTA_TEXT}}
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-orange-400 to-pink-500 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div class="grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h1 class="text-4xl md:text-5xl font-bold mb-6">
                        {{HEADLINE}}
                    </h1>
                    <p class="text-xl mb-8 text-orange-100">
                        {{SUBHEADLINE}}
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4">
                        <button class="bg-white text-orange-500 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100">
                            {{CTA_TEXT}}
                        </button>
                        <button class="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-orange-500">
                            View Demo
                        </button>
                    </div>
                </div>
                <div class="bg-white/20 h-80 rounded-2xl flex items-center justify-center">
                    <i class="fas fa-shopping-cart text-6xl text-white/60"></i>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Product?</h2>
                <p class="text-lg text-gray-600">Features that make us stand out</p>
            </div>
            <div class="grid md:grid-cols-3 gap-8">
                {{#each KEY_FEATURES}}
                <div class="text-center p-6 bg-gradient-to-b from-orange-50 to-pink-50 rounded-xl">
                    <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-star text-orange-500 text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-semibold mb-3 text-gray-900">{{this}}</h3>
                    <p class="text-gray-600">{{../FEATURE_DESCRIPTIONS.[{{@index}}]}}</p>
                </div>
                {{/each}}
            </div>
        </div>
    </section>

    <!-- Problem/Solution -->
    <section class="bg-gray-50 py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">Transform Your Experience</h2>
            </div>
            <div class="grid md:grid-cols-2 gap-12">
                <div class="bg-white p-8 rounded-xl shadow-md">
                    <h3 class="text-2xl font-bold text-red-600 mb-6">Before</h3>
                    <div class="space-y-4">
                        {{#each PAIN_POINTS}}
                        <div class="flex items-start">
                            <i class="fas fa-times text-red-500 mt-1 mr-3"></i>
                            <p class="text-gray-700">{{this}}</p>
                        </div>
                        {{/each}}
                    </div>
                </div>
                <div class="bg-white p-8 rounded-xl shadow-md">
                    <h3 class="text-2xl font-bold text-green-600 mb-6">After</h3>
                    <div class="space-y-4">
                        {{#each OUTCOMES}}
                        <div class="flex items-start">
                            <i class="fas fa-check text-green-500 mt-1 mr-3"></i>
                            <p class="text-gray-700">{{this}}</p>
                        </div>
                        {{/each}}
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Testimonial -->
    <section class="py-20">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div class="bg-gradient-to-r from-orange-500 to-pink-500 p-8 rounded-2xl text-white">
                <div class="flex justify-center mb-6">
                    <div class="flex space-x-1">
                        <i class="fas fa-star text-yellow-300"></i>
                        <i class="fas fa-star text-yellow-300"></i>
                        <i class="fas fa-star text-yellow-300"></i>
                        <i class="fas fa-star text-yellow-300"></i>
                        <i class="fas fa-star text-yellow-300"></i>
                    </div>
                </div>
                <blockquote class="text-xl mb-6">
                    "{{FOUNDER_MESSAGE}}"
                </blockquote>
                <p class="text-orange-100">- Product Creator</p>
            </div>
        </div>
    </section>

    <!-- Final CTA -->
    <section class="bg-gray-900 text-white py-20">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-3xl font-bold mb-4">Don't Wait - Get Started Today!</h2>
            <p class="text-xl mb-8 text-gray-300">Join thousands of happy customers</p>
            <div class="flex justify-center">
                <button class="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-10 py-4 rounded-full text-lg font-semibold hover:from-orange-600 hover:to-pink-600 transform hover:scale-105 transition duration-300">
                    {{CTA_TEXT}}
                </button>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; 2024 {{TITLE}}. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`,
    placeholders: [
      'TITLE', 'TAGLINE', 'HEADLINE', 'SUBHEADLINE', 'CTA_TEXT', 
      'KEY_FEATURES', 'FEATURE_DESCRIPTIONS', 'PAIN_POINTS', 'OUTCOMES', 'FOUNDER_MESSAGE'
    ]
  },

  // Template 4: Startup/Creative Template
  startup: {
    id: 'startup',
    name: 'Startup & Creative',
    description: 'Modern and creative design for startups and innovative projects',
    preview: '/templates/startup-preview.png',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}} - {{TAGLINE}}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .gradient-text {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
    </style>
</head>
<body class="bg-gray-900 text-white">
    <!-- Navigation -->
    <nav class="bg-gray-900/95 backdrop-blur-sm fixed w-full z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <h1 class="text-xl font-bold gradient-text">{{TITLE}}</h1>
                    </div>
                </div>
                <div class="flex items-center space-x-6">
                    <a href="#about" class="text-gray-300 hover:text-white transition">About</a>
                    <a href="#features" class="text-gray-300 hover:text-white transition">Features</a>
                    <a href="#contact" class="text-gray-300 hover:text-white transition">Contact</a>
                    <button class="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2 rounded-full hover:from-purple-600 hover:to-indigo-700 transition">
                        {{CTA_TEXT}}
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
            <div class="text-center">
                <h1 class="text-5xl md:text-7xl font-bold mb-6">
                    <span class="gradient-text">{{HEADLINE}}</span>
                </h1>
                <p class="text-xl md:text-2xl mb-12 text-gray-300 max-w-3xl mx-auto">
                    {{SUBHEADLINE}}
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <button class="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-600 hover:to-indigo-700 transform hover:scale-105 transition duration-300">
                        {{CTA_TEXT}}
                    </button>
                    <button class="border-2 border-purple-500 text-purple-300 px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-500 hover:text-white transition duration-300">
                        Watch Demo
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 bg-gray-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-bold mb-4">
                    <span class="gradient-text">Innovative Features</span>
                </h2>
                <p class="text-xl text-gray-400">Built for the future</p>
            </div>
            <div class="grid md:grid-cols-3 gap-8">
                {{#each KEY_FEATURES}}
                <div class="bg-gray-700/50 p-8 rounded-2xl backdrop-blur-sm border border-gray-600 hover:border-purple-500 transition duration-300">
                    <div class="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                        <i class="fas fa-lightbulb text-2xl text-white"></i>
                    </div>
                    <h3 class="text-xl font-semibold mb-4 text-white">{{this}}</h3>
                    <p class="text-gray-400">{{../FEATURE_DESCRIPTIONS.[{{@index}}]}}</p>
                </div>
                {{/each}}
            </div>
        </div>
    </section>

    <!-- Problem/Solution Section -->
    <section class="py-20 bg-gray-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-bold gradient-text mb-4">The Innovation</h2>
            </div>
            <div class="grid md:grid-cols-2 gap-12">
                <div>
                    <h3 class="text-2xl font-bold text-red-400 mb-8">Old Way</h3>
                    <div class="space-y-6">
                        {{#each PAIN_POINTS}}
                        <div class="flex items-start">
                            <div class="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center mr-4 mt-1">
                                <i class="fas fa-times text-red-400 text-sm"></i>
                            </div>
                            <p class="text-gray-300">{{this}}</p>
                        </div>
                        {{/each}}
                    </div>
                </div>
                <div>
                    <h3 class="text-2xl font-bold text-green-400 mb-8">Our Way</h3>
                    <div class="space-y-6">
                        {{#each OUTCOMES}}
                        <div class="flex items-start">
                            <div class="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-4 mt-1">
                                <i class="fas fa-check text-green-400 text-sm"></i>
                            </div>
                            <p class="text-gray-300">{{this}}</p>
                        </div>
                        {{/each}}
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Founder Section -->
    <section class="py-20 bg-gray-800">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div class="bg-gradient-to-r from-purple-500/10 to-indigo-600/10 p-8 rounded-3xl border border-purple-500/20">
                <div class="w-24 h-24 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <i class="fas fa-user text-2xl text-white"></i>
                </div>
                <blockquote class="text-xl text-gray-300 mb-6 italic">
                    "{{FOUNDER_MESSAGE}}"
                </blockquote>
                <p class="text-purple-400 font-semibold">Founder & Visionary</p>
            </div>
        </div>
    </section>

    <!-- Final CTA -->
    <section class="py-20 bg-gradient-to-r from-purple-900 to-indigo-900">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-4xl font-bold mb-6">Ready to Disrupt?</h2>
            <p class="text-xl mb-10 text-purple-200">Join the revolution and be part of the future</p>
            <button class="bg-white text-purple-900 px-12 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transform hover:scale-105 transition duration-300 shadow-2xl">
                {{CTA_TEXT}}
            </button>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 py-12 border-t border-gray-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p class="text-gray-400">&copy; 2024 {{TITLE}}. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`,
    placeholders: [
      'TITLE', 'TAGLINE', 'HEADLINE', 'SUBHEADLINE', 'CTA_TEXT', 
      'KEY_FEATURES', 'FEATURE_DESCRIPTIONS', 'PAIN_POINTS', 'OUTCOMES', 'FOUNDER_MESSAGE'
    ]
  }
};

module.exports = landingPageTemplates;

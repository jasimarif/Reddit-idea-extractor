import React from 'react';

const TestTemplatePreview = () => {
  const saasTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Product Name - Your compelling tagline</title>
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
                        <h1 class="text-xl font-bold text-blue-600">Your Product Name</h1>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="#features" class="text-gray-500 hover:text-gray-900">Features</a>
                    <a href="#pricing" class="text-gray-500 hover:text-gray-900">Pricing</a>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        Get Started Today
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
                    Transform Your Business with Our Solution
                </h1>
                <p class="text-xl md:text-2xl mb-8 text-blue-100">
                    We help businesses solve their biggest challenges with innovative solutions
                </p>
                <button class="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition duration-300">
                    Get Started Today
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
                <div class="text-center p-6 bg-white rounded-lg shadow-sm border">
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-rocket text-blue-600"></i>
                    </div>
                    <h3 class="text-lg font-semibold mb-2">Feature One</h3>
                    <p class="text-gray-600">Description for feature one</p>
                </div>
                <div class="text-center p-6 bg-white rounded-lg shadow-sm border">
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-rocket text-blue-600"></i>
                    </div>
                    <h3 class="text-lg font-semibold mb-2">Feature Two</h3>
                    <p class="text-gray-600">Description for feature two</p>
                </div>
                <div class="text-center p-6 bg-white rounded-lg shadow-sm border">
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-rocket text-blue-600"></i>
                    </div>
                    <h3 class="text-lg font-semibold mb-2">Feature Three</h3>
                    <p class="text-gray-600">Description for feature three</p>
                </div>
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
                        <div class="flex items-start">
                            <div class="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></div>
                            <p class="text-gray-700">Problem 1</p>
                        </div>
                        <div class="flex items-start">
                            <div class="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></div>
                            <p class="text-gray-700">Problem 2</p>
                        </div>
                        <div class="flex items-start">
                            <div class="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></div>
                            <p class="text-gray-700">Problem 3</p>
                        </div>
                    </div>
                </div>
                <div>
                    <h2 class="text-3xl font-bold text-gray-900 mb-6">Our Solution</h2>
                    <div class="space-y-4">
                        <div class="flex items-start">
                            <div class="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                            <p class="text-gray-700">Benefit 1</p>
                        </div>
                        <div class="flex items-start">
                            <div class="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                            <p class="text-gray-700">Benefit 2</p>
                        </div>
                        <div class="flex items-start">
                            <div class="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                            <p class="text-gray-700">Benefit 3</p>
                        </div>
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
                    "We're passionate about helping businesses succeed and grow."
                </blockquote>
                <p class="text-gray-600">- Founder, Your Product Name</p>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-blue-600 text-white py-20">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p class="text-xl mb-8 text-blue-100">Join thousands of satisfied customers</p>
            <button class="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition duration-300">
                Get Started Today
            </button>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; 2024 Your Product Name. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">SaaS Template Preview</h1>
      <div className="border rounded-lg overflow-hidden">
        <iframe
          srcDoc={saasTemplate}
          title="SaaS Template Preview"
          className="w-full h-[600px] border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
};

export default TestTemplatePreview;

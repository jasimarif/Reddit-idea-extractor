import React from 'react';
import { Brain, Instagram, Linkedin, Youtube, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-gray-200/50 py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-50/80 to-blue-50/40 backdrop-blur-sm mt-16">
      <div className="mx-auto max-w-[1300px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-10">
          <div className="flex items-center mb-8 md:mb-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center mr-4">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">Reddit Idea Extractor</span>
              <p className="text-sm text-gray-600 mt-1">Transforming ideas into solutions</p>
            </div>
          </div>

          <div className="flex space-x-6">
            <a
              href="#"
              className="text-pink-500 transition-all duration-200 p-3 rounded-lg hover:bg-pink-50 transform hover:scale-110"
            >
              <Instagram size={22} />
            </a>
            <a
              href="#"
              className="text-blue-600 transition-all duration-200 p-3 rounded-lg hover:bg-blue-50 transform hover:scale-110"
            >
              <Linkedin size={22} />
            </a>
            <a
              href="#"
              className="text-red-500 transition-all duration-200 p-3 rounded-lg hover:bg-red-50 transform hover:scale-110"
            >
              <Youtube size={22} />
            </a>
            <a
              href="#"
              className="text-blue-400 transition-all duration-200 p-3 rounded-lg hover:bg-blue-50 transform hover:scale-110"
            >
              <Twitter size={22} />
            </a>
          </div>
        </div>

        <div className="border-t border-gray-200/50 pt-8 mb-8">
          <nav className="flex flex-wrap gap-6 md:gap-10 justify-center">
            {[
              "Features",
              "Pricing",
              "FAQs",
              "Contact",
              "Privacy",
              "Terms",
            ].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm text-gray-600 hover:text-gray-900 transition-all duration-200 hover:scale-105 font-medium"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4 pt-4 border-t border-gray-200/30">
          <p className="font-medium">© 2025 Reddit Idea Extractor. All rights reserved.</p>
          <a
            href="mailto:ideaextractor@support.com"
            className="hover:text-blue-600 transition-colors duration-200 font-medium hover:underline"
          >
            ideaextractor@support.com
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

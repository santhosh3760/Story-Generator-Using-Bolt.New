import React, { useState } from 'react';
import OpenAI from 'openai';
import { BookOpen, Loader2, Sparkles } from 'lucide-react';

// Initialize OpenAI client with the existing API key from .env
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const genres = [
  'Fantasy', 'Science Fiction', 'Mystery', 'Romance', 
  'Horror', 'Adventure', 'Historical Fiction', 'Comedy'
];

function App() {
  const [keywords, setKeywords] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Fantasy');
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateStory = async () => {
    if (!keywords.trim()) {
      setError('Please enter some keywords');
      return;
    }

    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      setError('OpenAI API key is not configured');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: `Write a creative ${selectedGenre} story using these keywords: ${keywords}. 
                   The story should be engaging and approximately 300-500 words.`
        }],
        temperature: 0.8,
      });

      setStory(response.choices[0].message.content || '');
    } catch (err: any) {
      if (err?.error?.code === 'insufficient_quota') {
        setError('OpenAI API quota exceeded. Please check your billing details.');
      } else if (err?.error?.code === 'invalid_api_key') {
        setError('Invalid OpenAI API key. Please check your configuration.');
      } else {
        setError('Failed to generate story. Please try again later.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-800">Story Generator</h1>
          </div>
          <p className="text-gray-600">Create unique stories with AI using keywords and genres</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keywords
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Enter keywords (e.g., dragon, castle, princess)"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Genre
            </label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={generateStory}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Story...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Story
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>

        {story && (
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Story</h2>
            <div className="prose prose-purple">
              {story.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
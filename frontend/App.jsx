import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import LoadingScreen from './LoadingScreen'; // Make sure you have this file in your src folder

// Main App component for the entire portal
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('stories');

  useEffect(() => {
    // This effect runs once when the component is mounted
    setTimeout(() => {
      setIsLoading(false);
    }, 4000); // 4000 milliseconds = 4 seconds
  }, []);

  // Renders the correct component based on the current page state
  const renderPage = () => {
    switch (currentPage) {
      case 'stories':
        return <SuccessStoriesPage />;
      case 'policies':
        return <PoliciesPage />;
      case 'volunteers':
        return <VolunteersPage />;
      default:
        return <SuccessStoriesPage />;
    }
  };

  const navSpringProps = useSpring({
    from: { opacity: 0, x: -50 },
    to: { opacity: 1, x: 0 },
    config: { tension: 120, friction: 14 }
  });

  return (
    <AnimatePresence>
      {isLoading ? (
        <LoadingScreen key="loading" />
      ) : (
        <motion.div
          key="main-app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex min-h-screen bg-[#1A1A2E] text-gray-100 font-sans"
        >
          {/* Sidebar Navigation */}
          <animated.aside
            style={navSpringProps}
            className="w-64 bg-[#282C34] shadow-lg flex-shrink-0 p-6 flex flex-col items-center"
          >
            <div className="flex flex-col items-center justify-center my-8">
              <svg className="h-12 w-12 text-[#00E5A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.465 9.176 5 7 5a6 6 0 000 12.062M12 6.253C13.168 5.465 14.824 5 17 5a6 6 0 010 12.062M12 6.253v13" />
              </svg>
              <h1 className="text-2xl font-bold text-[#00E5A0] mt-2">Policy Saral</h1>
            </div>

            <nav className="w-full mt-4">
              <ul className="space-y-2">
                <li>
                  <ButtonNav
                    onClick={() => setCurrentPage('stories')}
                    isActive={currentPage === 'stories'}
                    text="Success Stories"
                  />
                </li>
                <li>
                  <ButtonNav
                    onClick={() => setCurrentPage('policies')}
                    isActive={currentPage === 'policies'}
                    text="Policy Simplifier"
                  />
                </li>
                <li>
                  <ButtonNav
                    onClick={() => setCurrentPage('volunteers')}
                    isActive={currentPage === 'volunteers'}
                    text="Volunteer Hub"
                  />
                </li>
              </ul>
            </nav>
          </animated.aside>

          {/* Main Content Area */}
          <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------
// Component for the navigation buttons
// ---------------------------------------------------
const ButtonNav = ({ onClick, isActive, text }) => {
  const [springProps, api] = useSpring(() => ({
    scale: 1,
    config: { mass: 1, tension: 500, friction: 26 },
  }));

  return (
    <animated.button
      style={springProps}
      onMouseEnter={() => api.start({ scale: 1.05 })}
      onMouseLeave={() => api.start({ scale: 1 })}
      onClick={onClick}
      className={`w-full text-left py-3 px-4 rounded-xl transition-colors duration-200 ${isActive ? 'bg-[#444C5C] text-white' : 'hover:bg-[#323642] text-gray-300'}`}
    >
      {text}
    </animated.button>
  );
};

// ---------------------------------------------------
// Animation variants for Framer Motion
// ---------------------------------------------------
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

// ---------------------------------------------------
// Component for the Success Stories Page
// ---------------------------------------------------
function SuccessStoriesPage() {
  const [stories, setStories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    location: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:5000/stories');
      if (!response.ok) {
        throw new Error('Failed to fetch stories.');
      }
      const data = await response.json();
      setStories(data);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Could not fetch stories. Please ensure the backend is running.');
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);
    try {
      const response = await fetch('http://127.0.0.1:5000/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        throw new Error('Failed to submit story.');
      }
      setSubmitMessage('Story submitted successfully!');
      setFormData({ title: '', content: '', author: '', location: '' });
      fetchStories();
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitMessage('Failed to submit story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formSpringProps = useSpring({
    from: { opacity: 0, y: 50 },
    to: { opacity: 1, y: 0 },
    config: { tension: 120, friction: 14 }
  });

  return (
    <div className="container mx-auto max-w-7xl">
      <header className="text-center my-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl font-extrabold text-[#00E5A0]"
        >
          Success Stories
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-2 text-lg text-gray-300"
        >
          Read and share how volunteers are making a difference in local communities.
        </motion.p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <animated.section
          style={formSpringProps}
          className="md:col-span-1 bg-[#282C34] p-8 rounded-2xl shadow-lg h-fit sticky top-8 border border-[#444C5C]"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-200">Share Your Story</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              name="title"
              placeholder="Story Title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full p-3 rounded-lg border border-[#444C5C] focus:outline-none focus:ring-2 focus:ring-[#00E5A0] bg-[#1A1A2E] text-gray-200"
            />
            <textarea
              name="content"
              placeholder="Your detailed success story..."
              value={formData.content}
              onChange={handleInputChange}
              required
              rows="6"
              className="w-full p-3 rounded-lg border border-[#444C5C] focus:outline-none focus:ring-2 focus:ring-[#00E5A0] bg-[#1A1A2E] text-gray-200"
            ></textarea>
            <input
              type="text"
              name="author"
              placeholder="Your Name"
              value={formData.author}
              onChange={handleInputChange}
              required
              className="w-full p-3 rounded-lg border border-[#444C5C] focus:outline-none focus:ring-2 focus:ring-[#00E5A0] bg-[#1A1A2E] text-gray-200"
            />
            <input
              type="text"
              name="location"
              placeholder="Location (Optional)"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg border border-[#444C5C] focus:outline-none focus:ring-2 focus:ring-[#00E5A0] bg-[#1A1A2E] text-gray-200"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={isSubmitting}
              className={`w-full p-4 rounded-xl font-semibold transition-transform duration-200 ${isSubmitting ? 'bg-gray-700 cursor-not-allowed' : 'bg-[#00E5A0] text-gray-900 shadow-md'}`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Story'}
            </motion.button>
          </form>
          {submitMessage && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className={`mt-4 text-center text-sm font-medium ${submitMessage.includes('successfully') ? 'text-[#00E5A0]' : 'text-red-400'}`}
            >
              {submitMessage}
            </motion.p>
          )}
        </animated.section>

        <section className="md:col-span-2 space-y-6">
          {loading && (
            <p className="text-center text-lg text-gray-400">Loading stories...</p>
          )}
          {error && (
            <p className="text-center text-lg text-red-400">{error}</p>
          )}
          {!loading && stories.length === 0 && !error && (
            <p className="text-center text-lg text-gray-400">
              No success stories have been shared yet. Be the first!
            </p>
          )}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {stories.map((story) => (
              <motion.div
                key={story.id}
                variants={itemVariants}
                className="bg-[#282C34] p-6 rounded-xl shadow-lg border border-[#444C5C] transform transition duration-200 hover:scale-[1.01] hover:shadow-2xl"
              >
                <h3 className="text-2xl font-bold text-[#00E5A0] mb-2">{story.title}</h3>
                <p className="text-sm text-gray-400 mb-4">
                  By <span className="font-medium text-gray-200">{story.author}</span> {story.location && `from ${story.location}`} on {new Date(story.timestamp).toLocaleDateString()}
                </p>
                <p className="text-gray-300 leading-relaxed">{story.content}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </main>
    </div>
  );
}

// ---------------------------------------------------
// Placeholder Component for the Policies Page
// ---------------------------------------------------
function PoliciesPage() {
  return (
    <div className="p-8 bg-[#282C34] rounded-2xl shadow-lg border border-[#444C5C]">
      <h2 className="text-2xl font-bold mb-4 text-[#00E5A0]">Policy Simplifier</h2>
      <p className="text-gray-300">
        This section is where you can build out the feature to simplify complex government policies using a language model.
      </p>
      <div className="mt-6 h-64 border border-dashed border-gray-500 rounded-xl flex items-center justify-center text-gray-400">
        <p>Your policy simplification UI goes here.</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------
// Placeholder Component for the Volunteers Page
// ---------------------------------------------------
function VolunteersPage() {
  return (
    <div className="p-8 bg-[#282C34] rounded-2xl shadow-lg border border-[#444C5C]">
      <h2 className="text-2xl font-bold mb-4 text-[#00E5A0]">Volunteer Hub</h2>
      <p className="text-gray-300">
        This section can be used for volunteer-related features, such as a forum or a list of available projects.
      </p>
      <div className="mt-6 h-64 border border-dashed border-gray-500 rounded-xl flex items-center justify-center text-gray-400">
        <p>Your volunteer management UI goes here.</p>
      </div>
    </div>
  );
}

// React 18+ way to render the app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

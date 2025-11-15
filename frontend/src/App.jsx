import { useState, useEffect } from 'react';
import { Star, Send, TrendingUp, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import './App.css';
// API Service
const API_BASE_URL = 'https://api.example.com'; // Replace with your actual API

const feedbackService = {
  getAllFeedbacks: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/feedbacks`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      return [];
    }
  },
  
  createFeedback: async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/feedbacks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  }
};

// Star Rating Component
const StarRating = ({ rating, setRating, readonly = false }) => {
  const [hover, setHover] = useState(0);
  
  return (
    <div className="star-container">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn ${readonly ? 'readonly' : ''}`}
          onClick={() => !readonly && setRating(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          disabled={readonly}
        >
          <Star
            size={28}
            fill={star <= (hover || rating) ? '#ff6b35' : 'none'}
            stroke={star <= (hover || rating) ? '#ff6b35' : '#ddd'}
            strokeWidth={2}
          />
        </button>
      ))}
    </div>
  );
};

// Analytics Card Component
const AnalyticsCard = ({ icon: Icon, title, value, subtitle, color }) => (
  <div className="analytics-card" style={{ borderLeft: `4px solid ${color}` }}>
    <div className="card-icon" style={{ backgroundColor: `${color}15` }}>
      <Icon size={24} color={color} />
    </div>
    <div className="card-content">
      <h3 className="card-value">{value}</h3>
      <p className="card-title">{title}</p>
      {subtitle && <p className="card-subtitle">{subtitle}</p>}
    </div>
  </div>
);

// Feedback Form Component
const FeedbackForm = ({ onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    rating: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    
    if (!formData.name || !formData.email || !formData.message || formData.rating === 0) {
      setError('Please fill all fields and select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await feedbackService.createFeedback({
        ...formData,
        createdAt: new Date().toISOString()
      });
      
      setFormData({ name: '', email: '', message: '', rating: 0 });
      onSubmitSuccess();
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-form">
      <h2 className="form-title">Share Your Feedback</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label>Full Name</label>
        <input
          type="text"
          placeholder="Enter your name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Email Address</label>
        <input
          type="email"
          placeholder="your.email@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Your Message</label>
        <textarea
          rows="4"
          placeholder="Tell us about your experience..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Rate Your Experience</label>
        <StarRating rating={formData.rating} setRating={(r) => setFormData({ ...formData, rating: r })} />
      </div>

      <button onClick={handleSubmit} className="submit-btn" disabled={isSubmitting}>
        <Send size={18} />
        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </div>
  );
};

// Feedback Table Component
const FeedbackTable = ({ feedbacks }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="feedback-table-container">
      <h2 className="section-title">All Feedbacks</h2>
      <div className="table-wrapper">
        <table className="feedback-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Rating</th>
              <th>Message</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">No feedbacks yet</td>
              </tr>
            ) : (
              feedbacks.map((feedback, index) => (
                <tr key={index}>
                  <td className="name-cell">{feedback.name}</td>
                  <td className="email-cell">{feedback.email}</td>
                  <td className="rating-cell">
                    <StarRating rating={feedback.rating} setRating={() => {}} readonly />
                  </td>
                  <td className="message-cell">{feedback.message}</td>
                  <td className="date-cell">{formatDate(feedback.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main App Component
export default function App() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFeedbacks = async () => {
    setLoading(true);
    const data = await feedbackService.getAllFeedbacks();
    setFeedbacks(data);
    setLoading(false);
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const calculateAnalytics = () => {
    const total = feedbacks.length;
    const avgRating = total > 0 
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(1)
      : 0;
    const positive = feedbacks.filter(f => f.rating >= 4).length;
    const negative = feedbacks.filter(f => f.rating < 3).length;

    return { total, avgRating, positive, negative };
  };

  const analytics = calculateAnalytics();

  return (
    <div className="app">

      <header className="header">
        <h1>Feedback Hub</h1>
        <p>We value your thoughts and experiences</p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#636e72' }}>
          <p style={{ fontSize: '1.2rem' }}>Loading feedbacks...</p>
        </div>
      ) : (
        <>
          <div className="analytics-grid">
            <AnalyticsCard
              icon={MessageSquare}
              title="Total Feedbacks"
              value={analytics.total}
              color="#ff6b35"
            />
            <AnalyticsCard
              icon={TrendingUp}
              title="Average Rating"
              value={analytics.avgRating}
              subtitle="out of 5.0"
              color="#f7b731"
            />
            <AnalyticsCard
              icon={ThumbsUp}
              title="Positive Feedback"
              value={analytics.positive}
              subtitle="Rating ≥ 4"
              color="#00b894"
            />
            <AnalyticsCard
              icon={ThumbsDown}
              title="Needs Improvement"
              value={analytics.negative}
              subtitle="Rating < 3"
              color="#fd79a8"
            />
          </div>

          <div className="main-grid">
            <FeedbackForm onSubmitSuccess={loadFeedbacks} />
            <FeedbackTable feedbacks={feedbacks} />
          </div>
        </>
      )}
    </div>
  );
}
import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const [linkedInJobs, setLinkedInJobs] = useState([]);
  const [linkedInLoading, setLinkedInLoading] = useState(true);
  const [linkedInFilter, setLinkedInFilter] = useState('');

  // Load local jobs
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://127.0.0.1:8000/jobs');
        if (!res.ok) throw new Error('Failed to fetch jobs');
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Load LinkedIn jobs
  useEffect(() => {
    const fetchLinkedInJobs = async () => {
      setLinkedInLoading(true);
      try {
        const res = await fetch(
          'http://127.0.0.1:8000/api/linkedin-jobs?query='
        );
        if (!res.ok) throw new Error('Failed to fetch LinkedIn jobs');
        const data = await res.json();
        setLinkedInJobs(data);
      } catch (err) {
        // Silently fail for placeholder
      } finally {
        setLinkedInLoading(false);
      }
    };
    fetchLinkedInJobs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewJob((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newJob.title || !newJob.company || !newJob.location || !newJob.description) {
      setError('All fields are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('http://127.0.0.1:8000/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Create job failed');
      }

      const created = await res.json();
      setJobs((prev) => [created, ...prev]);
      setNewJob({ title: '', company: '', location: '', description: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLinkedInJobs = linkedInJobs.filter((job) => {
    if (!linkedInFilter) return true;
    const q = linkedInFilter.toLowerCase();
    return (
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q) ||
      job.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className='app'>
      <header className='header'>
        <div className='logo'>
          <div className='logo-placeholder'>Apexon</div>
          <h1>Job Finder</h1>
        </div>
      </header>

      <main className='main'>
        <p className='tagline'>Simple job board with your own data + LinkedIn jobs</p>

        {error && (
          <div className='error'>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className='job-form'>
          <h2>Add a new job</h2>

          <div className='form-row'>
            <label>Title
              <input type='text' name='title' value={newJob.title} onChange={handleChange} />
            </label>
          </div>

          <div className='form-row'>
            <label>Company
              <input type='text' name='company' value={newJob.company} onChange={handleChange} />
            </label>
          </div>

          <div className='form-row'>
            <label>Location
              <input type='text' name='location' value={newJob.location} onChange={handleChange} />
            </label>
          </div>

          <div className='form-row'>
            <label>Description
              <textarea name='description' value={newJob.description} onChange={handleChange} rows={4} />
            </label>
          </div>

          <button type='submit' disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Job'}
          </button>
        </form>

        <section className='section'>
          <h2>Local Jobs</h2>
          {loading && <p>Loading jobs...</p>}
          {!loading && (
            <div className='job-list'>
              {jobs.length === 0 ? (
                <p>No jobs found.</p>
              ) : (
                jobs.map((job) => (
                  <div className='job-card' key={job.id}>
                    <h3>{job.title}</h3>
                    <h4>{job.company}</h4>
                    <p><strong>Location:</strong> {job.location}</p>
                    <p>{job.description}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        <section className='section linkedin-section'>
          <h2>LinkedIn Jobs</h2>

          <div className='search-bar'>
            <input
              type='text'
              placeholder='Search by title, company, or location...'
              value={linkedInFilter}
              onChange={(e) => setLinkedInFilter(e.target.value)}
            />
          </div>

          {linkedInLoading && <p>Loading LinkedIn jobs...</p>}

          {!linkedInLoading && (
            <div className='job-list'>
              {filteredLinkedInJobs.length === 0 ? (
                <p>No LinkedIn jobs found.</p>
              ) : (
                filteredLinkedInJobs.map((job, idx) => (
                  <div className='job-card linkedin-job-card' key={idx}>
                    <h3>{job.title}</h3>
                    <h4>{job.company}</h4>
                    <p><strong>Location:</strong> {job.location}</p>
                    <p>{job.description}</p>
                    <span className='source-tag'>Source: {job.source}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </main>

      <footer className='footer'>
        <p>Job Finder &copy; 2026. Built with React, FastAPI, and PostgreSQL.</p>
      </footer>
    </div>
  );
}

export default App;

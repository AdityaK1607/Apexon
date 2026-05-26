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

  return (
    <div className='container'>
      <h1>Job Finder</h1>
      <p>Simple job board with your own data</p>

      {error && <div className='error'><p>{error}</p></div>}

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

      {loading && <p>Loading jobs...</p>}

      {!loading && (
        <div className='job-list'>
          {jobs.length === 0 ? <p>No jobs found.</p> : jobs.map((job) => (
            <div className='job-card' key={job.id}>
              <h2>{job.title}</h2>
              <h3>{job.company}</h3>
              <p><strong>Location:</strong> {job.location}</p>
              <p>{job.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;

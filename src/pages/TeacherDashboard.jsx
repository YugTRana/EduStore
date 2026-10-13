import { useEffect, useRef, useState } from 'react';
import DashboardShell from '../components/DashboardShell.jsx';
import { useAuth } from '../context/useAuth.js';
import {
  getMaterialErrorMessage,
  subscribeToTeacherMaterials,
  uploadTeacherMaterial,
  validateMaterialFile,
} from '../services/materialService.js';

const SUBJECT_SUGGESTIONS = ['Computer Science', 'Mathematics', 'Physics', 'Business Studies'];

function TeacherDashboard() {
  const { user, profile } = useAuth();
  const fileInput = useRef(null);
  const [title, setTitle] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!user?.uid) return undefined;

    return subscribeToTeacherMaterials(
      user.uid,
      (teacherMaterials) => {
        setMaterials(teacherMaterials);
        setLoadingMaterials(false);
      },
      (subscriptionError) => {
        setError(getMaterialErrorMessage(subscriptionError));
        setLoadingMaterials(false);
      },
    );
  }, [user?.uid]);

  async function handleUpload(event) {
    event.preventDefault();
    setError('');
    setNotice('');

    const fileError = validateMaterialFile(file);
    if (fileError) {
      setError(fileError);
      return;
    }

    setSubmitting(true);
    try {
      await uploadTeacherMaterial({
        file,
        title,
        subjectName,
        description,
        teacherId: user.uid,
        teacherName: profile?.name || user.displayName || user.email,
        onProgress: setUploadProgress,
      });
      setTitle('');
      setSubjectName('');
      setDescription('');
      setFile(null);
      setUploadProgress(0);
      if (fileInput.current) fileInput.current.value = '';
      setNotice('Your material was uploaded.');
    } catch (uploadError) {
      setError(getMaterialErrorMessage(uploadError));
    } finally {
      setSubmitting(false);
    }
  }

  function formatUploadDate(timestamp) {
    const date = timestamp?.toDate ? timestamp.toDate() : timestamp;
    if (!date) return 'Just now';
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
  }

  return (
    <DashboardShell
      role="Teacher"
      title="Your teaching shelf"
      description="Upload notes and learning resources under a subject. You can manage only the materials you upload."
    >
      <section className="material-upload-section" aria-labelledby="material-upload-title">
        <div className="material-section-heading">
          <div>
            <p className="eyebrow eyebrow-dark">ADD TO THE SHARED SHELF</p>
            <h2 id="material-upload-title">Upload material</h2>
          </div>
          <p>PDF, Word, PowerPoint, or image files up to 10 MB.</p>
        </div>

        <form className="material-upload-form" onSubmit={handleUpload}>
          <label className="auth-field">
            <span>Material title</span>
            <input maxLength="100" onChange={(event) => setTitle(event.target.value)} required value={title} />
          </label>
          <label className="auth-field">
            <span>Subject name</span>
            <input list="material-subject-suggestions" maxLength="80" onChange={(event) => setSubjectName(event.target.value)} required value={subjectName} />
            <datalist id="material-subject-suggestions">
              {SUBJECT_SUGGESTIONS.map((subject) => <option key={subject} value={subject} />)}
            </datalist>
          </label>
          <label className="auth-field">
            <span>Short description <span className="optional-label">Optional</span></span>
            <textarea maxLength="300" onChange={(event) => setDescription(event.target.value)} rows="3" value={description} />
          </label>
          <label className="auth-field">
            <span>Choose a file</span>
            <input
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              ref={fileInput}
              required
              type="file"
            />
          </label>
          {error && <p className="auth-error material-message" role="alert">{error}</p>}
          {notice && <p className="material-success" role="status">{notice}</p>}
          {submitting && (
            <div className="material-upload-progress" role="status">
              <progress aria-label="File upload progress" max="100" value={uploadProgress} />
              <span>{uploadProgress === 100 ? 'Saving material details...' : `Uploading ${uploadProgress}%...`}</span>
            </div>
          )}
          <button className="auth-submit material-submit" disabled={submitting} type="submit">
            {submitting ? 'Please wait...' : 'Upload material'} <span aria-hidden="true">↗</span>
          </button>
        </form>
      </section>

      <section className="materials-section" aria-labelledby="your-materials-title">
        <div className="material-section-heading materials-list-heading">
          <div>
            <p className="eyebrow eyebrow-dark">YOUR UPLOADS</p>
            <h2 id="your-materials-title">Materials you added</h2>
          </div>
          <span className="material-count">{materials.length} {materials.length === 1 ? 'item' : 'items'}</span>
        </div>
        {loadingMaterials ? (
          <p className="material-empty">Loading your materials...</p>
        ) : materials.length === 0 ? (
          <div className="material-empty">
            <h3>Your shelf is ready.</h3>
            <p>Uploaded files will appear here after you add your first material.</p>
          </div>
        ) : (
          <div className="material-list">
            {materials.map((material) => (
              <article className="material-item" key={material.id}>
                <div className="material-file-mark" aria-hidden="true">{material.contentType?.startsWith('image/') ? 'IMG' : 'DOC'}</div>
                <div className="material-item-copy">
                  <h3>{material.title}</h3>
                  <p>{material.subjectName} <span aria-hidden="true">·</span> {material.fileName}</p>
                  {material.description && <p className="material-item-description">{material.description}</p>}
                </div>
                <time className="material-date">{formatUploadDate(material.uploadedAt)}</time>
                <div className="material-item-actions">
                  <a href={material.fileUrl} rel="noreferrer" target="_blank">Open file ↗</a>
                </div>
              </article>
            ))}
          </div>
        )}
        <p className="material-management-note">Cloudinary file deletion will be enabled through a secure backend so API secrets stay out of the browser.</p>
      </section>
    </DashboardShell>
  );
}

export default TeacherDashboard;
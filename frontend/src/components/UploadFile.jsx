import { useState } from 'react';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const UploadFile = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.includes('image')) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select an image file');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('No file selected');
      return;
    }

    const fileName = `vegetables/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progressPercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progressPercent);
      },
      (error) => {
        setError('Upload failed: ' + error.message);
        setProgress(0);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setDownloadURL(url);
        setProgress(0);
        setFile(null);
        if (onUploadSuccess) {
          onUploadSuccess(url); // Pass URL to parent component
        }
      }
    );
  };

  return (
    <div className='row'>
      <div className='col-md-3'>
        <input type="file" accept="image/*" onChange={handleFileChange} className="form-control" />
      </div>
      <div className='col-md-6'>
        <button
          className="btn btn-primary"
          onClick={handleUpload} disabled={!file || progress > 0}>
          Upload
        </button>
      </div>

      {progress > 0 && <p>Uploading: {progress.toFixed(2)}%</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {downloadURL && (
        <div>
          <p>Image uploaded successfully!</p>
          <a href={downloadURL} target="_blank" rel="noopener noreferrer">
            View Image
          </a>
        </div>
      )}
    </div>
  );
};

export default UploadFile;
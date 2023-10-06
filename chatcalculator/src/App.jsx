import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [fileList, setFileList] = useState([]);
  const [fileData, setFileData] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    const selectedFiles = event.dataTransfer.files;
    const filesArray = Array.from(selectedFiles);
    setFileList(filesArray);
    setFileData([]);
  };

  const handleFileChange = (event) => {
    const selectedFiles = event.target.files;
    const filesArray = Array.from(selectedFiles);
    setFileList(filesArray);
    setFileData([]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    const validFiles = [];
    const invalidFiles = [];

    for (const file of fileList) {
      // Check if the file is not empty and has a .txt extension
      if (file.size > 0 && file.type === "text/plain" && file.name.endsWith(".txt")) {
        validFiles.push(file);
        formData.append("files", file);
      } else {
        invalidFiles.push(file.name);
      }
    }

    if (invalidFiles.length > 0) {
      alert(`${invalidFiles.length} files are not valid .txt files:\n${invalidFiles.join('\n')}`);
    }

    if (validFiles.length === 0 && invalidFiles.length < 1) {
      alert("No valid files selected to upload.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setFileData(response.data);
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  return (
    <>
      <div className="grid-container">
        <div className="grid-item">
          <h2>Upload log files (.txt)</h2>
          <div
            className={`drop-area ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text">
              <span>Drop files here or browse file</span>
            </div>
            <input type="file" id='file' onChange={handleFileChange} multiple />
          </div>
          <br />
          <button onClick={handleUpload}>Upload</button>
          <br />
          <br />
          <h2>Uploaded Files:</h2>
          {fileList.length > 0 ? (
            <ol>
              {fileList.map((file, index) => (
                <li key={`${file.name}-${index}`}>
                  {file.name}
                </li>
              ))}
            </ol>
          ) : (
            <p>No files uploaded</p>
          )}
        </div>

        <div className="grid-item">
          <div className="file-contents">
            <h2>Results:</h2>
            <ul>
              {fileData.map((file, index) => (
                <p key={index}>
                  <strong>{file.name} :</strong> <br />
                  <ol>
                    {Object.entries(file.wordCountsByUser).map(([username, count]) => (
                      <li key={username}>
                        {username} - {count}
                      </li>
                    ))}
                  </ol>
                </p>
              ))}
            </ul>
          </div>
        </div>
      </div >
    </>
  );
}

export default App;
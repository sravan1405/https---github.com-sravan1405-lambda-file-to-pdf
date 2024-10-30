import React, { useState } from 'react';
import axios from 'axios';
import './FileUpload.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileDownload } from '@fortawesome/free-solid-svg-icons';


const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert('Please select a file to upload.');
            return;
        }

        setLoading(true);
        const reader = new FileReader();

        reader.onloadend = async () => {
            const base64data = reader.result.split(',')[1]; // Get base64 string without metadata
            const fileType = file.type;
            try {
                const response = await axios.post(
                    'https://i8gvb7n037.execute-api.us-east-1.amazonaws.com/convertToPDF', // Replace with your API Gateway endpoint
                    {
                        fileContent: base64data,
                        fileType: fileType,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );

                const pdfBase64 = response.data; // Assuming response contains base64 encoded PDF
                // const blob = new Blob([pdfBase64], { type: 'application/pdf' });
                const blob = new Blob([new Uint8Array(atob(pdfBase64).split('').map(char => char.charCodeAt(0)))], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                setPdfUrl(url);
            } catch (error) {
                console.error('Error uploading file:', error);
                alert('Failed to upload file. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        reader.readAsDataURL(file);
    };

    return (
        <div className="container">
            <h1>File to PDF Converter</h1>
            <input type="file" onChange={handleFileChange} className="file-input" />
            <button onClick={handleUpload} disabled={loading} className="convert-btn">
                {loading ? 'Uploading...' : 'Upload and Convert'}
            </button>
            {pdfUrl && (
                <div className="download-section">
                    <a href={pdfUrl} download="output.pdf" className="download-link">
                        <FontAwesomeIcon icon={faFileDownload} />Download File
                    </a>
                </div>
            )}
        </div>
    );
};

export default FileUpload;

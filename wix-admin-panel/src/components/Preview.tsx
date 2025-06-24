import React from 'react';

interface PreviewProps {
    title: string;
    content: string;
    thumbnailUrl: string;
    youtubeLink: string;
}

const Preview: React.FC<PreviewProps> = ({ title, content, thumbnailUrl, youtubeLink }) => {
    return (
        <div className="preview-container">
            <h2 className="preview-title">{title}</h2>
            <img src={thumbnailUrl} alt="Thumbnail" className="preview-thumbnail" />
            <div className="preview-content">{content}</div>
            {youtubeLink && (
                <div className="preview-youtube">
                    <iframe
                        width="560"
                        height="315"
                        src={youtubeLink}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            )}
        </div>
    );
};

export default Preview;
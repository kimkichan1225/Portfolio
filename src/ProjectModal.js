import React, { useEffect, useState } from 'react';
import './ProjectModal.css';

export function ProjectModal({ project, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  if (!project) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        {project.video ? (
          <div className="modal-video-container">
            <video src={project.video} controls loop muted className="modal-video">
              Your browser does not support the video tag.
            </video>
          </div>
        ) : project.image && (
          <div className="modal-image-container">
            <img src={project.image} alt={project.title} className="modal-image" />
          </div>
        )}

        <div className="modal-body">
          <h2 className="modal-title">{project.title}</h2>

          {project.tech && project.tech.length > 0 && (
            <div className="modal-tech-stack">
              {project.tech.map((tech, index) => (
                <span key={index} className="tech-tag">
                  {tech}
                </span>
              ))}
            </div>
          )}

          <p className="modal-description">{project.description}</p>

          {/* Navigation Tabs */}
          <div className="modal-tabs">
            <button
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              개요
            </button>
            <button
              className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
              onClick={() => setActiveTab('achievements')}
            >
              성과
            </button>
            <button
              className={`tab-button ${activeTab === 'challenges' ? 'active' : ''}`}
              onClick={() => setActiveTab('challenges')}
            >
              문제해결 사례
            </button>
            {(project.report || project.reports) && (
              <button
                className={`tab-button ${activeTab === 'report' ? 'active' : ''}`}
                onClick={() => setActiveTab('report')}
              >
                보고서
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'overview' && project.overview && (
              <div className="modal-details">
                <h3>프로젝트 개요</h3>
                <div className="overview-sections">
                  {(() => {
                    let currentSection = null;
                    let sectionItems = [];
                    const sections = [];

                    project.overview.forEach((item, index) => {
                      if (item.startsWith('[ ') && item.endsWith(' ]')) {
                        // 이전 섹션 저장
                        if (currentSection) {
                          sections.push({ title: currentSection, items: sectionItems });
                          sectionItems = [];
                        }
                        currentSection = item.replace(/\[|\]/g, '').trim();
                      } else if (item !== '') {
                        sectionItems.push(item);
                      }
                    });

                    // 마지막 섹션 저장
                    if (currentSection) {
                      sections.push({ title: currentSection, items: sectionItems });
                    }

                    // 섹션 렌더링
                    return sections.map((section, idx) => (
                      <div key={idx} className="overview-section-card">
                        <div className="overview-section-header">
                          <span className="section-icon">
                            {section.title === '개요' ? '📋' :
                             section.title === '기간' ? '📅' :
                             section.title === '주요 기능' ? '⚡' : '📌'}
                          </span>
                          <h4 className="section-title">{section.title}</h4>
                        </div>
                        <div className="overview-section-content">
                          {section.items.map((item, i) => (
                            <div key={i} className="overview-item">{item}</div>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {activeTab === 'achievements' && project.achievements && (
              <div className="modal-details">
                <h3>주요 성과</h3>
                <ul>
                  {project.achievements.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'challenges' && project.challenges && (
              <div className="modal-details">
                <h3>문제해결 사례</h3>
                {project.challenges.map((challenge, index) => {
                  // Parse description into problem, solution, result
                  const parts = challenge.description.split('\n');
                  const problemText = parts.find(p => p.startsWith('문제:'))?.replace('문제:', '').trim();
                  const solutionText = parts.find(p => p.startsWith('해결책:'))?.replace('해결책:', '').trim();
                  const resultText = parts.find(p => p.startsWith('결과:'))?.replace('결과:', '').trim();

                  return (
                    <div key={index} className="challenge-item-card">
                      <h4 className="challenge-title">
                        <span className="challenge-number">{index + 1}</span>
                        {challenge.title}
                      </h4>
                      <div className="challenge-content">
                        {problemText && (
                          <div className="challenge-section problem-section">
                            <div className="section-label">
                              <span className="label-icon">❗</span>
                              <strong>문제</strong>
                            </div>
                            <p className="section-text">{problemText}</p>
                          </div>
                        )}
                        {solutionText && (
                          <div className="challenge-section solution-section">
                            <div className="section-label">
                              <span className="label-icon">💡</span>
                              <strong>해결책</strong>
                            </div>
                            <p className="section-text">{solutionText}</p>
                          </div>
                        )}
                        {resultText && (
                          <div className="challenge-section result-section">
                            <div className="section-label">
                              <span className="label-icon">✅</span>
                              <strong>결과</strong>
                            </div>
                            <p className="section-text">{resultText}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Fallback for old data structure */}
            {activeTab === 'overview' && !project.overview && project.details && (
              <div className="modal-details">
                <h3>주요 기능</h3>
                <ul>
                  {project.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'report' && project.reports && (
              <div className="modal-report">
                <h3>프로젝트 문서</h3>
                <div className="reports-grid">
                  {project.reports.map((report, index) => (
                    <div key={index} className="report-item">
                      <h4>{report.title}</h4>
                      <div className="pdf-container-small">
                        <iframe
                          src={report.file}
                          title={report.title}
                          className="pdf-viewer"
                        />
                      </div>
                      <a
                        href={report.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="download-link-small"
                      >
                        📄 {report.title} 다운로드
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'report' && project.report && !project.reports && (
              <div className="modal-report">
                <h3>프로젝트 보고서</h3>
                <div className="pdf-container">
                  <iframe
                    src={project.report}
                    title="프로젝트 보고서"
                    className="pdf-viewer"
                  />
                </div>
                <div className="report-download">
                  <a
                    href={project.report}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="download-link"
                  >
                    📄 PDF 다운로드
                  </a>
                </div>
              </div>
            )}
          </div>

          {(project.github || project.demo) && (
            <div className="modal-links">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-link github-link"
                >
                  GitHub
                </a>
              )}
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-link demo-link"
                >
                  {project.demo.includes('releases/download') ? 'Download Game' : 'Live Demo'}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

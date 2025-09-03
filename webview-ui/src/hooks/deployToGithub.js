import { useState } from 'react';

export function useDeployToGitHub() {
  const [gitLog, setGitLog] = useState('');
  const [deployedURL, setDeployedURL] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  function parseOwnerRepo(remoteUrl) {
    const match = remoteUrl.match(/github\.com[:/]{1,2}([^/]+)\/([^/.]+)(?:\.git)?$/);
    return match ? { owner: match[1], repo: match[2] } : null;
  }

  const deployToGitHub = async (gitRemoteURL, githubToken, pulledHTML) => {
    setShowSuccess(false);
    setShowError(false);

    const htmlContent = pulledHTML;
    const parsed = parseOwnerRepo(gitRemoteURL);
    const token = githubToken;

    if (!parsed || !token) {
      setShowError(true);
      setShowSuccess(false);
      setGitLog(prev => prev + '❌ Missing info\n');
      return;
    }

    const { owner, repo } = parsed;

    try {
      const response = await fetch('http://localhost:4000/deployForm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, owner, repo, htmlContent }),
      });

      const data = await response.json();

      if (data.success) {
        setDeployedURL(data.url);
        setShowSuccess(true);
        setShowError(false);
        setGitLog(prev => prev + `✔️ Deployed form to ${data.url}\n`);
      } else {
        setShowError(true);
        setShowSuccess(false);
        setGitLog(prev => prev + `❌ Deployment failed: ${data.message}\n`);
      }
    } catch (err) {
      setShowError(true);
      setShowSuccess(false);
      setGitLog(prev => prev + `❌ Deployment error: ${err.message}\n`);
    }
  };

  return {
    gitLog,
    deployedURL,
    showSuccess,
    showError,
    deployToGitHub,
    setGitLog,
    setDeployedURL,
    setShowSuccess,
    setShowError,
  };
}

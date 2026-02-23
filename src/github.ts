const CACHE_PREFIX = 'gh_cache_';

function getCache(key: string) {
  try {
    const val = localStorage.getItem(CACHE_PREFIX + key);
    if (val) return JSON.parse(val);
  } catch (e) {}
  return null;
}

function setCache(key: string, val: any) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(val));
  } catch (e) {}
}

export async function fetchRepos(username: string, pat: string) {
  const cacheKey = `repos_${username}`;
  const cached = getCache(cacheKey);
  
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (pat) headers.Authorization = `token ${pat}`;
  
  const fetchPromise = fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers })
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch repos');
      return res.json();
    })
    .then(data => {
      setCache(cacheKey, data);
      return data;
    });

  if (cached) return { data: cached, promise: fetchPromise };
  const data = await fetchPromise;
  return { data, promise: Promise.resolve(data) };
}

export async function fetchBranches(owner: string, repo: string, pat: string) {
  const cacheKey = `branches_all_${owner}_${repo}`;
  const cached = getCache(cacheKey);
  
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (pat) headers.Authorization = `token ${pat}`;
  
  const fetchPromise = fetch(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`, { headers })
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch branches');
      return res.json();
    })
    .then(data => {
      setCache(cacheKey, data);
      return data;
    });

  if (cached) return { data: cached, promise: fetchPromise };
  const data = await fetchPromise;
  return { data, promise: Promise.resolve(data) };
}

export async function fetchTree(owner: string, repo: string, branch: string, pat: string) {
  const cacheKey = `tree_${owner}_${repo}_${branch}`;
  const cached = getCache(cacheKey);
  
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (pat) headers.Authorization = `token ${pat}`;
  
  const fetchPromise = fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, { headers })
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch tree');
      return res.json();
    })
    .then(data => {
      setCache(cacheKey, data);
      return data;
    });

  if (cached) return { data: cached, promise: fetchPromise };
  const data = await fetchPromise;
  return { data, promise: Promise.resolve(data) };
}

export async function fetchPRs(owner: string, repo: string, pat: string) {
  const cacheKey = `prs_${owner}_${repo}`;
  const cached = getCache(cacheKey);
  
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (pat) headers.Authorization = `token ${pat}`;
  
  const fetchPromise = fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=100`, { headers })
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch PRs');
      return res.json();
    })
    .then(data => {
      setCache(cacheKey, data);
      return data;
    });

  if (cached) return { data: cached, promise: fetchPromise };
  const data = await fetchPromise;
  return { data, promise: Promise.resolve(data) };
}

export async function fetchIssues(owner: string, repo: string, pat: string) {
  const cacheKey = `issues_${owner}_${repo}`;
  const cached = getCache(cacheKey);
  
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (pat) headers.Authorization = `token ${pat}`;
  
  const fetchPromise = fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100`, { headers })
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch issues');
      return res.json();
    })
    .then(data => {
      const issuesOnly = data.filter((issue: any) => !issue.pull_request);
      setCache(cacheKey, issuesOnly);
      return issuesOnly;
    });

  if (cached) return { data: cached, promise: fetchPromise };
  const data = await fetchPromise;
  return { data, promise: Promise.resolve(data) };
}

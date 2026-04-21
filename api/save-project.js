// api/save-project.js
// Vercel serverless function — receives new building data, writes files to GitHub,
// which triggers an automatic Vercel redeploy.
//
// Requires GITHUB_TOKEN env variable set in Vercel project settings.
// Repo: livemodern/mlg-new-construction

const REPO = 'livemodern/mlg-new-construction';
const BRANCH = 'main';
const API = 'https://api.github.com';

async function githubRequest(path, method, body, token) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `GitHub API error ${res.status}`);
  return data;
}

async function getFileSHA(path, token) {
  try {
    const data = await githubRequest(
      `/repos/${REPO}/contents/${path}?ref=${BRANCH}`,
      'GET', null, token
    );
    return data.sha;
  } catch {
    return null; // file doesn't exist yet
  }
}

async function writeFile(path, content, message, token) {
  const sha = await getFileSHA(path, token);
  const body = {
    message,
    content: Buffer.from(content, 'utf8').toString('base64'),
    branch: BRANCH,
    ...(sha ? { sha } : {}),
  };
  return githubRequest(`/repos/${REPO}/contents/${path}`, 'PUT', body, token);
}

function generateBuildingFile(project) {
  // Serialize the project object as a clean JS module
  const json = JSON.stringify(project, null, 2);
  const id = project.id;
  return `const ${id} = ${json};\n\nexport default ${id};\n`;
}

async function updateIndex(newId, token) {
  // Read current index to get existing imports
  let existingIds = [];
  try {
    const data = await githubRequest(
      `/repos/${REPO}/contents/src/data/index.js?ref=${BRANCH}`,
      'GET', null, token
    );
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    // Parse existing imports
    const importMatches = content.matchAll(/^import (\w+) from/gm);
    for (const match of importMatches) {
      existingIds.push(match[1]);
    }
  } catch {
    // index.js doesn't exist yet
  }

  // Add new id if not already present
  if (!existingIds.includes(newId)) {
    existingIds.push(newId);
  }

  const imports = existingIds
    .map(id => `import ${id} from './${id}.js';`)
    .join('\n');

  const projectEntries = existingIds.map(id => `  ${id},`).join('\n');

  const indexContent = `// ─── MLG New Construction — Building Registry ────────────────────────────────
// To add a new building: import its data file here and add it to PROJECTS.
// Each building lives in its own file: src/data/buildingname.js
// ─────────────────────────────────────────────────────────────────────────────

${imports}

const PROJECTS = {
${projectEntries}
};

export default PROJECTS;
`;

  await writeFile(
    'src/data/index.js',
    indexContent,
    `Add ${newId} to building registry`,
    token
  );
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.GITHUB_TOKEN;
  if (!token) return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });

  try {
    const { project } = req.body;

    if (!project?.id || !project?.name) {
      return res.status(400).json({ error: 'project.id and project.name are required' });
    }

    // Sanitize id — lowercase letters/numbers/hyphens only
    const id = project.id.toLowerCase().replace(/[^a-z0-9]/g, '');
    project.id = id;

    // 1. Write the building data file
    const fileContent = generateBuildingFile(project);
    await writeFile(
      `src/data/${id}.js`,
      fileContent,
      `Add ${project.name} building data`,
      token
    );

    // 2. Update the index to include the new building
    await updateIndex(id, token);

    return res.status(200).json({
      success: true,
      message: `${project.name} added successfully. Vercel will redeploy in ~60 seconds.`,
      id,
    });

  } catch (err) {
    console.error('save-project error:', err);
    return res.status(500).json({ error: err.message });
  }
}

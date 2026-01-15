import { getUncachableGitHubClient } from '../server/lib/github-client';

async function mergePR() {
  const octokit = await getUncachableGitHubClient();
  const owner = 'MundoTango';
  const repo = 'Mundo-Tango';
  const prNumber = 64;
  
  console.log('Attempting to merge PR #64...');
  
  try {
    const { data: result } = await octokit.pulls.merge({
      owner,
      repo,
      pull_number: prNumber,
      commit_title: 'feat(admin): add password reset functionality for admins (#64)',
      merge_method: 'squash',
    });
    
    console.log('\n✅ PR #64 merged successfully!');
    console.log('SHA:', result.sha);
    console.log('Merged:', result.merged);
    console.log('Message:', result.message);
  } catch (error: any) {
    console.error('\n❌ Failed to merge PR:', error.message);
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

mergePR();

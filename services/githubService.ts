
export interface GitHubSyncData {
  userProfile: any;
  transactions: any[];
  categories: any[];
  budgets: any[];
  routines: any[];
}

const GIST_FILENAME = 'finance_routine_db.json';
const GIST_DESCRIPTION = 'Finance&Routine App Data Backup';

export const githubService = {
  async getGist(token: string) {
    const response = await fetch('https://api.github.com/gists', {
      headers: { Authorization: `token ${token}` }
    });
    const gists = await response.json();
    return gists.find((g: any) => g.description === GIST_DESCRIPTION);
  },

  async createGist(token: string, data: GitHubSyncData) {
    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: GIST_DESCRIPTION,
        public: false,
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(data, null, 2)
          }
        }
      })
    });
    return response.json();
  },

  async updateGist(token: string, gistId: string, data: GitHubSyncData) {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(data, null, 2)
          }
        }
      })
    });
    return response.json();
  },

  async downloadData(token: string, gistId: string): Promise<GitHubSyncData | null> {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: { Authorization: `token ${token}` }
    });
    const gist = await response.json();
    const content = gist.files[GIST_FILENAME]?.content;
    return content ? JSON.parse(content) : null;
  }
};

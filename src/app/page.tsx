'use client'
import { useState, useRef } from 'react'
import { Barcode } from '@/app/components/Barcode'
import { ShareButtons } from '@/app/components/ShareButtons'

interface GitHubRepo {
  name: string
  stargazers_count: number
  forks_count: number
  size: number
  language: string | null
  pushed_at: string
  created_at: string
}

interface GitHubUser {
  login: string
  name: string | null
  followers: number
  following: number
  public_repos: number
  created_at: string
  location: string | null
  public_gists: number
}

const FORTUNE_MESSAGES = [
  "Your next commit will be bug-free! 🪲",
  "A great PR is in your future! 🔮",
  "Today is a good day to refactor! ♻️",
  "Your code will make someone smile! 😊",
  "A mysterious bug will soon reveal itself! 🕵️",
];

const FAMOUS_DEVS = [
  "Linus Torvalds",
  "Ada Lovelace",
  "Grace Hopper",
  "Alan Turing",
  "Margaret Hamilton",
];

async function getGitHubStats(username: string) {
  const [userResponse, reposResponse] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`),
    fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`)
  ]);

  if (!userResponse.ok) throw new Error('User not found');
  
  const userData = await userResponse.json() as GitHubUser;
  const reposData = await reposResponse.json() as GitHubRepo[];

  // Calculate repository stats
  const totalStars = reposData.reduce((acc: number, repo) => acc + repo.stargazers_count, 0);
  const totalForks = reposData.reduce((acc: number, repo) => acc + repo.forks_count, 0);
  const totalSize = reposData.reduce((acc: number, repo) => acc + repo.size, 0);

  // Get language stats
  const languages = reposData
    .map(repo => repo.language)
    .filter((lang): lang is string => lang !== null);
  
  // Count occurrences of each language
  const langCount = languages.reduce((acc: Record<string, number>, lang) => {
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {});

  // Get top 3 most used languages
  const topLanguages = Object.entries(langCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([lang]) => lang)
    .join(', ');

  // Calculate active days in last month
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentActivity = reposData.filter(repo => 
    new Date(repo.pushed_at) > thirtyDaysAgo
  ).length;

  // Add contribution calendar data
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  // Calculate most active day
  const pushDays = reposData.map(repo => new Date(repo.pushed_at).getDay());
  const dayCount = new Array(7).fill(0);
  pushDays.forEach(day => dayCount[day]++);
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mostActiveDay = days[dayCount.indexOf(Math.max(...dayCount))];

  return { 
    userData,
    stats: {
      totalRepos: reposData.length,
      totalStars,
      totalForks,
      topLanguages,
      totalSizeMB: Math.round(totalSize / 1024),
      recentActivity,
      mostActiveDay,
      randomFortune: FORTUNE_MESSAGES[Math.floor(Math.random() * FORTUNE_MESSAGES.length)],
      cashier: FAMOUS_DEVS[Math.floor(Math.random() * FAMOUS_DEVS.length)],
      couponCode: Math.random().toString(36).substring(2, 8).toUpperCase()
    }
  };
}

export default function Home() {
  const [username, setUsername] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const receiptRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching data for:', username);
      const stats = await getGitHubStats(username);
      console.log('Received stats:', stats);
      setData(stats);
    } catch (err) {
      console.error('Error:', err);
      setError('User not found');
    } finally {
      setLoading(false);
    }
  }

  console.log('Current data state:', data);

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-4 py-8 sm:py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-zinc-900 dark:text-white">
          GitHub Receipt
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          Generate a receipt-style summary of your GitHub profile
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-12">
        <div className="flex gap-2 max-w-md mx-auto">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter GitHub username"
            className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-zinc-800 
                     border border-zinc-200 dark:border-zinc-700 
                     text-zinc-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     dark:focus:ring-blue-400 font-mono text-sm sm:text-base"
          />
          <button
            type="submit"
            disabled={!username || loading}
            className="px-4 sm:px-6 py-2 rounded-lg bg-blue-500 text-white font-medium
                     hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors text-sm sm:text-base"
          >
            Generate
          </button>
        </div>
      </form>

      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      )}

      {data && (
        <div className="flex flex-col items-center">
          <div className="receipt-container">
            <div className="coffee-stain" />
            <div ref={receiptRef} className="receipt-content w-full max-w-[88mm] bg-white text-black">
              <div className="relative p-4 sm:p-6 font-mono text-[11px] sm:text-xs leading-relaxed">
                <div className="text-center mb-6">
                  <h2 className="text-base sm:text-lg font-bold">GITHUB RECEIPT</h2>
                  <p>{new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  }).toUpperCase()}</p>
                  <p className="mt-1 opacity-75">ORDER #{String(Math.floor(Math.random() * 9999)).padStart(4, '0')}</p>
                </div>

                <div className="mb-4">
                  <p>CUSTOMER: {data.userData.name || data.userData.login}</p>
                  <p className="opacity-75">@{data.userData.login}</p>
                  {data.userData.location && (
                    <p className="opacity-75">LOC: {data.userData.location}</p>
                  )}
                </div>

                <div className="border-t border-b border-dashed py-3 mb-4">
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td>REPOSITORIES</td>
                        <td className="text-right">{data.stats.totalRepos}</td>
                      </tr>
                      <tr>
                        <td>STARS EARNED</td>
                        <td className="text-right">{data.stats.totalStars}</td>
                      </tr>
                      <tr>
                        <td>REPO FORKS</td>
                        <td className="text-right">{data.stats.totalForks}</td>
                      </tr>
                      <tr>
                        <td>FOLLOWERS</td>
                        <td className="text-right">{data.userData.followers}</td>
                      </tr>
                      <tr>
                        <td>FOLLOWING</td>
                        <td className="text-right">{data.userData.following}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mb-4">
                  <p className="opacity-75">TOP LANGUAGES:</p>
                  <p>{data.stats.topLanguages || 'NONE'}</p>
                </div>

                <div className="border-t border-dashed pt-3 mb-4">
                  <div className="flex justify-between text-xs">
                    <span>MOST ACTIVE DAY:</span>
                    <span>{data.stats.mostActiveDay}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>TOTAL SIZE:</span>
                    <span>{data.stats.totalSizeMB}MB</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold mt-2">
                    <span>CONTRIBUTION SCORE:</span>
                    <span>{data.stats.totalStars * 2 + data.userData.followers * 3}</span>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <p className="opacity-75 text-[10px]">
                    Served by: {data.stats.cashier}
                  </p>
                  <p className="opacity-75 text-[10px]">
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>

                <div className="border-t border-dashed mt-4 pt-3 text-[10px]">
                  <p className="text-center italic opacity-75">
                    {data.stats.randomFortune}
                  </p>
                  <div className="mt-2 p-2 border border-dashed text-center">
                    <p>COUPON CODE: {data.stats.couponCode}</p>
                    <p className="opacity-75">Save for your next commit!</p>
                  </div>
                </div>

                <div className="opacity-75 mb-6">
                  <p>CARD #: **** **** **** {new Date().getFullYear()}</p>
                  <p>AUTH CODE: {Math.floor(Math.random() * 1000000)}</p>
                  <p>CARDHOLDER: {data.userData.login.toUpperCase()}</p>
                </div>

                <div className="text-center">
                  <p className="mb-4">THANK YOU FOR CODING!</p>
                  <div className="w-full h-10">
                    <Barcode value={`github.com/${data.userData.login}`} />
                  </div>
                  <p className="mt-2 opacity-75">github.com/{data.userData.login}</p>
                </div>
              </div>
              <div className="receipt-fade" />
            </div>
          </div>

          {/* Share Buttons below receipt */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => {/* Add download function */}}
              className="px-4 py-2 bg-white dark:bg-zinc-800 rounded-lg 
                       text-zinc-900 dark:text-white
                       hover:bg-zinc-100 dark:hover:bg-zinc-700 
                       transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
            <button
              onClick={() => {/* Add share function */}}
              className="px-4 py-2 bg-white dark:bg-zinc-800 rounded-lg
                       text-zinc-900 dark:text-white
                       hover:bg-zinc-100 dark:hover:bg-zinc-700 
                       transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

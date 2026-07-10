/**
 * Matching Service
 * Simple weighted matching algorithm for kuli-kontraktor
 */

/**
 * Match kuli to a project
 * @param {Object} project - Project requirements
 * @param {Array} workers - Available workers with profiles
 * @returns {Array} - Top 3 matched workers with scores
 */
export function matchWorkers(project, workers) {
  const { budget, durationDays, skills, location } = project;

  const scored = workers.map(worker => {
    let score = 0;

    // 1. Rating (40% weight)
    const ratingScore = (worker.rating / 500) * 40; // 0-40 points
    score += ratingScore;

    // 2. Reliability (30% weight)
    const reliabilityScore = worker.disputes < 3 ? 30 : 15;
    score += reliabilityScore;

    // 3. Budget match (20% weight)
    const dailyBudget = budget / durationDays;
    const priceDiff = Math.abs(worker.dailyRate - dailyBudget);
    const maxDiff = dailyBudget * 0.5; // Allow 50% flexibility
    const budgetScore = Math.max(0, 20 - (priceDiff / maxDiff) * 20);
    score += budgetScore;

    // 4. Skill match (10% weight)
    const skillMatch = worker.skills?.some(s => skills?.includes(s)) ? 10 : 0;
    score += skillMatch;

    return {
      ...worker,
      score: Math.round(score * 100) / 100
    };
  });

  // Sort by score descending, return top 3
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

/**
 * Match kontraktor to workers
 * @param {Object} worker - Worker profile
 * @param {Array} projects - Available projects
 * @returns {Array} - Top matched projects with scores
 */
export function matchProjects(worker, projects) {
  const scored = projects.map(project => {
    let score = 0;

    // 1. Rating requirement (if kontraktor requires high rating)
    const ratingScore = (worker.rating / 500) * 30;
    score += ratingScore;

    // 2. Budget match (40% weight)
    const dailyBudget = project.dailyRate;
    const priceMatch = 1 - Math.abs(worker.dailyRate - dailyBudget) / dailyBudget;
    score += priceMatch * 40;

    // 3. Skill match (20% weight)
    const skillMatch = worker.skills?.some(s => project.skills?.includes(s)) ? 20 : 0;
    score += skillMatch;

    // 4. Location proximity (10% weight)
    const locationScore = project.location === worker.location ? 10 : 5;
    score += locationScore;

    return {
      ...project,
      score: Math.round(score * 100) / 100
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

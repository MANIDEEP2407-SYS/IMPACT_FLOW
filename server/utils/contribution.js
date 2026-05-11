export function calcContributionScore(taskCount, totalHours, filesUploaded, teamAvgTasks) {
  const taskScore  = Math.min((taskCount / Math.max(teamAvgTasks, 1)) * 40, 40);
  const hoursScore = Math.min((totalHours / 20) * 30, 30);
  const fileScore  = Math.min(filesUploaded * 3, 30);
  return Math.round(taskScore + hoursScore + fileScore);
}

import cron from 'node-cron';
import Milestone from '../models/Milestone.js';
import Team from '../models/Team.js';
import { notifyMany } from './notify.js';

export function startCronJobs() {
  // Runs daily at 8am — notifies teams whose milestone is due in 48 hours
  cron.schedule('0 8 * * *', async () => {
    const now = new Date();
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const upcoming = await Milestone.find({ dueDate: { $gte: now, $lte: in48h }, isActive: true });
    for (const milestone of upcoming) {
      const teams = await Team.find({ project: milestone.project, status: 'active' });
      for (const team of teams) {
        await notifyMany({
          userIds: team.members.map(m => m.user),
          type: 'milestone_due',
          message: `Reminder: Milestone "${milestone.title}" is due in 48 hours.`,
        });
      }
    }
  });
}

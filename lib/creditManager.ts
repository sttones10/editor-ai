
type UserCreditData = {
  credits: number;
  lastUpdate: string;
};

const creditStore: Record<string, UserCreditData> = {};

export function getCredits(userId: string): number {
  const today = new Date().toISOString().split('T')[0];
  const user = creditStore[userId];

  if (!user) {
    creditStore[userId] = { credits: 20, lastUpdate: today };
    return 20;
  }

  const last = user.lastUpdate;
  if (last !== today) {
    const diffDays = Math.floor((new Date(today).getTime() - new Date(last).getTime()) / (1000 * 60 * 60 * 24));
    const added = diffDays * 20;
    user.credits = Math.min(50, user.credits + added);
    user.lastUpdate = today;
  }

  return user.credits;
}

export function consumeCredits(userId: string, amount = 2): boolean {
  const credits = getCredits(userId);
  if (credits < amount) return false;

  creditStore[userId].credits -= amount;
  return true;
}

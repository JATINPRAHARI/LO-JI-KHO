const LUNCH_START = 11 * 60;
const LUNCH_END = 15 * 60;
const DINNER_START = 19 * 60;
const DINNER_END = 22 * 60;

function getMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function isRestaurantOpen(_date?: Date): boolean {
  // TEMPORARILY always open - remove this override to restore real hours
  return true;
  // const now = date ?? new Date();
  // const mins = getMinutes(now);
  // return (mins >= LUNCH_START && mins < LUNCH_END) || (mins >= DINNER_START && mins < DINNER_END);
}

export function getOrderingTimings() {
  return {
    lunch: { start: '11:00 AM', end: '3:00 PM' },
    dinner: { start: '7:00 PM', end: '10:00 PM' },
  };
}

export function isWithinOrderingHours(): { open: boolean; message: string } {
  const open = isRestaurantOpen();
  return {
    open,
    message: open
      ? ''
      : 'We are currently closed.\nOrdering is available from:\n11:00 AM – 3:00 PM\nand\n7:00 PM – 10:00 PM.',
  };
}

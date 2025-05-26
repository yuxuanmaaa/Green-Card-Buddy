export interface Reminder {
  date: string;  // ISO date string
  title: string;
  message: string;
}
 
export interface ReminderData {
  biometrics?: Reminder;
  interview?: Reminder;
  rfe?: Reminder;
} 
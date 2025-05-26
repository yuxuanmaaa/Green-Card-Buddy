/**
 * Chrome notifications service
 * Handles sending notifications using Chrome's notifications API via background script
 */

// Send a Chrome notification
export const sendReminder = async (
  title: string,
  message: string
): Promise<boolean> => {
  try {
    console.log('Attempting to send notification:', { title, message });
    
    if (!chrome.runtime) {
      console.error('Chrome runtime is not available');
      return false;
    }

    const response = await chrome.runtime.sendMessage({
      type: 'SHOW_NOTIFICATION',
      title,
      message
    });
    
    console.log('Notification response:', response);
    return response?.success || false;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return false;
  }
}; 
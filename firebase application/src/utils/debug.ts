/**
 * Utility for reliable debugging in both development and production
 */

// A more reliable way to log in production environments
export const debugLog = (component: string, message: string, ...args: any[]) => {
    const timestamp = new Date().toISOString();
    
    try {
      //Always Log to console
      console.log(`[${timestamp}][${component}] ${message}`, ...args);
      
      // In production, also try to add to a debug element if it exists
      if (process.env.NODE_ENV === 'production') {
        const debugElement = document.getElementById('debug-log');
        if (debugElement) {
          const logItem = document.createElement('div');
          logItem.textContent = `[${timestamp}][${component}] ${message} ${args.map(a => JSON.stringify(a)).join(' ')}`;
          debugElement.appendChild(logItem);
          // Keep only last 50 logs
          if (debugElement.children.length > 50) {
            debugElement.removeChild(debugElement.children[0]);
          }
        } else {
            // If debug element doesn't exist yet, create it
            const debugContainer = document.createElement('div');
            debugContainer.id = 'debug-log';
            debugContainer.style.display = 'none'; // Hide by default
            document.body.appendChild(debugContainer);
          }
        }
      } catch (e) {
        console.error('Debug logger error:', e);
    }
  };
  
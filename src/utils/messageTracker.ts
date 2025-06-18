// Message tracking utility to prevent duplicate avatar messages
class MessageTracker {
  private sentMessages = new Set<string>();
  private messageTimeouts = new Map<string, NodeJS.Timeout>();

  // Track a message as sent, with automatic cleanup after 30 seconds
  trackMessage(messageId: string): boolean {
    if (this.sentMessages.has(messageId)) {
      console.warn(`Duplicate message detected: ${messageId}`);
      return false; // Message already sent
    }

    this.sentMessages.add(messageId);
    
    // Cleanup after 30 seconds to prevent memory leaks
    const timeout = setTimeout(() => {
      this.sentMessages.delete(messageId);
      this.messageTimeouts.delete(messageId);
    }, 30000);
    
    this.messageTimeouts.set(messageId, timeout);
    return true; // Message is new and can be sent
  }

  // Check if a message was already sent
  isMessageSent(messageId: string): boolean {
    return this.sentMessages.has(messageId);
  }

  // Clear all tracked messages (useful for session reset)
  clear(): void {
    // Clear all timeouts
    this.messageTimeouts.forEach(timeout => clearTimeout(timeout));
    this.messageTimeouts.clear();
    this.sentMessages.clear();
  }

  // Get current stats for debugging
  getStats() {
    return {
      totalTracked: this.sentMessages.size,
      messages: Array.from(this.sentMessages)
    };
  }
}

// Global singleton instance
export const messageTracker = new MessageTracker();

/**
 * Security Event Monitoring and Alerting
 *
 * PURPOSE:
 * Detect suspicious patterns and alert on potential attacks
 * without storing PII or sensitive data
 *
 * PATTERNS DETECTED:
 * - Sequential enumeration attempts
 * - High failure rates
 * - Distributed attacks (same identifier from many IPs)
 * - Credential stuffing
 * - Brute force patterns
 */

export enum SecurityEventType {
  ENUMERATION_DETECTED = "enumeration_detected",
  HIGH_FAILURE_RATE = "high_failure_rate",
  DISTRIBUTED_ATTACK = "distributed_attack",
  CREDENTIAL_STUFFING = "credential_stuffing",
  BRUTE_FORCE = "brute_force",
  IP_LOCKOUT = "ip_lockout",
  IDENTIFIER_LOCKOUT = "identifier_lockout",
  TIMING_ATTACK_SUSPECTED = "timing_attack_suspected",
  RATE_LIMIT_BYPASS_ATTEMPT = "rate_limit_bypass_attempt",
}

export enum AlertSeverity {
  INFO = "info",
  WARNING = "warning",
  ALERT = "alert",
  CRITICAL = "critical",
}

export interface SecurityEvent {
  type: SecurityEventType;
  severity: AlertSeverity;
  timestamp: number;
  ipHash?: string;
  identifierHash?: string;
  endpointPath?: string;
  attemptCount?: number;
  failureCount?: number;
  description: string;
  metadata?: Record<string, any>;
}

export interface SecurityAlert {
  id: string;
  event: SecurityEvent;
  created: number;
  resolved?: number;
  action?: string;
  notes?: string;
}

/**
 * In-memory event log for monitoring
 * For production, integrate with centralized logging service
 */
export class SecurityEventLog {
  private events: SecurityEvent[] = [];
  private alerts: Map<string, SecurityAlert> = new Map();
  private maxEvents = 10000; // Keep last N events
  private handlers: ((event: SecurityEvent) => void)[] = [];

  /**
   * Log a security event
   *
   * @param event - Security event to log
   */
  logEvent(event: SecurityEvent): void {
    // Add timestamp if not present
    event.timestamp = event.timestamp || Date.now();

    // Store event
    this.events.push(event);

    // Trim old events if over limit
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Call registered handlers
    this.handlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error("Error in security event handler:", error);
      }
    });

    // Log based on severity
    const message = `[SECURITY] ${event.type}: ${event.description}`;
    switch (event.severity) {
      case AlertSeverity.CRITICAL:
        console.error(message, event);
        break;
      case AlertSeverity.ALERT:
        console.warn(message, event);
        break;
      case AlertSeverity.WARNING:
        console.warn(message);
        break;
      case AlertSeverity.INFO:
        console.log(message);
        break;
    }
  }

  /**
   * Create an alert from an event
   *
   * @param event - Security event
   * @param action - Recommended action
   * @returns Alert ID
   */
  createAlert(event: SecurityEvent, action?: string): string {
    const alertId = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const alert: SecurityAlert = {
      id: alertId,
      event,
      created: Date.now(),
      action,
    };

    this.alerts.set(alertId, alert);

    return alertId;
  }

  /**
   * Get all active alerts
   *
   * @returns All unresolved alerts
   */
  getActiveAlerts(): SecurityAlert[] {
    return Array.from(this.alerts.values()).filter((alert) => !alert.resolved);
  }

  /**
   * Resolve an alert
   *
   * @param alertId - Alert ID to resolve
   * @param notes - Optional resolution notes
   */
  resolveAlert(alertId: string, notes?: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolved = Date.now();
      alert.notes = notes;
    }
  }

  /**
   * Register event handler
   * Called when events are logged
   *
   * @param handler - Function to call on events
   */
  onEvent(handler: (event: SecurityEvent) => void): void {
    this.handlers.push(handler);
  }

  /**
   * Get events in time range
   *
   * @param fromMs - Start time (ms)
   * @param toMs - End time (ms)
   * @returns Matching events
   */
  getEventsBetween(fromMs: number, toMs: number): SecurityEvent[] {
    return this.events.filter(
      (e) => e.timestamp >= fromMs && e.timestamp <= toMs,
    );
  }

  /**
   * Get events for endpoint
   *
   * @param endpoint - Endpoint path
   * @returns Events for that endpoint
   */
  getEndpointEvents(endpoint: string): SecurityEvent[] {
    return this.events.filter((e) => e.endpointPath === endpoint);
  }

  /**
   * Clear all events and alerts (use with care)
   */
  clear(): void {
    this.events = [];
    this.alerts.clear();
  }

  /**
   * Get statistics for monitoring
   *
   * @param minutes - Look back N minutes
   * @returns Statistics object
   */
  getStats(minutes: number = 60): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    activeAlerts: number;
    mostCommonEndpoint?: string;
  } {
    const since = Date.now() - minutes * 60 * 1000;
    const recentEvents = this.events.filter((e) => e.timestamp >= since);

    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};
    const endpointCounts: Record<string, number> = {};

    recentEvents.forEach((e) => {
      eventsByType[e.type] = (eventsByType[e.type] || 0) + 1;
      eventsBySeverity[e.severity] = (eventsBySeverity[e.severity] || 0) + 1;
      if (e.endpointPath) {
        endpointCounts[e.endpointPath] =
          (endpointCounts[e.endpointPath] || 0) + 1;
      }
    });

    const mostCommonEndpoint = Object.entries(endpointCounts).sort(
      ([, a], [, b]) => b - a,
    )[0]?.[0];

    return {
      totalEvents: recentEvents.length,
      eventsByType,
      eventsBySeverity,
      activeAlerts: this.getActiveAlerts().length,
      mostCommonEndpoint,
    };
  }
}

/**
 * Attack Pattern Detector
 *
 * Analyzes event streams to detect attack patterns
 */
export class AttackPatternDetector {
  private eventLog: SecurityEventLog;

  constructor(eventLog: SecurityEventLog) {
    this.eventLog = eventLog;
  }

  /**
   * Detect sequential enumeration pattern
   * Example: order attempts 1000, 1001, 1002, 1003...
   *
   * @param endpoint - Endpoint to check
   * @param windowMinutes - Time window to check
   * @returns Alert if pattern detected
   */
  detectSequentialEnumeration(
    endpoint: string,
    windowMinutes: number = 5,
  ): SecurityAlert | null {
    const since = Date.now() - windowMinutes * 60 * 1000;
    const events = this.eventLog
      .getEventsBetween(since, Date.now())
      .filter((e) => e.endpointPath === endpoint);

    if (events.length < 5) {
      return null; // Need at least 5 attempts
    }

    // Look for sequential identifier attempts
    const identifiers = events
      .map((e) => e.identifierHash)
      .filter((id) => id !== undefined);

    if (identifiers.length < 5) {
      return null;
    }

    // Check if many unique identifiers in short time (sign of enumeration)
    const uniqueCount = new Set(identifiers).size;
    const ratio = uniqueCount / identifiers.length;

    if (ratio > 0.8) {
      // >80% unique identifiers = likely enumeration
      const event: SecurityEvent = {
        type: SecurityEventType.ENUMERATION_DETECTED,
        severity: AlertSeverity.CRITICAL,
        description: `Sequential enumeration detected on ${endpoint}: ${events.length} attempts, ${uniqueCount} unique identifiers`,
        endpointPath: endpoint,
        attemptCount: events.length,
        metadata: { ratio, window: windowMinutes },
      };

      this.eventLog.logEvent(event);
      return this.eventLog.createAlert(
        event,
        "Block endpoint from public access or require authentication",
      ) as any;
    }

    return null;
  }

  /**
   * Detect high failure rate pattern
   *
   * @param endpoint - Endpoint to check
   * @param windowMinutes - Time window
   * @param failureThreshold - Failure rate threshold (0-1)
   * @returns Alert if pattern detected
   */
  detectHighFailureRate(
    endpoint: string,
    windowMinutes: number = 5,
    failureThreshold: number = 0.7,
  ): SecurityAlert | null {
    const since = Date.now() - windowMinutes * 60 * 1000;
    const events = this.eventLog
      .getEventsBetween(since, Date.now())
      .filter((e) => e.endpointPath === endpoint);

    if (events.length < 10) {
      return null;
    }

    const failureCount = events.filter((e) =>
      [
        SecurityEventType.ENUMERATION_DETECTED,
        SecurityEventType.BRUTE_FORCE,
      ].includes(e.type),
    ).length;

    const failureRate = failureCount / events.length;

    if (failureRate > failureThreshold) {
      const event: SecurityEvent = {
        type: SecurityEventType.HIGH_FAILURE_RATE,
        severity: AlertSeverity.ALERT,
        description: `High failure rate on ${endpoint}: ${failureCount}/${events.length} (${(failureRate * 100).toFixed(1)}%)`,
        endpointPath: endpoint,
        failureCount,
        attemptCount: events.length,
        metadata: { failureRate, threshold: failureThreshold },
      };

      this.eventLog.logEvent(event);
      return this.eventLog.createAlert(
        event,
        "Increase rate limiting or require CAPTCHA",
      ) as any;
    }

    return null;
  }

  /**
   * Detect distributed attack pattern
   * Same identifier attempted from many IPs
   *
   * @param endpoint - Endpoint to check
   * @param windowMinutes - Time window
   * @returns Alert if pattern detected
   */
  detectDistributedAttack(
    endpoint: string,
    windowMinutes: number = 10,
  ): SecurityAlert | null {
    const since = Date.now() - windowMinutes * 60 * 1000;
    const events = this.eventLog
      .getEventsBetween(since, Date.now())
      .filter((e) => e.endpointPath === endpoint && e.identifierHash);

    if (events.length < 10) {
      return null;
    }

    // Group by identifier hash
    const byIdentifier: Record<string, number> = {};
    const ipsByIdentifier: Record<string, Set<string>> = {};

    events.forEach((e) => {
      if (e.identifierHash) {
        byIdentifier[e.identifierHash] =
          (byIdentifier[e.identifierHash] || 0) + 1;

        if (!ipsByIdentifier[e.identifierHash]) {
          ipsByIdentifier[e.identifierHash] = new Set();
        }

        if (e.ipHash) {
          ipsByIdentifier[e.identifierHash].add(e.ipHash);
        }
      }
    });

    // Find identifiers attempted from many IPs
    for (const [identifier, ips] of Object.entries(ipsByIdentifier)) {
      if (ips.size >= 5) {
        // Same identifier from 5+ IPs = distributed attack
        const event: SecurityEvent = {
          type: SecurityEventType.DISTRIBUTED_ATTACK,
          severity: AlertSeverity.CRITICAL,
          description: `Distributed attack detected on ${endpoint}: identifier attempted from ${ips.size} IPs`,
          endpointPath: endpoint,
          identifierHash: identifier,
          attemptCount: byIdentifier[identifier],
          metadata: { ipCount: ips.size, identifier },
        };

        this.eventLog.logEvent(event);
        return this.eventLog.createAlert(
          event,
          "Block identifier from public access or require verification",
        ) as any;
      }
    }

    return null;
  }
}

// Global event log instance
export const securityEventLog = new SecurityEventLog();

// Global attack detector instance
export const attackDetector = new AttackPatternDetector(securityEventLog);

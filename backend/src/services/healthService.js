const os = require('os');
const config = require('../config/env');

class HealthService {
  /**
   * Gather complete health and system diagnostics
   */
  static getHealthData() {
    const uptimeSeconds = process.uptime();
    const memoryUsage = process.memoryUsage();

    return {
      service: 'BlindSpot API',
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(uptimeSeconds),
        formatted: HealthService.formatUptime(uptimeSeconds),
      },
      environment: config.nodeEnv,
      version: '1.0.0',
      system: {
        platform: os.platform(),
        architecture: os.arch(),
        nodeVersion: process.version,
        cpuCount: os.cpus().length,
        freeMemoryMB: Math.round(os.freemem() / (1024 * 1024)),
        totalMemoryMB: Math.round(os.totalmem() / (1024 * 1024)),
      },
      memory: {
        rssMB: Math.round(memoryUsage.rss / (1024 * 1024)),
        heapTotalMB: Math.round(memoryUsage.heapTotal / (1024 * 1024)),
        heapUsedMB: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
      },
      security: {
        corsClientAllowed: config.clientUrl,
        apiKeysConfigured: Boolean(config.apiKeys.blindspotKey),
      },
    };
  }

  static formatUptime(seconds) {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);

    return parts.join(' ');
  }
}

module.exports = HealthService;

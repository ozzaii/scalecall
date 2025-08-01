import { elevenLabsService } from './elevenLabs';
import { geminiService } from './gemini';

interface HealthStatus {
  elevenLabs: {
    status: 'healthy' | 'unhealthy' | 'checking';
    message: string;
    lastChecked: Date;
  };
  gemini: {
    status: 'healthy' | 'unhealthy' | 'checking';
    message: string;
    lastChecked: Date;
  };
  overall: 'healthy' | 'degraded' | 'unhealthy';
}

class HealthCheckService {
  private status: HealthStatus = {
    elevenLabs: {
      status: 'checking',
      message: 'Kontrol ediliyor...',
      lastChecked: new Date()
    },
    gemini: {
      status: 'checking',
      message: 'Kontrol ediliyor...',
      lastChecked: new Date()
    },
    overall: 'unhealthy'
  };

  async checkElevenLabsHealth(): Promise<void> {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/user', {
        headers: {
          'xi-api-key': (elevenLabsService as any).apiKey
        }
      });

      if (response.ok) {
        this.status.elevenLabs = {
          status: 'healthy',
          message: 'ElevenLabs API aktif',
          lastChecked: new Date()
        };
      } else {
        throw new Error(`API yanıtı: ${response.status}`);
      }
    } catch (error) {
      this.status.elevenLabs = {
        status: 'unhealthy',
        message: `ElevenLabs bağlantı hatası: ${error}`,
        lastChecked: new Date()
      };
    }
  }

  async checkGeminiHealth(): Promise<void> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${(geminiService as any).apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Test' }] }]
          })
        }
      );

      if (response.ok) {
        this.status.gemini = {
          status: 'healthy',
          message: 'Gemini API aktif',
          lastChecked: new Date()
        };
      } else {
        throw new Error(`API yanıtı: ${response.status}`);
      }
    } catch (error) {
      this.status.gemini = {
        status: 'unhealthy',
        message: `Gemini bağlantı hatası: ${error}`,
        lastChecked: new Date()
      };
    }
  }

  async checkAllServices(): Promise<HealthStatus> {
    await Promise.all([
      this.checkElevenLabsHealth(),
      this.checkGeminiHealth()
    ]);

    // Determine overall health
    const healthyCount = [this.status.elevenLabs, this.status.gemini]
      .filter(s => s.status === 'healthy').length;

    if (healthyCount === 2) {
      this.status.overall = 'healthy';
    } else if (healthyCount === 1) {
      this.status.overall = 'degraded';
    } else {
      this.status.overall = 'unhealthy';
    }

    return this.status;
  }

  getStatus(): HealthStatus {
    return this.status;
  }

  // Auto health check every 2 minutes (reduced from 30 seconds to avoid rate limits)
  startAutoCheck() {
    this.checkAllServices();
    setInterval(() => {
      this.checkAllServices();
    }, 120000); // 2 minutes
  }
}

export const healthCheckService = new HealthCheckService();
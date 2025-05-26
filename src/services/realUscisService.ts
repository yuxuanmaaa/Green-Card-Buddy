/**
 * 真实的USCIS API服务
 * 使用官方的USCIS Case Status API
 */

export interface UscisApiConfig {
  clientId: string;
  clientSecret: string;
  sandboxMode: boolean;
}

export interface UscisApiResponse {
  case_status: {
    receiptNumber: string;
    formType: string;
    submittedDate: string;
    modifiedDate: string;
    current_case_status_text_en: string;
    current_case_status_desc_en: string;
    current_case_status_text_es?: string;
    current_case_status_desc_es?: string;
    hist_case_status?: any;
  };
  message: string;
}

export interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: string;
  issued_at: string;
  client_id: string;
  status: string;
}

class RealUscisService {
  private config: UscisApiConfig | null = null;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  // USCIS API URLs
  private readonly SANDBOX_OAUTH_URL = 'https://api-int.uscis.gov/oauth/accesstoken';
  private readonly SANDBOX_API_BASE = 'https://api-int.uscis.gov/case-status';
  
  // Production URLs (需要通过demo才能获得)
  private readonly PRODUCTION_OAUTH_URL = 'https://api.uscis.gov/oauth/accesstoken';
  private readonly PRODUCTION_API_BASE = 'https://api.uscis.gov/case-status';

  /**
   * 配置API凭据
   */
  configure(config: UscisApiConfig) {
    this.config = config;
    // 清除现有token，强制重新认证
    this.accessToken = null;
    this.tokenExpiry = 0;
  }

  /**
   * 检查是否已配置
   */
  isConfigured(): boolean {
    return this.config !== null && 
           this.config.clientId.length > 0 && 
           this.config.clientSecret.length > 0;
  }

  /**
   * 获取OAuth访问令牌
   */
  private async getAccessToken(): Promise<string> {
    if (!this.config) {
      throw new Error('USCIS API not configured. Please provide client credentials.');
    }

    // 检查现有token是否仍然有效（提前5分钟过期）
    const now = Date.now();
    if (this.accessToken && this.tokenExpiry > now + 5 * 60 * 1000) {
      return this.accessToken;
    }

    const oauthUrl = this.config.sandboxMode ? this.SANDBOX_OAUTH_URL : this.PRODUCTION_OAUTH_URL;
    
    const formData = new URLSearchParams();
    formData.append('grant_type', 'client_credentials');
    formData.append('client_id', this.config.clientId);
    formData.append('client_secret', this.config.clientSecret);

    try {
      const response = await fetch(oauthUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          // Token可能过期，清除并重试一次
          this.accessToken = null;
          this.tokenExpiry = 0;
          throw new Error('Authentication expired. Please try again.');
        } else if (response.status === 404) {
          throw new Error('Case not found. Please check your receipt number.');
        } else if (response.status === 503) {
          // 服务不可用 - 通常是因为运营时间限制
          let errorMessage = 'USCIS API service is currently unavailable.';
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error && errorData.error.message) {
              errorMessage = errorData.error.message;
            }
          } catch (e) {
            // 如果无法解析错误JSON，使用默认消息
          }
          throw new Error(`${errorMessage}\n\nNote: USCIS Sandbox API operates Monday-Friday, 7:00 AM - 8:00 PM EST. Please try again during these hours.`);
        } else {
          throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
      }

      const tokenData: AccessTokenResponse = await response.json();
      
      if (tokenData.status !== 'approved') {
        throw new Error(`OAuth authentication failed: ${tokenData.status}`);
      }

      this.accessToken = tokenData.access_token;
      // Token expires in seconds, convert to milliseconds and add to current time
      this.tokenExpiry = now + parseInt(tokenData.expires_in) * 1000;

      console.log('USCIS API: Successfully obtained access token');
      return this.accessToken;

    } catch (error) {
      console.error('USCIS API: Failed to get access token:', error);
      throw new Error(`Failed to authenticate with USCIS API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 查询案件状态
   */
  async fetchCaseStatus(receiptNumber: string): Promise<{ status: string; date: string }> {
    if (!this.isConfigured()) {
      throw new Error('USCIS API not configured. Please provide client credentials in the options page.');
    }

    // 验证收据号格式
    if (!receiptNumber.match(/^[A-Z]{3}\d{10}$/)) {
      throw new Error('Invalid receipt number format. Expected format: ABC1234567890');
    }

    try {
      const accessToken = await this.getAccessToken();
      const apiBase = this.config!.sandboxMode ? this.SANDBOX_API_BASE : this.PRODUCTION_API_BASE;
      const apiUrl = `${apiBase}/${receiptNumber}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          // Token可能过期，清除并重试一次
          this.accessToken = null;
          this.tokenExpiry = 0;
          throw new Error('Authentication expired. Please try again.');
        } else if (response.status === 404) {
          throw new Error('Case not found. Please check your receipt number.');
        } else if (response.status === 503) {
          // 服务不可用 - 通常是因为运营时间限制
          let errorMessage = 'USCIS API service is currently unavailable.';
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error && errorData.error.message) {
              errorMessage = errorData.error.message;
            }
          } catch (e) {
            // 如果无法解析错误JSON，使用默认消息
          }
          throw new Error(`${errorMessage}\n\nNote: USCIS Sandbox API operates Monday-Friday, 7:00 AM - 8:00 PM EST. Please try again during these hours.`);
        } else {
          throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
      }

      const apiResponse: UscisApiResponse = await response.json();
      
      // 转换为我们的标准格式
      return {
        status: apiResponse.case_status.current_case_status_text_en,
        date: this.formatDate(apiResponse.case_status.modifiedDate)
      };

    } catch (error) {
      console.error('USCIS API: Failed to fetch case status:', error);
      throw error;
    }
  }

  /**
   * 格式化日期为YYYY-MM-DD格式
   */
  private formatDate(dateString: string): string {
    try {
      // USCIS API返回格式: "09-05-2023 14:28:46"
      const [datePart] = dateString.split(' ');
      const [month, day, year] = datePart.split('-');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } catch (error) {
      console.error('Failed to format date:', dateString, error);
      return new Date().toISOString().split('T')[0];
    }
  }

  /**
   * 测试API连接
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'API not configured. Please provide client credentials.'
      };
    }

    try {
      await this.getAccessToken();
      return {
        success: true,
        message: 'Successfully connected to USCIS API'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// 导出单例实例
export const realUscisService = new RealUscisService(); 
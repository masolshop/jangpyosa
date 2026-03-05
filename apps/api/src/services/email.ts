/**
 * 이메일 알림 서비스
 * - Gmail SMTP를 사용하여 이메일 전송
 * - 매니저 가입 알림
 * - 향후 카카오 알림톡으로 전환 예정
 */

import nodemailer from 'nodemailer';

// Gmail SMTP 설정
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'jangpyosa@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD || '', // Gmail 앱 비밀번호
  },
});

/**
 * 매니저 가입 알림 이메일 전송
 */
export async function sendManagerSignupNotification(data: {
  managerName: string;
  managerPhone: string;
  managerEmail?: string;
  branchName?: string;
  refCode?: string;
  role?: string;
  organizationName?: string;
}) {
  const { managerName, managerPhone, managerEmail, branchName, refCode, role, organizationName } = data;

  // 역할 한글 변환
  const roleNames: Record<string, string> = {
    MANAGER: '매니저',
    BRANCH_MANAGER: '지사장',
    HEAD_MANAGER: '본부장',
  };
  const roleName = role ? roleNames[role] || role : '매니저';

  const mailOptions = {
    from: process.env.GMAIL_USER || 'jangpyosa@gmail.com',
    to: 'jangpyosa@gmail.com',
    subject: `[장표사] 새로운 ${roleName} 가입 알림`,
    html: `
      <div style="font-family: 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🎉 새로운 ${roleName} 가입</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9fafb;">
          <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 20px;">가입 정보</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; font-weight: bold; color: #4b5563; width: 30%;">이름</td>
              <td style="padding: 12px; color: #1f2937;">${managerName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; font-weight: bold; color: #4b5563;">역할</td>
              <td style="padding: 12px; color: #1f2937;">
                <span style="background-color: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 12px; font-weight: 500;">
                  ${roleName}
                </span>
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; font-weight: bold; color: #4b5563;">핸드폰</td>
              <td style="padding: 12px; color: #1f2937;">${managerPhone}</td>
            </tr>
            ${managerEmail ? `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; font-weight: bold; color: #4b5563;">이메일</td>
              <td style="padding: 12px; color: #1f2937;">${managerEmail}</td>
            </tr>
            ` : ''}
            ${organizationName ? `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; font-weight: bold; color: #4b5563;">소속 조직</td>
              <td style="padding: 12px; color: #1f2937;">${organizationName}</td>
            </tr>
            ` : ''}
            ${branchName ? `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; font-weight: bold; color: #4b5563;">소속 지사</td>
              <td style="padding: 12px; color: #1f2937;">${branchName}</td>
            </tr>
            ` : ''}
            ${refCode ? `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; font-weight: bold; color: #4b5563;">추천 코드</td>
              <td style="padding: 12px; color: #1f2937;">
                <code style="background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: monospace;">
                  ${refCode}
                </code>
              </td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 12px; font-weight: bold; color: #4b5563;">가입 일시</td>
              <td style="padding: 12px; color: #1f2937;">${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</td>
            </tr>
          </table>
        </div>
        
        <div style="padding: 20px; background-color: #eff6ff; border-radius: 0 0 8px 8px; text-align: center;">
          <p style="margin: 0; color: #1e40af; font-size: 14px;">
            <strong>장표사 관리자 페이지에서 확인하세요</strong>
          </p>
          <a href="https://jangpyosa.com/admin/sales-management" 
             style="display: inline-block; margin-top: 15px; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
            관리자 페이지 바로가기
          </a>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
          <p style="margin: 0; color: #92400e; font-size: 13px;">
            💡 <strong>향후 알림 방식</strong>: 카카오 알림톡으로 전환 예정입니다.
          </p>
        </div>
        
        <div style="margin-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p style="margin: 5px 0;">장애인표준사업장 알선 플랫폼</p>
          <p style="margin: 5px 0;">© 2026 장표사 (jangpyosa.com)</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ 매니저 가입 알림 이메일 전송 성공: ${managerName} (${managerPhone})`);
    console.log(`   Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`❌ 매니저 가입 알림 이메일 전송 실패: ${error.message}`);
    // 이메일 전송 실패해도 가입은 진행되도록 에러를 throw하지 않음
    return { success: false, error: error.message };
  }
}

/**
 * 이메일 전송 테스트
 */
export async function testEmailService() {
  try {
    await transporter.verify();
    console.log('✅ 이메일 서비스 연결 성공');
    return true;
  } catch (error: any) {
    console.error('❌ 이메일 서비스 연결 실패:', error.message);
    return false;
  }
}

import { config } from "../config.js";

export async function verifyBizNo(bizNo: string): Promise<{ ok: boolean; name?: string }> {
  if (config.apickProvider === "mock") {
    // MVP: 10자리 숫자면 통과
    const ok = /^\d{10}$/.test(bizNo);
    return ok ? { ok: true, name: "MOCK_COMPANY_" + bizNo.slice(0, 5) } : { ok: false };
  }

  // TODO: real apick integration
  // 실제 환경에서는 apick API를 호출하여 사업자번호 검증
  // const response = await fetch(`https://api.apick.io/verify?bizNo=${bizNo}`, {
  //   headers: { "X-API-KEY": config.apickApiKey }
  // });
  // const data = await response.json();
  // return { ok: data.valid, name: data.companyName };

  return { ok: false };
}

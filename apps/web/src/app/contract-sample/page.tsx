"use client";

import { useState } from "react";

export default function ContractSamplePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 8; // PDF 페이지 수 (실제 확인 필요)

  const handleDownload = () => {
    window.open("/downloads/연계고용 표준도급계약서_샘플(배포용).pdf", "_blank");
  };

  return (
    <div style={{ padding: "40px", maxWidth: 1200, margin: "0 auto" }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: "bold", marginBottom: 12, color: "#1a1a1a" }}>
          📄 연계고용 표준도급계약서 샘플
        </h1>
        <p style={{ fontSize: 16, color: "#666", lineHeight: 1.6 }}>
          「장애인고용촉진 및 직업재활법」제33조에 따른 연계고용 표준도급계약서 양식입니다.
          <br />
          한국장애인고용공단에서 제작한 공식 계약서 샘플을 확인하실 수 있습니다.
        </p>
      </div>

      {/* 다운로드 버튼 */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <button
          onClick={handleDownload}
          style={{
            padding: "16px 32px",
            fontSize: 18,
            fontWeight: "bold",
            color: "white",
            background: "linear-gradient(135deg, #0070f3 0%, #0051cc 100%)",
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0, 112, 243, 0.3)",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 112, 243, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 112, 243, 0.3)";
          }}
        >
          📥 PDF 다운로드
        </button>
      </div>

      {/* PDF 프리뷰 */}
      <div style={{ 
        background: "white", 
        borderRadius: 12, 
        padding: 24,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)" 
      }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>
            📖 계약서 미리보기
          </h2>
          <p style={{ fontSize: 14, color: "#666" }}>
            실제 계약서를 확인하려면 위의 다운로드 버튼을 클릭하세요.
          </p>
        </div>

        {/* PDF Embed */}
        <div style={{ 
          border: "1px solid #e5e5e5", 
          borderRadius: 8, 
          overflow: "hidden",
          background: "#f9f9f9"
        }}>
          <iframe
            src="/downloads/연계고용 표준도급계약서_샘플(배포용).pdf"
            style={{
              width: "100%",
              height: "800px",
              border: "none",
            }}
            title="연계고용 표준도급계약서 샘플"
          />
        </div>
      </div>

      {/* 계약서 안내 */}
      <div style={{ 
        marginTop: 32, 
        padding: 24, 
        background: "#f0f7ff", 
        borderRadius: 12,
        border: "2px solid #0070f3"
      }}>
        <h3 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#0070f3" }}>
          ℹ️ 계약서 사용 안내
        </h3>
        <ul style={{ 
          margin: 0, 
          paddingLeft: 20, 
          color: "#333", 
          lineHeight: 1.8,
          fontSize: 14 
        }}>
          <li>
            이 연계고용 표준도급계약서는 한국장애인고용공단에서 제작한 참고용 양식입니다.
          </li>
          <li>
            실제 도급계약 체결 시 개별 구체적 사항을 추가로 정할 수 있습니다.
          </li>
          <li>
            이 계약서에 따라 계약을 체결하였다고 하여 자동으로 부담금 감면 대상이 되는 것은 아닙니다.
          </li>
          <li>
            관련 법령(「장애인고용촉진 및 직업재활법」제33조, 「연계고용에 따른 부담금 감면기준」)을 반드시 확인하세요.
          </li>
          <li>
            계약서 작성 및 법적 효력에 대한 문의는 한국장애인고용공단으로 연락하시기 바랍니다.
          </li>
        </ul>
      </div>

      {/* 주요 내용 요약 */}
      <div style={{ 
        marginTop: 32, 
        padding: 24, 
        background: "white", 
        borderRadius: 12,
        border: "1px solid #e5e5e5"
      }}>
        <h3 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16, color: "#1a1a1a" }}>
          📋 계약서 주요 구성
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          <InfoCard 
            title="제1절 총칙" 
            items={["계약의 목적", "용어의 정의", "계약기간", "계약금액"]}
          />
          <InfoCard 
            title="제2절 도급계약" 
            items={["도급의 내용", "품질기준", "납품조건", "대금지급"]}
          />
          <InfoCard 
            title="제3절 이행관리" 
            items={["이행 점검", "계약변경", "계약해지", "손해배상"]}
          />
        </div>
      </div>

      {/* 문의 안내 */}
      <div style={{ 
        marginTop: 32, 
        padding: 24, 
        background: "#fff9e6", 
        borderRadius: 12,
        border: "2px solid #ffc107",
        textAlign: "center"
      }}>
        <h3 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#f57c00" }}>
          📞 문의하기
        </h3>
        <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6, margin: 0 }}>
          연계고용 및 계약서 작성에 대한 자세한 문의는<br />
          <strong style={{ color: "#f57c00" }}>한국장애인고용공단 (☎ 1588-1519)</strong>으로 연락주시기 바랍니다.
        </p>
      </div>
    </div>
  );
}

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div style={{ 
      padding: 16, 
      background: "#f9f9f9", 
      borderRadius: 8,
      border: "1px solid #e5e5e5"
    }}>
      <h4 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 12, color: "#0070f3" }}>
        {title}
      </h4>
      <ul style={{ 
        margin: 0, 
        paddingLeft: 20, 
        color: "#666", 
        fontSize: 14,
        lineHeight: 1.8 
      }}>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

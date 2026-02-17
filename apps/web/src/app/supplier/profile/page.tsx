"use client";

import { useState, useEffect } from "react";
import { getToken } from "@/lib/auth";

export default function SupplierProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    region: "",
    industry: "",
    contactName: "",
    contactTel: "",
    contractDescription: "",
    minContractAmount: "",
    maxContractAmount: "",
    detailPageContent: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = getToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch("/api/proxy/supplier/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await res.json();
      setProfile(data.profile);
      setFormData({
        region: data.profile.region || "",
        industry: data.profile.industry || "",
        contactName: data.profile.contactName || "",
        contactTel: data.profile.contactTel || "",
        contractDescription: data.profile.contractDescription || "",
        minContractAmount: data.profile.minContractAmount?.toString() || "",
        maxContractAmount: data.profile.maxContractAmount?.toString() || "",
        detailPageContent: data.profile.detailPageContent || "",
      });
    } catch (error) {
      console.error("Fetch profile error:", error);
      setMessage("프로필 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const token = getToken();
      const res = await fetch("http://localhost:4000/supplier/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          minContractAmount: formData.minContractAmount
            ? parseInt(formData.minContractAmount)
            : null,
          maxContractAmount: formData.maxContractAmount
            ? parseInt(formData.maxContractAmount)
            : null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await res.json();
      setProfile(data.profile);
      setMessage("프로필이 업데이트되었습니다!");
    } catch (error) {
      console.error("Update profile error:", error);
      setMessage("프로필 업데이트 실패");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("images", file);
    });

    try {
      const token = getToken();
      const res = await fetch("/api/proxy/supplier/profile/images", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload images");
      }

      setMessage("이미지가 업로드되었습니다!");
      fetchProfile();
    } catch (error) {
      console.error("Upload images error:", error);
      setMessage("이미지 업로드 실패");
    }
  };

  const handleDeleteImage = async (index: number) => {
    if (!confirm("이 이미지를 삭제하시겠습니까?")) return;

    try {
      const token = getToken();
      const res = await fetch(`http://localhost:4000/supplier/profile/images/${index}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete image");
      }

      setMessage("이미지가 삭제되었습니다!");
      fetchProfile();
    } catch (error) {
      console.error("Delete image error:", error);
      setMessage("이미지 삭제 실패");
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>🏢 공급사 프로필 관리</h1>

        {profile?.registry && (
          <div style={{ marginTop: 16, padding: 16, background: "#e7f3ff", borderRadius: 8 }}>
            <h3 style={{ margin: 0, fontSize: 16, color: "#0070f3" }}>
              ✓ 표준사업장 인증 정보 (엑셀 DB에서 자동 매칭)
            </h3>
            <div style={{ marginTop: 12, fontSize: 14, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px' }}>
              {profile.registry.certNo && (
                <>
                  <strong>인증번호:</strong>
                  <span>{profile.registry.certNo}</span>
                </>
              )}
              {profile.registry.name && (
                <>
                  <strong>사업체명:</strong>
                  <span>{profile.registry.name}</span>
                </>
              )}
              {profile.registry.bizNo && (
                <>
                  <strong>사업자번호:</strong>
                  <span>{profile.registry.bizNo}</span>
                </>
              )}
              {profile.registry.representative && (
                <>
                  <strong>대표자:</strong>
                  <span>{profile.registry.representative}</span>
                </>
              )}
              {profile.registry.region && (
                <>
                  <strong>지역:</strong>
                  <span>{profile.registry.region}</span>
                </>
              )}
              {profile.registry.industry && (
                <>
                  <strong>업종:</strong>
                  <span>{profile.registry.industry}</span>
                </>
              )}
              {profile.registry.address && (
                <>
                  <strong>소재지:</strong>
                  <span>{profile.registry.address}</span>
                </>
              )}
              {profile.registry.certDate && (
                <>
                  <strong>인증일자:</strong>
                  <span>{profile.registry.certDate}</span>
                </>
              )}
              {profile.registry.companyType && (
                <>
                  <strong>구분:</strong>
                  <span>{profile.registry.companyType}</span>
                </>
              )}
            </div>
          </div>
        )}

        {message && (
          <div className={message.includes("실패") ? "error" : "success"}>{message}</div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>기본 정보</h2>

          <label>지역</label>
          <input
            type="text"
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            placeholder="예: 서울, 경기도 등"
          />

          <label>업종</label>
          <input
            type="text"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            placeholder="예: 제조업, 서비스업 등"
          />

          <label>담당자명</label>
          <input
            type="text"
            value={formData.contactName}
            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
            placeholder="담당자 이름"
          />

          <label>연락처</label>
          <input
            type="text"
            value={formData.contactTel}
            onChange={(e) => setFormData({ ...formData, contactTel: e.target.value })}
            placeholder="전화번호"
          />

          <h2 style={{ fontSize: 18, marginTop: 32, marginBottom: 16 }}>도급계약 정보</h2>

          <label>최소 도급계약 금액 (원)</label>
          <input
            type="number"
            value={formData.minContractAmount}
            onChange={(e) => setFormData({ ...formData, minContractAmount: e.target.value })}
            placeholder="예: 1000000"
          />

          <label>최대 도급계약 금액 (원)</label>
          <input
            type="number"
            value={formData.maxContractAmount}
            onChange={(e) => setFormData({ ...formData, maxContractAmount: e.target.value })}
            placeholder="예: 50000000"
          />

          <label>도급계약 방법 및 조건 설명</label>
          <textarea
            rows={5}
            value={formData.contractDescription}
            onChange={(e) => setFormData({ ...formData, contractDescription: e.target.value })}
            placeholder="도급계약 진행 방법, 필요 서류, 조건 등을 상세히 작성해주세요"
          />

          <h2 style={{ fontSize: 18, marginTop: 32, marginBottom: 16 }}>상세 페이지 콘텐츠</h2>

          <label>상세 설명 (HTML 또는 Markdown)</label>
          <textarea
            rows={10}
            value={formData.detailPageContent}
            onChange={(e) => setFormData({ ...formData, detailPageContent: e.target.value })}
            placeholder="회사 소개, 제공 서비스, 시설 안내 등을 작성해주세요"
          />

          <button type="submit" disabled={saving} style={{ marginTop: 16 }}>
            {saving ? "저장 중..." : "프로필 저장"}
          </button>
        </form>

        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>대표 이미지 (최대 5개)</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 16 }}>
            {[1, 2, 3, 4, 5].map((index) => {
              const imageUrl = profile?.[`image${index}`];
              return (
                <div
                  key={index}
                  style={{
                    border: "2px dashed #ddd",
                    borderRadius: 8,
                    padding: 8,
                    textAlign: "center",
                    position: "relative",
                  }}
                >
                  {imageUrl ? (
                    <>
                      <img
                        src={imageUrl}
                        alt={`Image ${index}`}
                        style={{
                          width: "100%",
                          height: 150,
                          objectFit: "cover",
                          borderRadius: 4,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(index)}
                        style={{
                          marginTop: 8,
                          padding: "4px 8px",
                          fontSize: 12,
                          background: "#dc3545",
                        }}
                      >
                        삭제
                      </button>
                    </>
                  ) : (
                    <div style={{ padding: "40px 0", color: "#999" }}>
                      이미지 {index}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 16 }}>
            <label>이미지 업로드</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              style={{ display: "block" }}
            />
            <p style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
              * 최대 5개까지 업로드 가능합니다 (각 파일 최대 5MB)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";

export default function ContentPage({ params }: { params: { slug: string } }) {
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/content/pages/${params.slug}`);
        const data = await res.json();
        if (res.ok) {
          setPage(data.page);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="container">
        <div className="card">
          <h1>페이지를 찾을 수 없습니다</h1>
          <p style={{ marginTop: 16 }}>
            <a href="/">홈으로 돌아가기</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>{page.title}</h1>
        <div
          style={{ marginTop: 24, lineHeight: 1.8 }}
          dangerouslySetInnerHTML={{ __html: page.contentMd }}
        />
        <div style={{ marginTop: 32, textAlign: "center" }}>
          <a href="/">홈으로 돌아가기</a>
        </div>
      </div>
    </div>
  );
}

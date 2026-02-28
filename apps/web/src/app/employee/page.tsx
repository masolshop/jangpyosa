import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "장애인직원관리솔루션 - 장표사닷컴 | 무료 장애인고용관리",
  description: "국내유일 무료 장애인직원고용관리솔루션! 장애인직원용 재택근무 근태관리, 업무관리, 휴가관리. 장애인 직원 출퇴근 체크, 업무지시, 휴가신청을 간편하게! 장애인표준사업장과 기업을 위한 완벽한 장애인고용관리 시스템.",
  keywords: [
    "장애인직원관리솔루션",
    "장애인고용관리",
    "장애인직원관리",
    "장애인근태관리",
    "장애인출퇴근관리",
    "장애인업무관리",
    "장애인휴가관리",
    "장애인재택근무",
    "장애인표준사업장관리",
    "장애인직원솔루션",
    "무료장애인관리",
    "장애인고용솔루션",
    "장표사닷컴",
    "장애인직원출퇴근",
    "장애인직원근무관리"
  ],
  authors: [{ name: "장표사닷컴" }],
  creator: "장표사닷컴",
  publisher: "장표사닷컴",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "장애인직원관리솔루션 - 장표사닷컴",
    description: "국내유일 무료 장애인직원고용관리솔루션! 재택근무 근태관리, 업무관리, 휴가관리를 간편하게!",
    url: "https://jangpyosa.com/employee",
    siteName: "장표사닷컴",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "https://jangpyosa.com/images/employee-thumbnail.jpg",
        width: 800,
        height: 400,
        alt: "장표사닷컴 장애인직원관리솔루션",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "장애인직원관리솔루션 - 장표사닷컴",
    description: "국내유일 무료 장애인직원고용관리솔루션! 재택근무 근태관리, 업무관리, 휴가관리!",
    images: ["https://jangpyosa.com/images/employee-thumbnail.jpg"],
  },
  alternates: {
    canonical: "https://jangpyosa.com/employee",
  },
};

export default function EmployeeIndexPage() {
  // 서버 사이드에서 리다이렉트
  redirect("/employee/attendance");
}

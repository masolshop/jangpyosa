import { Metadata } from "next";

export const employeeMetadata: Metadata = {
  title: "장표사닷컴 - 장애인직원 관리",
  description: "국내유일 무료 장애인직원고용관리솔루션! 장애인직원용 재택근무 근태관리, 업무관리, 휴가관리! 기업담당자용 고용장려금 고용부담금 계산 및 장애인직원 관리솔루션! 무료 제공! 체험용 계정 제공!",
  keywords: [
    "장애인고용",
    "장애인근태관리",
    "장애인업무관리",
    "고용장려금",
    "고용부담금",
    "재택근무관리",
    "무료솔루션",
    "장애인직원관리"
  ],
  openGraph: {
    title: "장표사닷컴 - 국내유일 무료 장애인고용관리솔루션",
    description: "장애인직원용 재택근무 근태관리, 업무관리, 휴가관리! 기업담당자용 고용장려금 고용부담금 계산 및 장애인직원 관리솔루션! 무료 제공! 체험용 계정 제공!",
    url: "https://jangpyosa.com/employee",
    siteName: "장표사닷컴",
    images: [
      {
        url: "/images/employee-thumbnail.jpg",
        width: 800,
        height: 400,
        alt: "장표사닷컴 - 국내유일 무료 장애인고용관리솔루션",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "장표사닷컴 - 국내유일 무료 장애인고용관리솔루션",
    description: "장애인직원용 재택근무 근태관리, 업무관리, 휴가관리! 무료 제공!",
    images: ["/images/employee-thumbnail.jpg"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

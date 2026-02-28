import { Metadata } from "next";

export const employeeMetadata: Metadata = {
  title: "장애인직원관리솔루션 - 장표사닷컴 | 무료 장애인고용관리 시스템",
  description: "국내유일 무료 장애인직원관리솔루션! 장표사닷컴으로 장애인 직원 근태관리, 재택근무 관리, 업무지시, 휴가관리를 한 곳에서! 장애인표준사업장과 의무고용기업을 위한 완벽한 관리 시스템. 무료 제공!",
  keywords: [
    "장표사닷컴",
    "장애인직원관리솔루션",
    "장애인고용관리",
    "장애인근태관리",
    "장애인업무관리",
    "장애인재택근무",
    "장애인표준사업장",
    "장애인의무고용",
    "고용장려금",
    "고용부담금",
    "재택근무관리",
    "무료솔루션",
    "장애인직원관리",
    "장애인출퇴근관리",
    "장애인휴가관리",
    "장애인근무관리",
    "무료장애인관리",
    "장애인고용시스템",
    "장애인직원출퇴근",
    "장애인업무지시"
  ],
  openGraph: {
    title: "장애인직원관리솔루션 - 장표사닷컴 | 무료 장애인고용관리",
    description: "국내유일 무료 장애인직원관리솔루션! 장애인 근태관리, 재택근무 관리, 업무지시, 휴가관리를 한 곳에서. 장애인표준사업장 및 의무고용기업 필수 시스템!",
    url: "https://jangpyosa.com/employee",
    siteName: "장표사닷컴",
    images: [
      {
        url: "/images/employee-thumbnail.jpg",
        width: 1200,
        height: 630,
        alt: "장애인직원관리솔루션 - 장표사닷컴",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "장애인직원관리솔루션 - 장표사닷컴",
    description: "국내유일 무료 장애인직원관리 시스템! 근태·업무·휴가관리를 한 곳에서!",
    images: ["/images/employee-thumbnail.jpg"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

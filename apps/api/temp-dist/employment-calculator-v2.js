"use strict";
/**
 * 장애인 고용 정밀 계산 서비스 V2
 * 고용장려금 산정 공식 정확히 반영
 *
 * 핵심 개선사항:
 * 1. 장려금 기준인원: ceil(상시근로자수 × 0.031) - 올림 처리
 * 2. 입사일 순서 산입: 입사일이 빠른 순서대로 기준인원에 포함
 * 3. 제외 조건: 고용보험 미가입, 최저임금 미만
 * 4. 임금 상한: 중증의 경우 min(단가, 임금 × 0.6)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmployeesForMonth = getEmployeesForMonth;
exports.calculateMonthlyData = calculateMonthlyData;
exports.calculateYearlyData = calculateYearlyData;
// ============================================
// 상수 정의 (2026년 기준)
// ============================================
// 고용장려금 기본 단가 (월) - 2026년 고용노동부 공식 단가
// 주의: 나이 구분 없음! (2023년 발생분부터 적용)
const INCENTIVE_RATES = {
    MILD: {
        M: 350000, // 경증 남성: 35만원
        F: 500000, // 경증 여성: 50만원
    },
    SEVERE: {
        M: 700000, // 중증 남성: 70만원
        F: 900000, // 중증 여성: 90만원
    },
};
// 부담금 단가 (월)
const LEVY_BASE_AMOUNT = 1260000; // 2026년 기준
// 의무고용률 (buyerType 기반)
const QUOTA_RATES = {
    PRIVATE_COMPANY: 0.031, // 민간기업
    PUBLIC_INSTITUTION: 0.038, // 공공기관
    GOVERNMENT: 0.038, // 국가/지자체/교육청
    // 하위 호환성 유지
    PRIVATE: 0.031,
    PUBLIC_CORP: 0.038,
    OTHER_PUBLIC: 0.038,
    BUYER: 0.031, // 기본값
};
// 중증 장애인 인정 배수
const SEVERE_MULTIPLIER_THRESHOLD = 60; // 월 60시간 이상 (주 60시간 아님!)
const SEVERE_MULTIPLIER = 2.0;
// 지원 기간 제한
const SUPPORT_PERIOD_MONTHS = {
    SEVERE: 60, // 중증: 최대 60개월
    MILD: 36, // 경증: 최대 36개월
};
// ============================================
// 유틸리티 함수
// ============================================
/**
 * 나이 계산
 */
function calculateAge(birthDate, targetDate) {
    if (!birthDate)
        return 40; // 기본값: 40세 (35~55세 구간)
    const age = targetDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = targetDate.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && targetDate.getDate() < birthDate.getDate())) {
        return age - 1;
    }
    return age;
}
/**
 * 입사 후 경과 월수 계산
 */
function calculateMonthsWorked(hireDate, targetDate) {
    const yearDiff = targetDate.getFullYear() - hireDate.getFullYear();
    const monthDiff = targetDate.getMonth() - hireDate.getMonth();
    return yearDiff * 12 + monthDiff + 1; // +1: 입사 월 포함
}
/**
 * 장려금 기본 단가 조회 (2026년 공식 - 나이 구분 없음!)
 */
function getBaseIncentiveRate(severity, gender) {
    // 2026년 고용노동부 공식 단가 (2023년 발생분부터 적용)
    const rate = INCENTIVE_RATES[severity]?.[gender];
    if (!rate) {
        // Fallback: 중증 남성 기준
        console.warn(`⚠️  장려금 단가 조회 실패: severity=${severity}, gender=${gender}, 기본값(700,000원) 사용`);
        return 700000;
    }
    return rate;
}
/**
 * 특정 월의 장애인 직원 필터링
 */
function getEmployeesForMonth(employees, year, month) {
    const targetDate = new Date(year, month - 1, 1); // 해당 월 1일
    const monthEnd = new Date(year, month, 0); // 해당 월 마지막 날
    console.log(`🔍 [${year}년 ${month}월] 재직자 필터링 시작 (총 ${employees.length}명)`);
    console.log(`   기준: 입사일 <= ${monthEnd.toISOString().slice(0, 10)}, 퇴사일 없거나 >= ${targetDate.toISOString().slice(0, 10)}`);
    const filtered = employees.filter((emp) => {
        // 입사일이 해당 월 이후면 제외
        if (emp.hireDate > monthEnd) {
            console.log(`   ❌ ${emp.name}: 입사일(${emp.hireDate.toISOString().slice(0, 10)}) > 월말(${monthEnd.toISOString().slice(0, 10)})`);
            return false;
        }
        // 퇴사일이 있고, 해당 월 이전이면 제외
        if (emp.resignDate && emp.resignDate < targetDate) {
            console.log(`   ❌ ${emp.name}: 퇴사일(${emp.resignDate.toISOString().slice(0, 10)}) < 월초(${targetDate.toISOString().slice(0, 10)})`);
            return false;
        }
        console.log(`   ✅ ${emp.name}: 재직 중 (입사 ${emp.hireDate.toISOString().slice(0, 10)})`);
        return true;
    });
    console.log(`   ➡️  결과: ${filtered.length}명 재직`);
    return filtered;
}
// ============================================
// 메인 계산 함수
// ============================================
/**
 * 월별 고용장려금 및 부담금 정밀 계산
 */
function calculateMonthlyData(employees, totalEmployeeCount, year, month, companyType = "BUYER") {
    const targetDate = new Date(year, month - 1, 15); // 해당 월 중순 기준
    // 1. 해당 월 재직 중인 직원만 필터링
    const activeEmployees = getEmployeesForMonth(employees, year, month);
    // 2. 입사일 순서로 정렬 (입사일이 같으면 경증 > 남성 > 임금 낮은 순)
    const sortedEmployees = [...activeEmployees].sort((a, b) => {
        // 입사일 비교
        const hireCompare = a.hireDate.getTime() - b.hireDate.getTime();
        if (hireCompare !== 0)
            return hireCompare;
        // 입사일 같으면 경증 우선 (경증=MILD가 먼저)
        if (a.severity !== b.severity) {
            return a.severity === "MILD" ? -1 : 1;
        }
        // 중증도 같으면 남성 우선
        if (a.gender !== b.gender) {
            return a.gender === "M" ? -1 : 1;
        }
        // 성별도 같으면 임금 낮은 순
        return a.monthlySalary - b.monthlySalary;
    });
    // 3. 의무고용률 및 인원 계산
    const quotaRate = QUOTA_RATES[companyType] || 0.031;
    const obligatedCount = Math.floor(totalEmployeeCount * quotaRate); // 의무고용인원 (floor)
    const incentiveBaselineCount = Math.ceil(totalEmployeeCount * quotaRate); // 장려금 기준인원 (ceil) ★
    // 4. 각 직원별 상세 계산
    const details = [];
    let totalIncentive = 0;
    let totalRecognizedCount = 0;
    let excludedCount = 0;
    console.log(`📊 [${year}년 ${month}월] 직원별 인정수 계산 시작 (총 ${sortedEmployees.length}명)`);
    sortedEmployees.forEach((emp, index) => {
        const age = calculateAge(emp.birthDate, targetDate);
        const monthsWorked = calculateMonthsWorked(emp.hireDate, targetDate);
        const rank = index + 1;
        const isWithinBaseline = rank <= incentiveBaselineCount;
        // 제외 사유 확인
        let excludeReason;
        let incentiveAmount = 0;
        // 장려금 지급 대상 판정: 기준인원을 초과한 사람만 지급 대상
        // 공식: 월별 지급인원 = [장애인근로자수 - 제외인원 - 기준인원]
        if (isWithinBaseline) {
            // 기준인원 이내는 장려금 대상 아님
            excludeReason = "기준인원 이내 (장려금 대상 아님)";
        }
        else if (!emp.hasEmploymentInsurance) {
            // 기준인원 초과이지만 고용보험 미가입
            excludeReason = "고용보험 미가입";
            excludedCount++;
        }
        else if (!emp.meetsMinimumWage) {
            // 기준인원 초과이지만 최저임금 미만
            excludeReason = "최저임금 미만";
            excludedCount++;
        }
        else {
            // 지원 기간 확인
            const maxPeriod = SUPPORT_PERIOD_MONTHS[emp.severity];
            if (monthsWorked > maxPeriod) {
                excludeReason = `지원기간 초과 (${maxPeriod}개월)`;
                excludedCount++;
            }
        }
        // 장려금 계산 (기준인원 초과 + 자격이 있는 경우만)
        const baseRate = getBaseIncentiveRate(emp.severity, emp.gender);
        // 월임금액 60% 상한 적용 (모든 장애인에게 적용)
        const salaryLimit = Math.round(emp.monthlySalary * 0.6);
        const finalRate = Math.min(baseRate, salaryLimit);
        // 장려금 지급: 기준인원 초과 && 제외사유 없음
        if (!isWithinBaseline && !excludeReason) {
            incentiveAmount = finalRate;
            totalIncentive += incentiveAmount;
        }
        // 부담금 인정 인원 (제외 조건 없음, 모든 재직자 인정)
        // 중증: 월 60시간 이상 근무 시 2명 인정
        let levyRecognizedCount = 1.0;
        if (emp.severity === "SEVERE" && emp.monthlyWorkHours >= SEVERE_MULTIPLIER_THRESHOLD) {
            levyRecognizedCount = SEVERE_MULTIPLIER;
            console.log(`  ✅ ${emp.name} (중증): 월 ${emp.monthlyWorkHours}시간 >= 60 → 2배 인정`);
        }
        else {
            console.log(`  - ${emp.name} (${emp.severity}): 월 ${emp.monthlyWorkHours}시간 → 1배 인정`);
        }
        totalRecognizedCount += levyRecognizedCount;
        details.push({
            employeeId: emp.id,
            employeeName: emp.name,
            severity: emp.severity,
            gender: emp.gender,
            age,
            hireDate: emp.hireDate.toISOString().slice(0, 10),
            monthlyWorkHours: emp.monthlyWorkHours,
            monthlySalary: emp.monthlySalary,
            monthsWorked,
            hasEmploymentInsurance: emp.hasEmploymentInsurance,
            meetsMinimumWage: emp.meetsMinimumWage,
            rank,
            isWithinBaseline,
            excludeReason,
            baseIncentiveRate: baseRate,
            salaryLimit,
            finalIncentiveRate: finalRate,
            incentiveAmount,
            levyRecognizedCount,
        });
    });
    // 5. 부담금 계산
    const shortfallCount = Math.max(0, obligatedCount - totalRecognizedCount);
    const levy = Math.round(shortfallCount * LEVY_BASE_AMOUNT);
    console.log(`📊 [${year}년 ${month}월] 최종 계산 결과:`);
    console.log(`  - 장애인 직원 수: ${activeEmployees.length}명`);
    console.log(`  - 총 인정수: ${totalRecognizedCount.toFixed(1)}명`);
    console.log(`  - 의무고용인원: ${obligatedCount}명`);
    console.log(`  - 미달인원: ${shortfallCount.toFixed(1)}명`);
    console.log(`  - 부담금: ${levy.toLocaleString()}원\n`);
    // 6. 지급인원 및 순액 계산
    // 공식: 지급인원 = 장애인근로자수 - 기준인원 - 제외인원
    const eligibleCount = Math.max(0, activeEmployees.length - incentiveBaselineCount - excludedCount);
    const netAmount = totalIncentive - levy; // 순액 = 장려금 - 부담금
    return {
        year,
        month,
        totalEmployeeCount,
        disabledCount: activeEmployees.length,
        recognizedCount: totalRecognizedCount,
        quotaRate,
        obligatedCount,
        incentiveBaselineCount, // ★ 올림 처리된 기준인원
        incentiveExcludedCount: excludedCount,
        incentiveEligibleCount: eligibleCount, // ★ 수정된 계산식
        shortfallCount: Math.max(0, shortfallCount),
        levy,
        incentive: totalIncentive,
        netAmount,
        details,
    };
}
/**
 * 연간 데이터 계산
 */
function calculateYearlyData(employees, monthlyEmployeeCounts, year, companyType = "BUYER") {
    const results = [];
    for (let month = 1; month <= 12; month++) {
        const totalEmployeeCount = monthlyEmployeeCounts[month] || 0;
        const result = calculateMonthlyData(employees, totalEmployeeCount, year, month, companyType);
        results.push(result);
    }
    return results;
}

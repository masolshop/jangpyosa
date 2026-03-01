const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkExistingData() {
  console.log('=== 🏢 현재 존재하는 목업회사 확인 ===');
  const companies = await prisma.company.findMany({
    include: {
      buyerProfile: {
        include: {
          disabledEmployees: {
            select: {
              id: true,
              name: true,
              phone: true,
            }
          }
        }
      },
      members: {
        where: {
          role: { in: ['BUYER', 'SUPER_ADMIN'] }
        },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          role: true,
          companyId: true,
        }
      }
    }
  });

  companies.forEach((company, idx) => {
    console.log(`\n[${idx + 1}] ${company.name} (ID: ${company.id})`);
    console.log(`   - Type: ${company.type}`);
    console.log(`   - BizNo: ${company.bizNo}`);
    
    if (company.buyerProfile) {
      console.log(`   - BuyerProfile ID: ${company.buyerProfile.id}`);
      console.log(`   - 장애인직원 수: ${company.buyerProfile.disabledEmployees?.length || 0}명`);
      
      if (company.buyerProfile.disabledEmployees?.length > 0) {
        company.buyerProfile.disabledEmployees.slice(0, 3).forEach(emp => {
          console.log(`     • ${emp.name} (${emp.phone})`);
        });
        if (company.buyerProfile.disabledEmployees.length > 3) {
          console.log(`     ... 외 ${company.buyerProfile.disabledEmployees.length - 3}명`);
        }
      }
    } else {
      console.log(`   - ⚠️  BuyerProfile 없음`);
    }

    console.log(`   - 관리자 계정 수: ${company.members?.length || 0}명`);
    if (company.members?.length > 0) {
      company.members.forEach(admin => {
        console.log(`     • ${admin.name} (${admin.phone}) - ${admin.role}`);
      });
    }
  });

  console.log('\n=== 📊 직원 로그인 계정 확인 ===');
  const employeeUsers = await prisma.user.findMany({
    where: {
      role: 'EMPLOYEE',
      employeeId: { not: null }
    },
    select: {
      id: true,
      phone: true,
      name: true,
      employeeId: true,
      companyId: true,
    }
  });

  console.log(`\n총 ${employeeUsers.length}명의 직원 계정 발견:`);
  
  for (const empUser of employeeUsers) {
    console.log(`\n[${employeeUsers.indexOf(empUser) + 1}] ${empUser.name} (${empUser.phone})`);
    console.log(`   - UserID: ${empUser.id}`);
    console.log(`   - EmployeeID: ${empUser.employeeId}`);
    console.log(`   - CompanyID: ${empUser.companyId || '❌ 없음'}`);
    
    // DisabledEmployee 정보 조회
    if (empUser.employeeId) {
      const employee = await prisma.disabledEmployee.findUnique({
        where: { id: empUser.employeeId },
        select: {
          id: true,
          name: true,
          buyerId: true,
          buyer: {
            select: {
              company: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      });
      
      if (employee) {
        console.log(`   - BuyerID: ${employee.buyerId}`);
        console.log(`   - 소속회사: ${employee.buyer?.company?.name || '알 수 없음'}`);
      }
    }
  }

  await prisma.$disconnect();
}

checkExistingData().catch(e => {
  console.error('❌ 에러:', e.message);
  process.exit(1);
});

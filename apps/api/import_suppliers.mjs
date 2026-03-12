import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function importSuppliers() {
  try {
    const data = JSON.parse(fs.readFileSync('/tmp/suppliers.json', 'utf-8'));
    
    console.log(`📦 Importing ${data.length} suppliers to SupplierRegistry...\n`);
    
    let created = 0;
    let errors = 0;
    
    for (const supplier of data) {
      try {
        await prisma.supplierRegistry.upsert({
          where: { bizNo: supplier.bizNo },
          update: {
            certNo: supplier.certNo,
            name: supplier.name,
            region: supplier.region,
            representative: supplier.representative,
            address: supplier.address,
            certDate: supplier.certDate,
            contactTel: supplier.contactTel,
            industry: supplier.industry,
            companyType: supplier.companyType,
          },
          create: {
            certNo: supplier.certNo,
            name: supplier.name,
            bizNo: supplier.bizNo,
            region: supplier.region,
            representative: supplier.representative,
            address: supplier.address,
            certDate: supplier.certDate,
            contactTel: supplier.contactTel,
            industry: supplier.industry,
            companyType: supplier.companyType,
          }
        });
        
        created++;
        if (created % 100 === 0) {
          console.log(`✅ Processed ${created}/${data.length}...`);
        }
      } catch (err) {
        errors++;
        console.error(`❌ Error: ${supplier.name} (${supplier.bizNo}): ${err.message}`);
      }
    }
    
    console.log(`\n🎉 Import complete!`);
    console.log(`   ✅ Created/Updated: ${created}`);
    console.log(`   ❌ Errors: ${errors}`);
    
    const count = await prisma.supplierRegistry.count();
    console.log(`\n📊 Total SupplierRegistry records: ${count}`);
    
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importSuppliers();

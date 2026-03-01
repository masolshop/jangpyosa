#!/bin/bash
echo "🔍 최근 API 로그 확인 중..."
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 "pm2 logs jangpyosa-api --nostream --lines 50 | grep -E '직원|employee|registration|disability' | tail -30"

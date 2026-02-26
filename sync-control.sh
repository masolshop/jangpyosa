#!/bin/bash
###############################################
# 자동 동기화 제어 스크립트
###############################################

PID_FILE="/home/user/webapp/auto-sync.pid"
SCRIPT="/home/user/webapp/auto-sync.sh"
LOG_FILE="/home/user/webapp/auto-sync.log"

case "$1" in
    start)
        if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
            echo "❌ 자동 동기화가 이미 실행 중입니다 (PID: $(cat $PID_FILE))"
            exit 1
        fi
        
        echo "🚀 자동 동기화 백그라운드로 시작 중..."
        nohup "$SCRIPT" > /dev/null 2>&1 &
        echo $! > "$PID_FILE"
        sleep 2
        
        if kill -0 $(cat "$PID_FILE") 2>/dev/null; then
            echo "✅ 자동 동기화 시작 완료 (PID: $(cat $PID_FILE))"
            echo "📋 로그 확인: tail -f $LOG_FILE"
        else
            echo "❌ 자동 동기화 시작 실패"
            rm -f "$PID_FILE"
            exit 1
        fi
        ;;
        
    stop)
        if [ ! -f "$PID_FILE" ]; then
            echo "❌ 실행 중인 자동 동기화가 없습니다"
            exit 1
        fi
        
        PID=$(cat "$PID_FILE")
        if kill -0 $PID 2>/dev/null; then
            echo "🛑 자동 동기화 중지 중... (PID: $PID)"
            kill $PID
            rm -f "$PID_FILE"
            echo "✅ 자동 동기화 중지 완료"
        else
            echo "❌ 프로세스를 찾을 수 없습니다 (PID: $PID)"
            rm -f "$PID_FILE"
            exit 1
        fi
        ;;
        
    status)
        if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
            PID=$(cat "$PID_FILE")
            echo "✅ 자동 동기화 실행 중 (PID: $PID)"
            echo ""
            echo "📊 프로세스 정보:"
            ps -p $PID -o pid,etime,cmd
            echo ""
            echo "📋 최근 로그 (마지막 10줄):"
            tail -10 "$LOG_FILE" 2>/dev/null || echo "로그 파일이 없습니다"
        else
            echo "❌ 자동 동기화가 실행 중이 아닙니다"
            [ -f "$PID_FILE" ] && rm -f "$PID_FILE"
            exit 1
        fi
        ;;
        
    restart)
        $0 stop
        sleep 2
        $0 start
        ;;
        
    log)
        if [ -f "$LOG_FILE" ]; then
            tail -f "$LOG_FILE"
        else
            echo "❌ 로그 파일이 없습니다: $LOG_FILE"
            exit 1
        fi
        ;;
        
    *)
        echo "사용법: $0 {start|stop|status|restart|log}"
        echo ""
        echo "명령어:"
        echo "  start   - 자동 동기화 시작 (백그라운드)"
        echo "  stop    - 자동 동기화 중지"
        echo "  status  - 실행 상태 확인"
        echo "  restart - 재시작"
        echo "  log     - 로그 실시간 확인"
        exit 1
        ;;
esac

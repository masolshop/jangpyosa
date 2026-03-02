import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { prisma } from "../index.js";

let io: SocketIOServer | null = null;

interface JWTPayload {
  userId: string;
  role: string;
}

// Socket.IO 서버 초기화
export function initializeWebSocket(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.corsOrigin,
      credentials: true,
    },
    path: "/socket.io",
    transports: ["websocket", "polling"],
  });

  // 인증 미들웨어
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "");
      
      if (!token) {
        return next(new Error("인증 토큰이 없습니다"));
      }

      const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
      
      // 사용자 정보 조회
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          role: true,
          name: true,
          salesPerson: {
            select: {
              id: true,
              role: true,
              organizationName: true,
              branchId: true,
            },
          },
        },
      });

      if (!user) {
        return next(new Error("사용자를 찾을 수 없습니다"));
      }

      // socket 객체에 사용자 정보 저장
      (socket as any).user = user;
      next();
    } catch (error) {
      console.error("WebSocket 인증 오류:", error);
      next(new Error("인증 실패"));
    }
  });

  // 연결 처리
  io.on("connection", (socket) => {
    const user = (socket as any).user;
    console.log(`🔌 WebSocket 연결: ${user.name} (${user.id})`);

    // 매니저/지사장/본부장의 경우 해당 룸에 참가
    if (user.salesPerson) {
      const salesPerson = user.salesPerson;
      
      // 개인 룸 (자신의 알림)
      socket.join(`agent:${salesPerson.id}`);
      
      // 지사 룸 (지사장이 확인할 수 있는 알림)
      if (salesPerson.branchId) {
        socket.join(`branch:${salesPerson.branchId}`);
      }
      
      // 본부 룸 (본부장이 확인할 수 있는 모든 알림)
      if (salesPerson.role === "HEAD_MANAGER") {
        socket.join("headquarters");
      }

      console.log(`📢 룸 참가: agent:${salesPerson.id}${salesPerson.branchId ? `, branch:${salesPerson.branchId}` : ""}${salesPerson.role === "HEAD_MANAGER" ? ", headquarters" : ""}`);
    }

    // 클라이언트에서 알림 읽음 처리
    socket.on("mark-notification-read", async (notificationId: string) => {
      try {
        await prisma.notification.update({
          where: { id: notificationId },
          data: { isRead: true, readAt: new Date() },
        });
        socket.emit("notification-marked-read", { notificationId });
      } catch (error) {
        console.error("알림 읽음 처리 오류:", error);
      }
    });

    // 연결 해제
    socket.on("disconnect", () => {
      console.log(`🔌 WebSocket 연결 해제: ${user.name} (${user.id})`);
    });
  });

  console.log("✅ WebSocket 서버 초기화 완료");
  return io;
}

// 추천 성공 알림 전송
export async function sendReferralNotification(
  referrerId: string, // 추천한 매니저 ID
  companyName: string,
  buyerName: string,
  buyerType: string
) {
  if (!io) {
    console.warn("⚠️  WebSocket 서버가 초기화되지 않았습니다");
    return;
  }

  try {
    // 매니저 정보 조회
    const agent = await prisma.salesPerson.findUnique({
      where: { id: referrerId },
      select: {
        id: true,
        userId: true,
        name: true,
        branchId: true,
        role: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!agent) {
      console.warn(`⚠️  매니저를 찾을 수 없습니다: ${referrerId}`);
      return;
    }

    const buyerTypeLabel =
      buyerType === "PRIVATE_COMPANY"
        ? "민간기업"
        : buyerType === "PUBLIC_INSTITUTION"
        ? "공공기관"
        : "정부기관";

    // 알림 메시지 생성
    const notification = {
      id: `notif-${Date.now()}`,
      type: "referral_success",
      title: "🎉 추천 성공!",
      message: `${buyerName}님이 ${companyName} (${buyerTypeLabel})로 가입했습니다!`,
      data: {
        companyName,
        buyerName,
        buyerType,
        agentId: agent.id,
        agentName: agent.name,
      },
      timestamp: new Date().toISOString(),
    };

    // 1. 매니저 본인에게 알림
    io.to(`agent:${agent.id}`).emit("referral-notification", notification);
    console.log(`📢 매니저 알림 전송: ${agent.name} (agent:${agent.id})`);

    // 2. 지사장에게 알림 (해당 매니저가 지사 소속인 경우)
    if (agent.branchId) {
      io.to(`branch:${agent.branchId}`).emit("referral-notification", {
        ...notification,
        title: "📊 지사 추천 성공",
        message: `매니저 ${agent.name}님의 추천으로 ${buyerName}님이 ${companyName} (${buyerTypeLabel})에 가입했습니다!`,
      });
      console.log(`📢 지사 알림 전송: branch:${agent.branchId}`);
    }

    // 3. 본부장에게 알림
    io.to("headquarters").emit("referral-notification", {
      ...notification,
      title: "📈 본부 추천 성공",
      message: `매니저 ${agent.name}님의 추천으로 ${buyerName}님이 ${companyName} (${buyerTypeLabel})에 가입했습니다!`,
    });
    console.log(`📢 본부 알림 전송: headquarters`);

    // DB에 알림 기록 저장 (선택사항)
    await prisma.notification.create({
      data: {
        userId: agent.userId,
        type: "REFERRAL_SUCCESS",
        title: notification.title,
        message: notification.message,
        isRead: false,
      },
    });
  } catch (error) {
    console.error("❌ 추천 알림 전송 오류:", error);
  }
}

// WebSocket 서버 인스턴스 반환
export function getIO() {
  return io;
}

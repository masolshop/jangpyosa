import { Router } from "express";
import { z } from "zod";
import { prisma } from "../index.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";

const r = Router();
r.use(requireAuth);
r.use(requireRole(["BUYER"]));

async function getBuyerProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { company: { include: { buyerProfile: true } } },
  });
  const buyer = user?.company?.buyerProfile;
  if (!buyer) throw new Error("NO_BUYER_PROFILE");
  return buyer;
}

// 장바구니 조회
r.get("/", async (req, res) => {
  try {
    const buyer = await getBuyerProfile(req.auth!.sub);
    const cart = await prisma.cart.findUnique({
      where: { buyerId: buyer.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                supplier: {
                  include: {
                    company: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      // 장바구니가 없으면 생성
      const newCart = await prisma.cart.create({
        data: { buyerId: buyer.id },
        include: { items: { include: { product: true } } },
      });
      return res.json({ ok: true, cart: newCart });
    }

    // 총액 계산
    const totalAmount = cart.items.reduce((sum, item) => sum + item.product.price * item.qty, 0);

    res.json({ ok: true, cart, totalAmount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 장바구니에 상품 추가
r.post("/add", async (req, res) => {
  try {
    const schema = z.object({ productId: z.string(), qty: z.number().int().min(1) });
    const body = schema.parse(req.body);

    const buyer = await getBuyerProfile(req.auth!.sub);

    // 장바구니 생성 또는 가져오기
    let cart = await prisma.cart.findUnique({ where: { buyerId: buyer.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { buyerId: buyer.id } });
    }

    // 상품 존재 확인
    const product = await prisma.product.findUnique({ where: { id: body.productId } });
    if (!product) {
      return res.status(404).json({ error: "PRODUCT_NOT_FOUND" });
    }

    // 장바구니 아이템 추가/업데이트
    await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: body.productId,
        },
      },
      update: { qty: body.qty },
      create: {
        cartId: cart.id,
        productId: body.productId,
        qty: body.qty,
      },
    });

    res.json({ ok: true, message: "장바구니에 추가되었습니다." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 장바구니 아이템 삭제
r.delete("/items/:itemId", async (req, res) => {
  try {
    const buyer = await getBuyerProfile(req.auth!.sub);
    const cart = await prisma.cart.findUnique({ where: { buyerId: buyer.id } });
    if (!cart) {
      return res.status(404).json({ error: "CART_NOT_FOUND" });
    }

    await prisma.cartItem.delete({
      where: { id: req.params.itemId, cartId: cart.id },
    });

    res.json({ ok: true, message: "항목이 삭제되었습니다." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 장바구니 비우기
r.delete("/clear", async (req, res) => {
  try {
    const buyer = await getBuyerProfile(req.auth!.sub);
    const cart = await prisma.cart.findUnique({ where: { buyerId: buyer.id } });
    if (!cart) {
      return res.status(404).json({ error: "CART_NOT_FOUND" });
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    res.json({ ok: true, message: "장바구니가 비워졌습니다." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default r;

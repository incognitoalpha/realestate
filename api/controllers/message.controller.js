import prisma from "../lib/prisma.js";

export const addMessage = async (req, res) => {
  const tokenUserId = req.userId;
  const chatId = req.params.chatId;
  const { text } = req.body;

  try {
    // 1️⃣ Verify user belongs to the chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        users: {
          some: {
            userId: tokenUserId,
          },
        },
      },
    });

    if (!chat) {
      return res.status(403).json({ message: "Not authorized or chat not found!" });
    }

    // 2️⃣ Create message
    const message = await prisma.message.create({
      data: {
        text,
        chatId,
        userId: tokenUserId,
      },
    });

    // 3️⃣ Update last message on chat
    await prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        lastMessage: text,
      },
    });

    res.status(200).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add message!" });
  }
};

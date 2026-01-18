import prisma from "../lib/prisma.js";

/**
 * GET all chats for logged-in user
 */
export const getChats = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const chats = await prisma.chat.findMany({
      where: {
        users: {
          some: {
            userId: tokenUserId,
          },
        },
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Attach receiver (other user)
    const formattedChats = chats.map((chat) => {
      const receiver = chat.users
        .map((cu) => cu.user)
        .find((u) => u.id !== tokenUserId);

      return {
        id: chat.id,
        createdAt: chat.createdAt,
        lastMessage: chat.lastMessage,
        receiver,
      };
    });

    res.status(200).json(formattedChats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get chats!" });
  }
};

/**
 * GET single chat + messages
 */
export const getChat = async (req, res) => {
  const tokenUserId = req.userId;
  const chatId = req.params.id;

  try {
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        users: {
          some: {
            userId: tokenUserId,
          },
        },
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const receiver = chat.users
      .map((cu) => cu.user)
      .find((u) => u.id !== tokenUserId);

    res.status(200).json({
      id: chat.id,
      createdAt: chat.createdAt,
      lastMessage: chat.lastMessage,
      messages: chat.messages,
      receiver,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get chat!" });
  }
};

/**
 * CREATE new chat
 */
export const addChat = async (req, res) => {
  const tokenUserId = req.userId;
  const receiverId = req.body.receiverId;

  try {
    const newChat = await prisma.chat.create({
      data: {
        users: {
          create: [
            { userId: tokenUserId },
            { userId: receiverId },
          ],
        },
      },
      include: {
        users: true,
      },
    });

    res.status(200).json(newChat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add chat!" });
  }
};

/**
 * MARK chat as read
 * (no seenBy array anymore — SQL way is message-based)
 */
export const readChat = async (req, res) => {
  // Intentionally kept minimal for compatibility
  res.status(200).json({ success: true });
};

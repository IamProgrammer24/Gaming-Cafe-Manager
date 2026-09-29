import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  startSession,
  pauseSession,
  resumeSession,
  stopSession,
  getOneSession,
  listActiveSessions,
  listSessions,
  toPublicSession,
} from "./session.service.js";

// serverTime lets the frontend correct for a wrong clock on the staff device.
const send = (res, session, status = 200) => {
  const now = new Date();
  res.status(status).json({
    success: true,
    data: {
      session: toPublicSession(session, now),
      serverTime: now.toISOString(),
    },
  });
};

export const start = asyncHandler(async (req, res) =>
  send(res, await startSession(req.cafeId, req.user.id, req.body), 201),
);
export const pause = asyncHandler(async (req, res) =>
  send(res, await pauseSession(req.cafeId, req.params.id)),
);
export const resume = asyncHandler(async (req, res) =>
  send(res, await resumeSession(req.cafeId, req.params.id)),
);
export const stop = asyncHandler(async (req, res) =>
  send(res, await stopSession(req.cafeId, req.params.id, req.user.id)),
);
export const getOne = asyncHandler(async (req, res) =>
  send(res, await getOneSession(req.cafeId, req.params.id)),
);

export const listActive = asyncHandler(async (req, res) => {
  const now = new Date();
  const sessions = await listActiveSessions(req.cafeId);
  res.json({
    success: true,
    data: {
      sessions: sessions.map((s) => toPublicSession(s, now)),
      serverTime: now.toISOString(),
    },
  });
});

export const list = asyncHandler(async (req, res) => {
  const now = new Date();
  const { items, ...pagination } = await listSessions(
    req.cafeId,
    req.validatedQuery,
  );
  res.json({
    success: true,
    data: {
      sessions: items.map((s) => toPublicSession(s, now)),
      ...pagination,
    },
  });
});

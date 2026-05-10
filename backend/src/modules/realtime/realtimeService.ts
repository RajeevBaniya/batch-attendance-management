import { Role, type User } from "@prisma/client";

import type { Response } from "express";

type RealtimeEventType =
  | "attendance.marked"
  | "trainer.request.approved"
  | "batch.created"
  | "session.created"
  | "trainer.assigned"
  | "student.joined.batch";

type RealtimeEventPayload = {
  institutionId?: string;
  trainerId?: string;
  studentId?: string;
  requesterId?: string;
  batchId?: string;
  sessionId?: string;
};

type RealtimeEvent = {
  type: RealtimeEventType;
  payload: RealtimeEventPayload;
  createdAt: string;
};

type RealtimeSubscriber = {
  id: string;
  userId: string;
  role: Role;
  institutionId: string | null;
  response: Response;
};

const subscribers = new Map<string, RealtimeSubscriber>();
const MAX_TOTAL_CONNECTIONS = 500;
const MAX_CONNECTIONS_PER_USER = 3;

const getUserConnectionCount = (userId: string) => {
  let connectionCount = 0;
  subscribers.forEach((subscriber) => {
    if (subscriber.userId === userId) {
      connectionCount += 1;
    }
  });
  return connectionCount;
};

const canOpenRealtimeConnection = (userId: string) => {
  if (subscribers.size >= MAX_TOTAL_CONNECTIONS) {
    return false;
  }
  return getUserConnectionCount(userId) < MAX_CONNECTIONS_PER_USER;
};

const writeEvent = (response: Response, eventName: string, data: unknown) => {
  response.write(`event: ${eventName}\n`);
  response.write(`data: ${JSON.stringify(data)}\n\n`);
};

const isSubscriberEligible = (subscriber: RealtimeSubscriber, event: RealtimeEvent) => {
  if (subscriber.role === Role.SUPER_ADMIN || subscriber.role === Role.PROGRAMME_MANAGER || subscriber.role === Role.MONITORING_OFFICER) {
    return true;
  }

  if (subscriber.role === Role.INSTITUTION) {
    return Boolean(event.payload.institutionId && subscriber.institutionId === event.payload.institutionId);
  }

  if (subscriber.role === Role.TRAINER) {
    return event.payload.trainerId === subscriber.userId;
  }

  if (subscriber.role === Role.STUDENT) {
    return event.payload.studentId === subscriber.userId;
  }

  if (subscriber.role === Role.PENDING_TRAINER) {
    return event.payload.requesterId === subscriber.userId;
  }

  return false;
};

const subscribeRealtime = (currentUser: User, response: Response) => {
  const subscriberId = `${currentUser.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const subscriber: RealtimeSubscriber = {
    id: subscriberId,
    userId: currentUser.id,
    role: currentUser.role,
    institutionId: currentUser.institutionId,
    response,
  };

  subscribers.set(subscriberId, subscriber);
  writeEvent(response, "connected", { ok: true, role: currentUser.role });

  return subscriberId;
};

const unsubscribeRealtime = (subscriberId: string) => {
  const subscriber = subscribers.get(subscriberId);
  if (!subscriber) {
    return;
  }

  subscriber.response.end();
  subscribers.delete(subscriberId);
};

const publishRealtimeEvent = (type: RealtimeEventType, payload: RealtimeEventPayload) => {
  const event: RealtimeEvent = {
    type,
    payload,
    createdAt: new Date().toISOString(),
  };

  subscribers.forEach((subscriber) => {
    if (!isSubscriberEligible(subscriber, event)) {
      return;
    }

    if (subscriber.response.writableEnded) {
      subscribers.delete(subscriber.id);
      return;
    }

    try {
      writeEvent(subscriber.response, "message", event);
    } catch {
      subscribers.delete(subscriber.id);
    }
  });
};

const sendHeartbeat = () => {
  subscribers.forEach((subscriber) => {
    if (subscriber.response.writableEnded) {
      subscribers.delete(subscriber.id);
      return;
    }

    try {
      writeEvent(subscriber.response, "heartbeat", { ts: Date.now() });
    } catch {
      subscribers.delete(subscriber.id);
    }
  });
};

setInterval(sendHeartbeat, 25000);

export { canOpenRealtimeConnection, publishRealtimeEvent, subscribeRealtime, unsubscribeRealtime };
export type { RealtimeEvent, RealtimeEventPayload, RealtimeEventType };

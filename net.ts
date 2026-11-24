import type { Look } from "./look";
import type { MatchResult, ModeResult } from "./economy";
type Send = (kind: string, data: unknown) => void;
/** A message to the server, ready to be sent by whoever holds the connection. */
export type Outgoing = { send(send: Send): void };
export type DojoEvent = { type: "dojo.send"; message: Outgoing };

const out = <T>(kind: string, data: T): Outgoing => ({ send: send => send(kind, data) });
export type MatchDone = import('./economy').MatchResult;
export const matchDone = (d: MatchResult & { completionId: string }) => out("matchDone", d);
export const modeDoneMsg = (d: ModeResult & { completionId: string }) => out("modeDone", d);
export const buyItemMsg = (d: { id: string }) => out("buyItem", d);
export const equipItemMsg = (d: { id: string }) => out("equip", d);
export const setLookMsg = (d: Look) => out("setLook", d);
export const buyUpgradeMsg = (d: { id: string }) => out("buyUpgrade", d);
export const openBoxMsg = (d: { currency: "coins" | "gems" | "free" }) => out("openBox", d);
export const setNameMsg = (d: { name: string }) => out("setName", d);
export const refreshBoardMsg = (d: { at: number }) => out("refreshBoard", d);
export const buyPeekMsg = (d: { level: number }) => out("buyPeek", d);

export const dismissNoticeMsg = (d: { n: number }) => out("dismissNotice", d);

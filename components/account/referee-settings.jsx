import { Input, Button, Select, SelectItem } from "@heroui/react";
import { useState, useEffect } from "react";
import { useReferee } from "@/lib/hooks/useReferee";
import logger from "@/lib/logger";
import { useAuth } from "@/lib/AuthContext";

const RefereeSettings = () => {
  const { user } = useAuth();
  const userId = user?.id;
    const { agentRequestIds, referralEmail, loading, error, revokeAgent, pickAgent } = useReferee(userId);

  // ✅ log agent requests & referral email
  useEffect(() => {
    if (agentRequestIds) {
      agentRequestIds.forEach((agentId) => {
        logger.debug(`Agent request: ${agentId.key}`);
      });
    }

    if (referralEmail) {
      logger.debug(`Referral email: ${referralEmail}`);
    }
  }, [agentRequestIds, referralEmail]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Client Settings</h1>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {agentRequestIds.length > 0 && (
          <Select
            aria-label="Select an agent request"
            id="agentRequests"
            placeholder="Select an agent request"
            value={agentRequestIds || ""}
            onChange={(e) => pickAgent(e.target.value)}
            disabled={loading}
          >
            {agentRequestIds.map((agentId) => (
              <SelectItem key={agentId.key} value={agentId.key}>
                {agentId.key}
              </SelectItem>
            ))}
          </Select>
          )}
        </div>
        <div className="flex flex-col gap-2">
            {referralEmail && (
              <p className="text-sm font-semibold">Referral Email: {referralEmail || ""}</p>
            )}
        </div>
        <Button
          onPress={revokeAgent}
          disabled={loading}
          variant="solid"
          color="danger"
        >
          Revoke Agent
        </Button>
      </div>
    </div>
  )
}

export default RefereeSettings
import { Input, Button, Select, SelectItem, useDisclosure } from "@heroui/react";
import { useState, useEffect } from "react";
import { useReferee } from "@/lib/hooks/useReferee";
import ConfirmationModal from "@/components/confirmation-modal"; // ✅ Import reusable modal
import logger from "@/lib/logger";
import { useAuth } from "@/lib/AuthContext";

const RefereeSettings = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const { agentRequestEmails, referralEmail, loading, error, revokeAgent, pickAgent, fetchRefereeData } = useReferee(userId);

  const { isOpen: isAssignOpen, onOpen: onAssignOpen, onClose: onAssignClose } = useDisclosure();
  const { isOpen: isRevokeOpen, onOpen: onRevokeOpen, onClose: onRevokeClose } = useDisclosure();
  
  const [selectedAgent, setSelectedAgent] = useState(null);

  // ✅ Log agent requests & referral email
  useEffect(() => {
    if (agentRequestEmails) {
      agentRequestEmails.forEach((agent) => {
        logger.debug(`Agent request: ${agent.key}`);
      });
    }

    if (referralEmail) {
      logger.debug(`Referral email: ${referralEmail}`);
    }
  }, [agentRequestEmails, referralEmail]);

  if (agentRequestEmails.length < 1 && !referralEmail) return null;

  // ✅ Handle agent selection & trigger confirmation modal
  const handleAgentSelection = (agentEmail) => {
    setSelectedAgent(agentEmail);
    onAssignOpen();
  };

  // ✅ Confirm & Assign the selected agent
  const confirmAgentSelection = async () => {
    if (!selectedAgent) return;
    await pickAgent(selectedAgent);
    fetchRefereeData(); // Refresh the data
    setSelectedAgent(null);
    onAssignClose();
  };

  // ✅ Confirm & Revoke the current agent
  const confirmRevokeAgent = async () => {
    await revokeAgent();
    fetchRefereeData(); // Refresh the data
    onRevokeClose();
  };

  return (
    <div>
      <div className="flex flex-col gap-4">
      <h3 className="text-xl">Client Settings</h3>
        {/* ✅ Agent Selection Dropdown */}
        {(agentRequestEmails.length > 0 && !referralEmail) && (
          <Select
            aria-label="Select an agent request"
            id="agentRequests"
            placeholder="Select an agent request"
            onSelectionChange={(keys) => handleAgentSelection(Array.from(keys)[0])}
            disabled={loading}
          >
            {agentRequestEmails.map((agent) => (
              <SelectItem key={agent.key} value={agent.key}>
                {agent.label}
              </SelectItem>
            ))}
          </Select>
        )}

        {/* ✅ Display Assigned Agent */}
        {referralEmail && (
          <p className="text-sm font-semibold">Assigned Agent: {referralEmail || ""}</p>
        )}

        {/* ✅ Revoke Button */}
        <Button onPress={onRevokeOpen} disabled={loading} variant="solid" color="danger">
          Revoke Agent
        </Button>
      </div>

      {/* ✅ Confirmation Modal for Assigning an Agent */}
      <ConfirmationModal
        isOpen={isAssignOpen}
        onClose={onAssignClose}
        title="Confirm Agent Selection"
        message={`You are about to assign ${selectedAgent} as your agent. They will be able to **view your AI-generated plans** but **won't be able to edit them**. This action **can be revoked later** if needed.`}
        onConfirm={confirmAgentSelection}
      />

      {/* ✅ Confirmation Modal for Revoking an Agent */}
      <ConfirmationModal
        isOpen={isRevokeOpen}
        onClose={onRevokeClose}
        title="Confirm Agent Revocation"
        message="Are you sure you want to revoke your current agent? This will remove their access, and you will need to select a new agent if required."
        onConfirm={confirmRevokeAgent}
      />
    </div>
  );
};

export default RefereeSettings;

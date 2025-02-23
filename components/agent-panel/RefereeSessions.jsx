import { useState } from "react";
import { Select, SelectItem, Card, Button } from "@heroui/react";
import { useRefereesList } from "@/lib/hooks/useRefereesList";
import { useAuth } from "@/lib/AuthContext";
import Sessions from "./Sessions";
import logger from "@/lib/logger";
import { IconReload, IconUserX } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "react-tooltip";

const RefereeSessionsTab = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const { refereesList, loading, error, fetchReferees, revokeReferee } =
    useRefereesList(userId);
  const [selectedReferee, setSelectedReferee] = useState(new Set([]));

  // find array item by key
  const getReferee = (key) => {
    return refereesList.find((item) => item.key === key);
  };

  const handleRevokeReferee = async (email) => {
    // log email
    logger.info(`Revoking referee: ${email}`);
    revokeReferee(email);
    setSelectedReferee(new Set([]));
    }

  return (
    <div className="space-y-4 min-h-[200px]">
      <div className="flex space-x-2 justify-between md:justify-center">
        <Button id="refresh" className="min-w-0" onPress={fetchReferees}>
          <IconReload className="text-accentMint" />
        </Button>
        <Button id="revoke" className="min-w-0" onPress={() => handleRevokeReferee(selectedReferee.currentKey)}>
          <IconUserX className="text-danger" />
        </Button>
      </div>
      <div className="relative min-h-[60px]">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.p
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute w-full text-center"
            >
              Loading referees...
            </motion.p>
          ) : error ? (
            <motion.p
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute w-full text-red-500 text-center"
            >
              Error: {error}
            </motion.p>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Select
                label="Select a Referee"
                variant="underlined"
                placeholder="Choose..."
                items={refereesList}
                selectionMode="single"
                onSelectionChange={setSelectedReferee}
              >
                {(referee) => (
                  <SelectItem key={referee.key}>{referee.label}</SelectItem>
                )}
              </Select>
              <div>
                {selectedReferee.currentKey && (
                  <div className="rounded-lg space-y-10 mt-4">
                    <Card className="max-w-sm mx-auto flex flex-col p-4 border">
                      <p className="flex justify-between pb-4 break-all">
                        {selectedReferee.currentKey}
                      </p>
                      <p className="flex justify-between">
                        <span className="font-semibold">
                          Allocated credits:
                        </span>
                        <span>
                          {
                            getReferee(selectedReferee.currentKey)
                              ?.allocated_credits
                          }
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="font-semibold">Signup status:</span>
                        <span>
                          {getReferee(selectedReferee.currentKey)
                            ?.transfer_completion_date || "Pending"}
                        </span>
                      </p>
                    </Card>
                    <Sessions
                      userId={getReferee(selectedReferee.currentKey)?.user_id}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Tooltip anchorSelect="#refresh" place="top">
        Refresh Referees
      </Tooltip>
      <Tooltip anchorSelect="#revoke" place="top">
        Revoke Selected Referee
      </Tooltip>
    </div>
  );
};

export default RefereeSessionsTab;

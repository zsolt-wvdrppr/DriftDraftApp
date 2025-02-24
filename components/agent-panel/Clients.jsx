import { useState, useEffect } from "react";
import { Select, SelectItem, Card, Button } from "@heroui/react";
import { useRefereesList } from "@/lib/hooks/useRefereesList";
import { useAuth } from "@/lib/AuthContext";
import Sessions from "./Sessions";
import logger from "@/lib/logger";
import {
  IconReload,
  IconUserX,
  IconBan,
  IconCheck,
  IconHourglassHigh,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "react-tooltip";
import { formatDateToLocalBasic } from "@/lib/utils/utils";

const RefereeSessionsTab = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const {
    refereesList,
    loading,
    error,
    fetchReferees,
    revokeReferee,
  } = useRefereesList();
  const [selectedReferee, setSelectedReferee] = useState(new Set([]));
  const [refereeUserId, setRefereeUserId] = useState(null);

  const handleSelectedRefereeUpdate = () => {
    if (selectedReferee?.key) {
      const updatedReferee = refereesList.find(
        (ref) => ref.key === selectedReferee.key
      );
      if (updatedReferee) {
        setSelectedReferee(updatedReferee);
        setRefereeUserId(updatedReferee?.user_id);
      } else {
        setSelectedReferee(new Set([]));
        setRefereeUserId(null);
      }
    }
  };

   // ✅ Keep selectedReferee in sync with refereesList
   useEffect(() => {
    handleSelectedRefereeUpdate();
   }, [selectedReferee]); 

   const handleReloadReferees = async () => {
    await fetchReferees();
    handleSelectedRefereeUpdate();
  };
  
  const handleRevokeReferee = async (email) => {
    if (!email) return;
  
    logger.info(`Revoking referee: ${email}`);
  
    await revokeReferee(email); // ✅ Call the API to revoke the referee
    await fetchReferees(); // ✅ Immediately refresh referees list
    setSelectedReferee(new Set([])); // ✅ Clear selection after revoking
  };

  return (
    <div className="space-y-4 min-h-[200px]">
      <div className="flex space-x-2 justify-between md:justify-center">
        <Button id="refresh" className="min-w-0" onPress={handleReloadReferees}>
          <IconReload className="text-accentMint" />
        </Button>
        <Button
          id="revoke"
          className="min-w-0"
          onPress={() => handleRevokeReferee(selectedReferee.email)}
        >
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
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0]; // Extract the selected key
                  const selectedRef = refereesList.find(
                    (ref) => ref.key === key
                  ); // Find full object
                  setSelectedReferee(selectedRef || {}); // Store full referee object in state
                }}
              >
                {(referee) => (
                  <SelectItem key={referee?.key}>{referee?.email}</SelectItem>
                )}
              </Select>
              <div>
                {selectedReferee?.key && (
                  <div className="rounded-lg space-y-10 mt-4">
                    <Card className="max-w-sm mx-auto flex flex-col p-4 border gap-y-2">
                      <p className="flex justify-between pb-2 break-all">
                        {selectedReferee?.email}
                      </p>
                      <p className="flex justify-between">
                        <span className="font-semibold">Status:</span>
                        <span className="flex gap-x-2">
                          {selectedReferee?.rejected && (
                            <>
                              {`Rejected`} <IconBan className="text-danger" />
                            </>
                          )}
                          {selectedReferee?.accepted &&
                            !selectedReferee.rejected && (
                              <>
                                {`Accepted`}{" "}
                                <IconCheck className="text-success" />
                              </>
                            )}
                          {selectedReferee?.rejected === false &&
                            selectedReferee?.accepted === false && (
                              <>
                                {`Pending`}
                                <IconHourglassHigh className="text-warning" />
                              </>
                            )}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="font-semibold">Invitation Sent:</span>
                        <span>
                          {formatDateToLocalBasic(selectedReferee?.timestamp)}
                        </span>
                      </p>
                    </Card>
                    <Sessions userId={refereeUserId} />
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

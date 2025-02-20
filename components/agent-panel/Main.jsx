"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Select,
  SelectItem,
  Divider,
} from "@heroui/react";
import { useRefereesList } from "@/lib/hooks/useRefereesList";
import { useAuth } from "@/lib/AuthContext";
import Sessions from "./Sessions";
import logger from "@/lib/logger";

export default function AgentPanel() {
  const { user } = useAuth();
  const userId = user?.id;
  const { refereesList, loading, error } = useRefereesList(userId);
  const [selectedReferee, setSelectedReferee] = useState(new Set([]));
  const [isAgentMode, setIsAgentMode] = useState(false);

  // log selectedReferee when changes
  useEffect(() => {
    logger.debug(
      `[SELECTED REFEREE] - Selected Referee changed:`,
      selectedReferee
    );
    // log refereesList when changes
    logger.debug(`[REFEREES LIST] - Referees List changed:`, refereesList);
  }, [selectedReferee, refereesList]);

  // find array item by key
  const getReferee = (key) => {
    const item = refereesList.find((item) => item.key === key);

    logger.debug(`[REFEREE] - Found Referee:`, item);
    return item;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      <Divider />
      <h1 className="text-2xl font-semibold">Agent Panel</h1>
      <Button color={"primary"} onPress={() => setIsAgentMode(!isAgentMode)}>
        {isAgentMode ? "Hide Agent Dashboard" : "Show Agent Dashboard"}
      </Button>
      {isAgentMode && (
        <Card shadow="md" radius="lg" fullWidth>
          <CardHeader>
            <h2 className="text-lg font-semibold">Agent Dashboard</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Tabs radius="lg" color={"primary"} variant={"bordered"}>
              <Tab title="Referrals">
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      placeholder="Referral link"
                      value="https://app.com/referral/agent123"
                      readOnly
                      classNames={{
                        label: "!text-primary dark:!text-accentMint",
                        input: "dark:!text-white",
                        inputWrapper:
                          "bg-primary/10 dark:bg-content1 border focus-within:!bg-content1",
                      }}
                    />
                    <Button>Copy</Button>
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="Credits to allocate"
                      min="5"
                      classNames={{
                        label: "!text-primary dark:!text-accentMint",
                        input: "dark:!text-white",
                        inputWrapper:
                          "bg-primary/10 dark:bg-content1 border focus-within:!bg-content1",
                      }}
                    />
                    <Button>Allocate</Button>
                  </div>
                </div>
              </Tab>

              <Tab title="Referee Sessions">
                <div className="space-y-4">
                  {loading ? (
                    <p>Loading referees...</p>
                  ) : error ? (
                    <p className="text-red-500">Error: {error}</p>
                  ) : (
                    <>
                      <Select
                        label="Select a Referee"
                        variant="underlined"
                        placeholder="Choose..."
                        items={refereesList}
                        selectionMode="single"
                        onSelectionChange={setSelectedReferee}
                      >
                        {(referee) => (
                          <SelectItem key={referee.key}>
                            {referee.label}
                          </SelectItem>
                        )}
                      </Select>
                      <div>
                        {selectedReferee.currentKey && (
                          <div className="p-4 border rounded-lg space-y-10">
                            <Card className="max-w-sm mx-auto flex flex-col p-4 border">
                              <p className="flex justify-between">
                                <span className="font-semibold">Email:</span>
                                <span>{selectedReferee.currentKey}</span>
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
                                <span className="font-semibold">
                                  Signup status:
                                </span>
                                <span>
                                  {getReferee(selectedReferee.currentKey)
                                    ?.transfer_completion_date || "Pending"}
                                </span>
                              </p>
                            </Card>
                            <Sessions
                              userId={
                                getReferee(selectedReferee.currentKey)?.user_id
                              }
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </Tab>
            </Tabs>
          </CardBody>
          <CardFooter>
            <p className="text-sm text-gray-500">
              Manage your referrals and review referee sessions.
            </p>
          </CardFooter>
        </Card>
      )}
    </motion.div>
  );
}

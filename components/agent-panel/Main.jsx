"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Tabs,
  Tab,
  Button,
  Divider,
} from "@heroui/react";

import RefereeSessionsTab from "./RefereeSessions";
import AddRefereeTab from "./AddReferee";

export default function AgentPanel() {
  const [isAgentMode, setIsAgentMode] = useState(false);
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
      <AnimatePresence>
        {true && (
          <motion.div
            key="agent-dashboard"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            <Card shadow="md" radius="lg" fullWidth>
              <CardHeader>
                <h2 className="text-lg font-semibold">Agent Dashboard</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <Tabs radius="lg" color={"primary"} variant={"bordered"}>
                  <Tab title="Referrals">
                    <AddRefereeTab />
                  </Tab>
                  <Tab title="Referee Sessions">
                    <RefereeSessionsTab />
                  </Tab>
                </Tabs>
              </CardBody>
              <CardFooter>
                <p className="text-sm text-gray-500">
                  Manage your referrals and review referee sessions.
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
